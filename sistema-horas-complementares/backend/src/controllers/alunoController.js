const pool = require('../config/database');
const jwt = require('jsonwebtoken');
const registrarLog = require('../utils/logger');
const { emailNovaSubmissao } = require('../services/emailService');
const { processarEInserirArquivo } = require('./uploadController');
const fs = require('fs');
const path = require('path');

/**
 * POST /aluno/submissao
 * Cria uma submissão e já processa múltiplos arquivos de certificado no mesmo request.
 * Campo multipart: "certificados" (múltiplos arquivos, obrigatório ao menos um).
 */
exports.postSubmeterAtividade = async (req, res) => {
    const {
        course_id,
        category_id,
        title,
        description,
        institution_name,
        certificate_number,
        organizer_name,
        requested_hours,
        activity_date
    } = req.body;

    const user_id = req.usuario.id;
    const arquivos = req.files || [];

    if (arquivos.length === 0) {
        return res.status(400).json({
            erro: 'É obrigatório enviar ao menos um arquivo de certificado.'
        });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const userCourse = await client.query(
            `SELECT id FROM user_courses
             WHERE user_id = $1 AND course_id = $2 AND is_active = true`,
            [user_id, course_id]
        );

        if (userCourse.rows.length === 0) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(403).json({
                erro: 'Você não está matriculado neste curso.'
            });
        }

        const user_course_id = userCourse.rows[0].id;

        const regra = await client.query(
            `SELECT * FROM course_activity_rules
             WHERE course_id = $1 AND category_id = $2`,
            [course_id, category_id]
        );

        if (regra.rows.length === 0) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(404).json({
                erro: 'Categoria não permitida para este curso.'
            });
        }

        const resultado = await client.query(
            `INSERT INTO submissions
             (user_course_id, category_id, title, description,
              institution_name, certificate_number, organizer_name,
              requested_hours, activity_date, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'submitted')
             RETURNING *`,
            [
                user_course_id,
                category_id,
                title,
                description,
                institution_name,
                certificate_number,
                organizer_name,
                requested_hours,
                activity_date
            ]
        );

        const submissao = resultado.rows[0];

        const arquivosInseridos = await Promise.all(
            arquivos.map(file =>
                processarEInserirArquivo(
                    client,
                    submissao.id,
                    file
                )
            )
        );

        const erroCriticoIA = arquivosInseridos.some(arq => arq.erro);
        if (erroCriticoIA) {
            throw new Error('Falha crítica no processamento dos certificados. Envio cancelado.');
        }

        const coordenadores = await client.query(
            `SELECT u.id, u.email, u.full_name
             FROM course_coordinators cc
             JOIN users u ON u.id = cc.user_id
             WHERE cc.course_id = $1 AND cc.is_active = true`,
            [course_id]
        );

        for (const coord of coordenadores.rows) {
            await client.query(
                `INSERT INTO notifications (user_id, submission_id, type, title, message)
                 VALUES ($1, $2, 'submission_created', $3, $4)`,
                [
                    coord.id,
                    submissao.id,
                    `Nova submissão: ${title}`,
                    `O aluno submeteu uma nova atividade para avaliação.`
                ]
            );
        }

        await registrarLog(req.usuario.id, 'CRIAR_SUBMISSAO', 'submissions', submissao.id, {
            title, course_id, category_id, total_arquivos: arquivosInseridos.length
        });

        await client.query('COMMIT');

        for (const coord of coordenadores.rows) {
            emailNovaSubmissao(coord.email, title).catch(err =>
                console.error(`[Aviso] Falha ao enviar e-mail para ${coord.email}:`, err.message)
            );
        }

        res.status(201).json({
            mensagem: 'Atividade submetida com sucesso!',
            submissao,
            arquivos: arquivosInseridos
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Transação abortada devido ao erro:", err.message);

        res.status(500).json({
            erro: 'Não foi possível processar a sua submissão.',
            detalhe: err.message
        });

    } finally {
        client.release();
    }
};

exports.putEditarSubmissao = async (req, res) => {
    const { id } = req.params;
    const { title, description, requested_hours, activity_date } = req.body;
    const user_id = req.usuario.id;

    try {
        const submissao = await pool.query(
            `SELECT s.*
             FROM submissions s
             JOIN user_courses uc ON uc.id = s.user_course_id
             WHERE s.id = $1 AND uc.user_id = $2`,
            [id, user_id]
        );

        if (submissao.rows.length === 0) {
            return res.status(404).json({ erro: 'Submissão não encontrada.' });
        }

        const statusEditaveis = ['submitted', 'returned_for_adjustment'];
        if (!statusEditaveis.includes(submissao.rows[0].status)) {
            return res.status(400).json({
                erro: 'Só é possível editar submissões pendentes ou devolvidas para ajuste.'
            });
        }

        const resultado = await pool.query(
            `UPDATE submissions
             SET title = $1,
                 description = $2,
                 requested_hours = $3,
                 activity_date = $4,
                 updated_at = NOW()
             WHERE id = $5
             RETURNING *`,
            [title, description, requested_hours, activity_date, id]
        );

        await registrarLog(req.usuario.id, 'EDITAR_SUBMISSAO', 'submissions', id, { title });
        res.status(200).json({ mensagem: 'Submissão atualizada!', submissao: resultado.rows[0] });

    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

exports.deleteSubmissao = async (req, res) => {
    const { id } = req.params;
    const user_id = req.usuario.id;
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const submissao = await client.query(
            `SELECT s.*
             FROM submissions s
             JOIN user_courses uc ON uc.id = s.user_course_id
             WHERE s.id = $1 AND uc.user_id = $2`,
            [id, user_id]
        );

        if (submissao.rows.length === 0) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(404).json({ erro: 'Submissão não encontrada.' });
        }

        if (submissao.rows[0].status !== 'submitted') {
            await client.query('ROLLBACK');
            client.release();
            return res.status(400).json({
                erro: 'Só é possível deletar submissões ainda não avaliadas.'
            });
        }

        // Buscar caminhos dos arquivos físicos
        const files = await client.query(
            `SELECT storage_path FROM submission_files WHERE submission_id = $1`,
            [id]
        );

        // Deletar do banco de dados (tabelas relacionadas e a principal)
        await client.query(`DELETE FROM submission_files WHERE submission_id = $1`, [id]);
        await client.query(`DELETE FROM notifications WHERE submission_id = $1`, [id]);
        await client.query(`DELETE FROM submissions WHERE id = $1`, [id]);

        await client.query('COMMIT');
        client.release();

        // Deletar arquivos físicos do disco
        for (const file of files.rows) {
            if (file.storage_path) {
                const filename = path.basename(file.storage_path);
                const physicalPath = path.join(__dirname, '../../uploads', filename);
                if (fs.existsSync(physicalPath)) {
                    try {
                        fs.unlinkSync(physicalPath);
                    } catch (unlinkErr) {
                        console.error(`Erro ao deletar arquivo físico ${physicalPath}:`, unlinkErr);
                    }
                }
            }
        }

        await registrarLog(req.usuario.id, 'DELETAR_SUBMISSAO', 'submissions', id, {});
        res.status(200).json({ mensagem: 'Submissão deletada com sucesso!' });

    } catch (err) {
        try {
            await client.query('ROLLBACK');
        } catch (rollbackErr) {
            // ignorar
        }
        client.release();
        res.status(500).json({ erro: err.message });
    }
};

exports.getMinhasSubmissoes = async (req, res) => {
    const user_id = req.usuario.id;
    const { status, course_id } = req.query;

    try {
        let params = [user_id];
        let filtros = '';

        if (status) {
            const statusUpper = status.toUpperCase();
            if (statusUpper === 'PENDENTE') {
                filtros += ` AND s.status NOT IN ('approved', 'rejected')`;
            } else if (statusUpper !== 'ALL' && statusUpper !== 'TODAS') {
                filtros += ` AND s.status = $${params.length + 1}::submission_status_enum`;
                params.push(status);
            }
        }

        if (course_id) {
            filtros += ` AND uc.course_id = $${params.length + 1}`;
            params.push(course_id);
        }

        const resultado = await pool.query(
            `SELECT *
             FROM view_submissoes_alunos
             WHERE user_id = $1
             ${filtros}
             ORDER BY submitted_at DESC`,
            params
        );

        res.status(200).json(resultado.rows);

    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

exports.getResumoHoras = async (req, res) => {
    const user_id = req.usuario.id;
    let { course_id } = req.params;

    try {
        if (!course_id || course_id === 'undefined') {
            const defaultCourse = await pool.query(
                `SELECT course_id FROM user_courses WHERE user_id = $1 AND is_active = true LIMIT 1`,
                [user_id]
            );
            if (defaultCourse.rows.length === 0) {
                return res.status(404).json({ erro: 'Aluno não matriculado em nenhum curso ativo.' });
            }
            course_id = defaultCourse.rows[0].course_id;
        }

        const userCourse = await pool.query(
            `SELECT uc.id as user_course_id, uc.course_id, c.name as course_name, c.minimum_required_hours
             FROM user_courses uc
             JOIN courses c ON c.id = uc.course_id
             WHERE uc.user_id = $1 AND uc.course_id = $2 AND uc.is_active = true`,
            [user_id, course_id]
        );

        if (userCourse.rows.length === 0) {
            return res.status(404).json({ erro: 'Aluno não matriculado neste curso.' });
        }

        const { user_course_id, course_name, minimum_required_hours } = userCourse.rows[0];

        // Buscar insights específicos do aluno
        let insights = [];
        let recomendacoes = [];
        try {
            const insightsRes = await pool.query(
                `SELECT titulo, descricao, nivel_alerta
                 FROM insights
                 WHERE perfil_destino = 'aluno' AND referencia_id = $1
                 ORDER BY id DESC`,
                [user_course_id]
            );
            insights = insightsRes.rows;
        } catch (e) {
            console.warn('[alunoController] Erro ao buscar insights do aluno:', e.message);
        }

        try {
            const recomendacoesRes = await pool.query(
                `SELECT titulo, recomendacao, motivo, prioridade
                 FROM recomendacoes
                 WHERE perfil_destino = 'aluno' AND referencia_id = $1
                 ORDER BY id DESC`,
                [user_course_id]
            );
            recomendacoes = recomendacoesRes.rows;
        } catch (e) {
            console.warn('[alunoController] Erro ao buscar recomendações do aluno:', e.message);
        }

        const regras = await pool.query(
            `SELECT car.*, cat.name as category_name
             FROM course_activity_rules car
             JOIN categories cat ON cat.id = car.category_id
             WHERE car.course_id = $1`,
            [course_id]
        );

        const aprovadas = await pool.query(
            `SELECT s.category_id, SUM(s.approved_hours) as total_aprovado
             FROM submissions s
             JOIN user_courses uc ON uc.id = s.user_course_id
             WHERE uc.user_id = $1 AND uc.course_id = $2 AND s.status = 'approved'
             GROUP BY s.category_id`,
            [user_id, course_id]
        );

        const emAnalise = await pool.query(
            `SELECT SUM(s.requested_hours) as total_pendente
             FROM submissions s
             JOIN user_courses uc ON uc.id = s.user_course_id
             WHERE uc.user_id = $1 AND uc.course_id = $2 AND s.status NOT IN ('approved', 'rejected')`,
            [user_id, course_id]
        );

        const aprovadasMap = {};
        aprovadas.rows.forEach(r => {
            aprovadasMap[r.category_id] = parseFloat(r.total_aprovado) || 0;
        });

        const limites = regras.rows.map(regra => {
            const horasAprovadas = Math.round(aprovadasMap[regra.category_id] || 0);
            return {
                category_id: regra.category_id,
                categoria: regra.category_name,
                min_horas: regra.min_hours,
                max_horas: regra.max_hours,
                horas_aprovadas: horasAprovadas,
                percentual: Math.round(Math.min(100, (horasAprovadas / regra.max_hours) * 100))
            };
        });

        const rawTotal = Object.values(aprovadasMap).reduce((a, b) => a + b, 0);
        const totalIntegralizado = Math.round(rawTotal);

        res.status(200).json({
            course_id: parseInt(course_id),
            curso: course_name,
            total_obrigatorio: minimum_required_hours,
            total_integralizado: totalIntegralizado,
            total_em_analise: Math.round(parseFloat(emAnalise.rows[0].total_pendente) || 0),
            percentual_total: Math.round(Math.min(100, (totalIntegralizado / minimum_required_hours) * 100)),
            limites,
            insights,
            recomendacoes
        });

    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

exports.getMeusDados = async (req, res) => {
    const user_id = req.usuario.id;

    try {
        const aluno = await pool.query(
            `SELECT u.full_name as nome, u.email, c.name as curso_nome
             FROM users u
             LEFT JOIN user_courses uc ON uc.user_id = u.id AND uc.is_active = true
             LEFT JOIN courses c ON c.id = uc.course_id
             WHERE u.id = $1
             LIMIT 1`,
            [user_id]
        );

        const cursos = await pool.query(
            `SELECT 
                 c.id,
                 c.name,
                 c.code,
                 c.minimum_required_hours,
                 c.is_active,
                 c.modalidade,
                 c.turno,
                 c.semestres,
                 uc.status_matricula,
                 uc.user_id
             FROM user_courses uc
             JOIN courses c ON c.id = uc.course_id
             WHERE uc.user_id = $1 AND uc.is_active = true AND c.is_active = true`,
            [user_id]
        );

        const stats = await pool.query(
            `SELECT
                COUNT(*) as total_submissoes,
                COUNT(*) FILTER (WHERE status NOT IN ('approved', 'rejected')) as pendentes,
                SUM(approved_hours) as horas_aprovadas
             FROM submissions s
             JOIN user_courses uc ON uc.id = s.user_course_id
             WHERE uc.user_id = $1`,
            [user_id]
        );

        res.status(200).json({
            aluno: aluno.rows[0],
            cursos: cursos.rows,
            total_submissoes: parseInt(stats.rows[0].total_submissoes) || 0,
            pendentes: parseInt(stats.rows[0].pendentes) || 0,
            horas_aprovadas: Math.round(parseFloat(stats.rows[0].horas_aprovadas) || 0)
        });

    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

exports.getCursos = async (req, res) => {
    const user_id = req.usuario.id;
    try {
        const resultado = await pool.query(
            `SELECT 
                 c.id,
                 c.name,
                 c.code,
                 c.minimum_required_hours,
                 c.is_active,
                 c.modalidade,
                 c.turno,
                 c.semestres,
                 uc.status_matricula,
                 uc.user_id
             FROM user_courses uc
             JOIN courses c ON c.id = uc.course_id
             WHERE uc.user_id = $1 AND uc.is_active = true AND c.is_active = true`,
            [user_id]
        );
        res.status(200).json(resultado.rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

exports.getNotificacoes = async (req, res) => {
    const user_id = req.usuario.id;
    try {
        const resultado = await pool.query(
            `SELECT * FROM notifications
             WHERE user_id = $1
             ORDER BY created_at DESC`,
            [user_id]
        );
        res.status(200).json(resultado.rows);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

exports.postMarcarTodasLidas = async (req, res) => {
    const user_id = req.usuario.id;
    try {
        await pool.query(
            `UPDATE notifications
             SET is_read = true, read_at = NOW()
             WHERE user_id = $1 AND is_read = false`,
            [user_id]
        );
        res.status(200).json({ mensagem: "Notificações marcadas como lidas com sucesso!" });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

exports.getExtratoPrint = async (req, res) => {
    const { token } = req.query;
    if (!token) {
        return res.status(401).send("<h1>Acesso negado: Token não fornecido.</h1>");
    }

    try {
        const dados = jwt.verify(token, process.env.JWT_SECRET);
        const user_id = dados.id;

        // 1. Dados do aluno e curso ativo
        const defaultCourse = await pool.query(
            `SELECT course_id FROM user_courses WHERE user_id = $1 AND is_active = true LIMIT 1`,
            [user_id]
        );
        if (defaultCourse.rows.length === 0) {
            return res.status(404).send("<h1>Aluno não matriculado em nenhum curso ativo.</h1>");
        }
        const course_id = defaultCourse.rows[0].course_id;

        const userCourse = await pool.query(
            `SELECT uc.course_id, c.name as course_name, c.minimum_required_hours
             FROM user_courses uc
             JOIN courses c ON c.id = uc.course_id
             WHERE uc.user_id = $1 AND uc.course_id = $2 AND uc.is_active = true`,
            [user_id, course_id]
        );

        if (userCourse.rows.length === 0) {
            return res.status(404).send("<h1>Aluno não matriculado neste curso.</h1>");
        }

        const { course_name, minimum_required_hours } = userCourse.rows[0];

        // 2. Estatísticas Gerais
        const stats = await pool.query(
            `SELECT
                COUNT(*) as total_submissoes,
                SUM(approved_hours) as horas_aprovadas
             FROM submissions s
             JOIN user_courses uc ON uc.id = s.user_course_id
             WHERE uc.user_id = $1 AND uc.course_id = $2`,
            [user_id, course_id]
        );

        // 3. Submissões
        const submissoes = await pool.query(
            `SELECT *
             FROM view_submissoes_alunos
             WHERE user_id = $1 AND course_id = $2
             ORDER BY submitted_at DESC`,
            [user_id, course_id]
        );

        // 4. Limites por categoria
        const regras = await pool.query(
            `SELECT car.*, cat.name as category_name
             FROM course_activity_rules car
             JOIN categories cat ON cat.id = car.category_id
             WHERE car.course_id = $1`,
            [course_id]
        );

        const aprovadas = await pool.query(
            `SELECT s.category_id, SUM(s.approved_hours) as total_aprovado
             FROM submissions s
             JOIN user_courses uc ON uc.id = s.user_course_id
             WHERE uc.user_id = $1 AND uc.course_id = $2 AND s.status = 'approved'
             GROUP BY s.category_id`,
            [user_id, course_id]
        );

        const aprovadasMap = {};
        aprovadas.rows.forEach(r => {
            aprovadasMap[r.category_id] = parseFloat(r.total_aprovado) || 0;
        });

        const limites = regras.rows.map(regra => {
            const horasAprovadas = Math.round(aprovadasMap[regra.category_id] || 0);
            return {
                categoria: regra.category_name,
                min_horas: regra.min_hours,
                max_horas: regra.max_hours,
                horas_aprovadas: horasAprovadas
            };
        });

        const totalIntegralizado = Math.round(Object.values(aprovadasMap).reduce((a, b) => a + b, 0));
        const percentual = Math.round(Math.min(100, (totalIntegralizado / minimum_required_hours) * 100));

        const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Extrato de Atividades Complementares - ${dados.email}</title>
    <style>
        body {
            font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
            color: #334155;
            margin: 0;
            padding: 30px;
            background-color: #ffffff;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #1B3A6B;
            padding-bottom: 15px;
            margin-bottom: 30px;
        }
        .logo-title {
            color: #1B3A6B;
            font-size: 24px;
            font-weight: 800;
        }
        .logo-sub {
            color: #E87722;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 1px;
        }
        h1, h2 {
            color: #1B3A6B;
        }
        h1 {
            font-size: 22px;
            margin-top: 0;
        }
        h2 {
            font-size: 16px;
            border-bottom: 1px solid #E2E8F0;
            padding-bottom: 5px;
            margin-top: 30px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 30px;
            background-color: #F8FAFC;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #E2E8F0;
        }
        .info-item {
            font-size: 14px;
        }
        .info-label {
            font-weight: 700;
            color: #64748B;
            margin-bottom: 4px;
        }
        .info-value {
            font-size: 16px;
            font-weight: 600;
            color: #1B3A6B;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }
        th, td {
            text-align: left;
            padding: 10px 12px;
            border-bottom: 1px solid #E2E8F0;
            font-size: 13px;
        }
        th {
            background-color: #F1F5F9;
            color: #1B3A6B;
            font-weight: 700;
        }
        .badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: 700;
            font-size: 11px;
            display: inline-block;
        }
        .badge-approved { background-color: #D1FAE5; color: #065F46; }
        .badge-pending { background-color: #FEF3C7; color: #92400E; }
        .badge-rejected { background-color: #FEE2E2; color: #991B1B; }
        .badge-returned { background-color: #E0F2FE; color: #075985; }
        .no-print {
            text-align: right;
            margin-bottom: 20px;
        }
        .btn-print {
            background-color: #E87722;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: 700;
            border-radius: 6px;
            cursor: pointer;
        }
        .btn-print:hover {
            background-color: #D96915;
        }
        @media print {
            .no-print { display: none; }
            body { padding: 0; }
        }
    </style>
</head>
<body>
    <div class="no-print">
        <button class="btn-print" onclick="window.print()">IMPRIMIR / EXPORTAR PDF</button>
    </div>

    <div class="header">
        <div style="display: flex; align-items: center; gap: 15px;">
            <img src="/assets/logo_senac.png" alt="Senac Logo" style="height: 50px; object-fit: contain;">
            <div>
                <div class="logo-title" style="font-size: 18px; margin: 0;">PORTAL DE HORAS COMPLEMENTARES</div>
                <div class="logo-sub" style="font-size: 11px; margin: 0; letter-spacing: 0.5px;">EXTRATO ACADÊMICO OFICIAL</div>
            </div>
        </div>
        <div style="text-align: right; font-size: 12px; color: #64748B;">
            Gerado em ${new Date().toLocaleDateString('pt-BR')}<br>${new Date().toLocaleTimeString('pt-BR')}
        </div>
    </div>

    <h1>Extrato de Atividades Acadêmicas</h1>

    <div class="info-grid">
        <div class="info-item">
            <div class="info-label">ALUNO</div>
            <div class="info-value">${dados.email}</div>
        </div>
        <div class="info-item">
            <div class="info-label">CURSO</div>
            <div class="info-value">${course_name}</div>
        </div>
        <div class="info-item">
            <div class="info-label">PROGRESSO DE HORAS</div>
            <div class="info-value">${totalIntegralizado}h de ${minimum_required_hours}h (${Math.round(percentual)}%)</div>
        </div>
        <div class="info-item">
            <div class="info-label">TOTAL DE SUBMISSÕES</div>
            <div class="info-value">${stats.rows[0].total_submissoes || 0} atividades</div>
        </div>
    </div>

    <h2>Limites e Integralização por Categoria</h2>
    <table>
        <thead>
            <tr>
                <th>CATEGORIA</th>
                <th>MÍNIMO EXIGIDO</th>
                <th>MÁXIMO PERMITIDO</th>
                <th>TOTAL INTEGRALIZADO</th>
            </tr>
        </thead>
        <tbody>
            ${limites.map(l => `
                <tr>
                    <td>${l.categoria}</td>
                    <td>${l.min_horas}h</td>
                    <td>${l.max_horas}h</td>
                    <td style="font-weight: 700; color: ${l.horas_aprovadas >= l.max_horas ? '#065F46' : '#334155'}">${l.horas_aprovadas}h</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <h2>Histórico de Submissões</h2>
    <table>
        <thead>
            <tr>
                <th>TÍTULO DO CERTIFICADO</th>
                <th>CATEGORIA</th>
                <th>DATA DE SUBMISSÃO</th>
                <th>HORAS SOLICITADAS</th>
                <th>HORAS APROVADAS</th>
                <th>STATUS</th>
            </tr>
        </thead>
        <tbody>
            ${submissoes.rows.map(s => {
            const status = (s.status || 'submitted').toLowerCase();
            let badgeClass = 'badge-pending';
            let statusLabel = 'EM ANÁLISE';
            if (status === 'approved' || status === 'aprovado') { badgeClass = 'badge-approved'; statusLabel = 'APROVADO'; }
            else if (status === 'rejected' || status === 'rejeitado') { badgeClass = 'badge-rejected'; statusLabel = 'REJEITADO'; }
            else if (status === 'returned_for_adjustment') { badgeClass = 'badge-returned'; statusLabel = 'DEVOLVIDO'; }

            const dateStr = s.submitted_at || s.created_at;
            const formattedDate = dateStr ? new Date(dateStr).toLocaleDateString('pt-BR') : '—';

            return `
                    <tr>
                        <td><strong>${s.title}</strong><br><small style="color: #64748B;">${s.institution_name || ''}</small></td>
                        <td>${(s.category_name || 'Geral').toUpperCase()}</td>
                        <td>${formattedDate}</td>
                        <td>${s.requested_hours}h</td>
                        <td>${s.approved_hours !== null ? s.approved_hours + 'h' : '—'}</td>
                        <td><span class="badge ${badgeClass}">${statusLabel}</span></td>
                    </tr>
                `;
        }).join('')}
        </tbody>
    </table>

    <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 500);
        };
    </script>
</body>
</html>
        `;

        res.status(200).send(html);

    } catch (err) {
        console.error(err);
        res.status(401).send("<h1>Acesso negado: Token inválido.</h1>");
    }
};