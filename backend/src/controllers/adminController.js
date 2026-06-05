const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const registrarLog = require('../utils/logger');

exports.postCriarCurso = async (req, res) => {
    const { name, code, minimum_required_hours, description, modalidade, turno, semestres, coordinator_id } = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const resultado = await client.query(
            `INSERT INTO courses (name, code, minimum_required_hours, description, modalidade, turno, semestres)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [name, code, minimum_required_hours, description, modalidade, turno, semestres]
        );
        
        const cursoId = resultado.rows[0].id;

        if (coordinator_id) {
            await client.query(
                `INSERT INTO course_coordinators (user_id, course_id) VALUES ($1, $2)`,
                [coordinator_id, cursoId]
            );
        }

        await client.query('COMMIT');
        await registrarLog(req.usuario.id, 'CRIAR_CURSO', 'courses', cursoId, { name, code });
        res.status(201).json({ mensagem: "Curso criado!", curso: resultado.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ erro: err.message });
    } finally {
        client.release();
    }
};

exports.getListaCursos = async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT
                c.*,
                u.id AS coordinator_id,
                u.full_name AS coordinator_name,
                u.email AS coordinator_email
             FROM courses c
             LEFT JOIN course_coordinators cc ON cc.course_id = c.id AND cc.is_active = true
             LEFT JOIN users u ON u.id = cc.user_id
             WHERE c.is_active = true
             ORDER BY c.name`
        );
        res.status(200).json(resultado.rows);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar cursos: " + err.message });
    }
};

exports.getCoordenadorPorCurso = async (req, res) => {
    const { course_id } = req.params;

    try {
        const resultado = await pool.query(
            `SELECT
                u.id, u.full_name, u.email, u.phone, u.status,
                cp.departamento, cp.cargo, cp.data_admissao,
                cc.assigned_at
             FROM course_coordinators cc
             JOIN users u ON u.id = cc.user_id
             LEFT JOIN coordinator_profiles cp ON cp.user_id = u.id
             WHERE cc.course_id = $1 AND cc.is_active = true`,
            [course_id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ erro: "Nenhum coordenador vinculado a este curso." });
        }

        res.status(200).json(resultado.rows[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

exports.putAtualizarCurso = async (req, res) => {
    const { id } = req.params;
    const { name, code, minimum_required_hours, description, modalidade, turno, semestres, coordinator_id } = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const resultado = await client.query(
            `UPDATE courses
             SET name = $1, code = $2, minimum_required_hours = $3, description = $4,
                 modalidade = $5, turno = $6, semestres = $7, updated_at = NOW()
             WHERE id = $8
             RETURNING *`,
            [name, code, minimum_required_hours, description, modalidade, turno, semestres, id]
        );

        if (resultado.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ erro: "Curso não encontrado." });
        }

        if (coordinator_id !== undefined) {
            await client.query(
                `UPDATE course_coordinators SET is_active = false WHERE course_id = $1`,
                [id]
            );

            if (coordinator_id) {
                await client.query(
                    `INSERT INTO course_coordinators (user_id, course_id)
                     VALUES ($1, $2)
                     ON CONFLICT (user_id, course_id) DO UPDATE SET is_active = true, assigned_at = NOW()`,
                    [coordinator_id, id]
                );
            }
        }

        await client.query('COMMIT');
        await registrarLog(req.usuario.id, 'ATUALIZAR_CURSO', 'courses', id, { name, code });
        res.status(200).json({ mensagem: "Curso atualizado!", curso: resultado.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ erro: err.message });
    } finally {
        client.release();
    }
};

exports.deleteCurso = async (req, res) => {
    const { id } = req.params;

    try {
        const resultado = await pool.query(
            `UPDATE courses SET is_active = false, updated_at = NOW()
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (resultado.rows.length === 0) {
            return res.status(404).json({ erro: "Curso não encontrado." });
        }

        await registrarLog(req.usuario.id, 'DELETAR_CURSO', 'courses', id, {});
        res.status(200).json({ mensagem: "Curso desativado com sucesso!" });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

exports.getListaCoordenadores = async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT *
            FROM view_coordenadores;`
        );
        res.status(200).json(resultado.rows);
    } catch (err) {
        res.status(500).json({ erro: "Erro ao buscar coordenadores: " + err.message });
    }
};

exports.postCadastrarCoordenador = async (req, res) => {
    const {
        full_name, email, cpf, phone, course_ids,
        departamento, cargo, data_nascimento, data_admissao, observacoes_internas
    } = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const senhaCripto = await bcrypt.hash('123456', 10);
        const novoUsuario = await client.query(
            `INSERT INTO users (full_name, email, password_hash, cpf, phone)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, full_name, email`,
            [full_name, email, senhaCripto, cpf, phone]
        );
        const userId = novoUsuario.rows[0].id;

        const role = await client.query(`SELECT id FROM roles WHERE name = 'coordinator'`);
        await client.query(
            `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)`,
            [userId, role.rows[0].id]
        );

        await client.query(
            `INSERT INTO coordinator_profiles
             (user_id, departamento, cargo, data_nascimento, data_admissao, observacoes_internas)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, departamento, cargo, data_nascimento, data_admissao, observacoes_internas]
        );

        if (course_ids && course_ids.length > 0) {
            for (const course_id of course_ids) {
                await client.query(
                    `UPDATE course_coordinators SET is_active = false
                     WHERE course_id = $1 AND is_active = true`,
                    [course_id]
                );

                await client.query(
                    `INSERT INTO course_coordinators (user_id, course_id)
                     VALUES ($1, $2)
                     ON CONFLICT (user_id, course_id) DO UPDATE SET is_active = true, assigned_at = NOW()`,
                    [userId, course_id]
                );
            }
        }

        await client.query('COMMIT');
        await registrarLog(req.usuario.id, 'CRIAR_COORDENADOR', 'users', userId, { full_name, email });
        res.status(201).json({ mensagem: "Coordenador cadastrado com sucesso!", coordenador: novoUsuario.rows[0] });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ erro: "Erro ao cadastrar: " + err.message });
    } finally {
        client.release();
    }
};

exports.putAtualizarCoordenador = async (req, res) => {
    const { id } = req.params;
    const {
        full_name, email, phone, course_ids,
        departamento, cargo, data_nascimento, data_admissao, observacoes_internas
    } = req.body;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const coord = await client.query(
            `SELECT u.id FROM users u
             JOIN user_roles ur ON ur.user_id = u.id
             JOIN roles r ON r.id = ur.role_id
             WHERE u.id = $1 AND r.name = 'coordinator'`,
            [id]
        );

        if (coord.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ erro: "Coordenador não encontrado." });
        }

        await client.query(
            `UPDATE users SET full_name = $1, email = $2, phone = $3, updated_at = NOW()
             WHERE id = $4`,
            [full_name, email, phone, id]
        );

        await client.query(
            `INSERT INTO coordinator_profiles
             (user_id, departamento, cargo, data_nascimento, data_admissao, observacoes_internas, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, NOW())
             ON CONFLICT (user_id) DO UPDATE
             SET departamento = $2, cargo = $3, data_nascimento = $4,
                 data_admissao = $5, observacoes_internas = $6, updated_at = NOW()`,
            [id, departamento, cargo, data_nascimento, data_admissao, observacoes_internas]
        );

        // Atualiza vínculos com cursos — cada curso só pode ter 1 coordenador ativo
        if (course_ids && course_ids.length > 0) {
            await client.query(
                `UPDATE course_coordinators SET is_active = false WHERE user_id = $1`,
                [id]
            );

            for (const course_id of course_ids) {
                await client.query(
                    `UPDATE course_coordinators SET is_active = false
                     WHERE course_id = $1 AND user_id != $2 AND is_active = true`,
                    [course_id, id]
                );

                await client.query(
                    `INSERT INTO course_coordinators (user_id, course_id)
                     VALUES ($1, $2)
                     ON CONFLICT (user_id, course_id) DO UPDATE SET is_active = true, assigned_at = NOW()`,
                    [id, course_id]
                );
            }
        }

        await client.query('COMMIT');
        await registrarLog(req.usuario.id, 'ATUALIZAR_COORDENADOR', 'users', id, { full_name, email });
        res.status(200).json({ mensagem: "Coordenador atualizado!" });
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ erro: err.message });
    } finally {
        client.release();
    }
};

exports.deleteCoordenador = async (req, res) => {
    const { id } = req.params;

    try {
        const coord = await pool.query(
            `SELECT u.id FROM users u
             JOIN user_roles ur ON ur.user_id = u.id
             JOIN roles r ON r.id = ur.role_id
             WHERE u.id = $1 AND r.name = 'coordinator'`,
            [id]
        );

        if (coord.rows.length === 0) {
            return res.status(404).json({ erro: "Coordenador não encontrado." });
        }

        await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
        await registrarLog(req.usuario.id, 'DELETAR_COORDENADOR', 'users', id, {});
        res.status(200).json({ mensagem: "Coordenador deletado com sucesso!" });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
};

exports.getSubmissoesGeral = async (req, res) => {
    const user_id = parseInt(req.usuario.id);
    const { status, pagina } = req.query;

    const paginar = (pagina !== undefined && pagina !== null && pagina !== '');
    const numPagina = paginar ? parseInt(pagina) : 1;
    const itensPorPagina = 10;
    const offset = (numPagina - 1) * itensPorPagina;

    try {
        const isSuperAdmin =
            req.usuario.perfis &&
            req.usuario.perfis.includes('super_admin');

        let course_ids = [];

        if (isSuperAdmin) {
            const todos = await pool.query(
                `SELECT id
                 FROM courses
                 WHERE is_active = true`
            );

            course_ids = todos.rows.map(r => parseInt(r.id));
        } else {
            const cursos = await pool.query(
                `SELECT course_id
                 FROM course_coordinators
                 WHERE user_id = $1
                   AND is_active = true`,
                [user_id]
            );

            course_ids = cursos.rows.map(r => parseInt(r.course_id));
        }

        if (course_ids.length === 0) {
            return res.status(200).json({
                submissoes: [],
                contadores: {
                    pendentes: 0,
                    aprovadas: 0,
                    reprovadas: 0,
                    total: 0,
                    total_cursos: 0
                },
                pagina: paginar ? numPagina : null,
                total_paginas: 0
            });
        }

        let params = [course_ids];
        let filtroStatus = '';

        if (status && status === 'PENDENTE') {
            filtroStatus = `
                AND status NOT IN ('approved', 'rejected')
            `;
        } else if (status && status !== 'TODAS') {
            filtroStatus = `
                AND status = $2::submission_status_enum
            `;
            params.push(status);
        }

        let queryStr = `SELECT *
             FROM view_submissoes_completo
             WHERE course_id = ANY($1)
             ${filtroStatus}
             ORDER BY submitted_at DESC`;

        if (paginar) {
            params.push(itensPorPagina, offset);
            queryStr += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;
        }

        const resultado = await pool.query(queryStr, params);

        const contadores = await pool.query(
            `SELECT
                COUNT(*) FILTER (
                    WHERE status NOT IN ('approved', 'rejected')
                ) AS pendentes,

                COUNT(*) FILTER (
                    WHERE status = 'approved'
                ) AS aprovadas,

                COUNT(*) FILTER (
                    WHERE status = 'rejected'
                ) AS reprovadas,

                COUNT(*) AS total,

                COUNT(DISTINCT course_id) AS total_cursos

             FROM view_submissoes_completo
             WHERE course_id = ANY($1)`,
            [course_ids]
        );

        res.status(200).json({
            submissoes: resultado.rows,
            contadores: contadores.rows[0],
            pagina: paginar ? numPagina : null,
            total_paginas: paginar
                ? Math.ceil(contadores.rows[0].total / itensPorPagina)
                : null
        });

    } catch (err) {
        console.error('Erro em getSubmissoesGeral:', err);

        res.status(500).json({
            erro: err.message
        });
    }
};

exports.getListaAlunos = async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT 
                u.id,
                u.full_name,
                u.email,
                u.phone,
                sp.ra,
                sp.semestre,
                uc.status_matricula,
                c.id AS course_id,
                c.name AS course_name,
                cr.nivel_risco,
                COALESCE(array_agg(c.name) FILTER (WHERE c.name IS NOT NULL), '{}') AS course_names
             FROM users u
             JOIN user_roles ur ON ur.user_id = u.id
             JOIN roles r ON r.id = ur.role_id AND r.name = 'student'
             LEFT JOIN student_profiles sp ON sp.user_id = u.id
             LEFT JOIN user_courses uc ON uc.user_id = u.id AND uc.is_active = true
             LEFT JOIN courses c ON c.id = uc.course_id AND c.is_active = true
             LEFT JOIN vw_risco_atual cr ON cr.aluno_id = u.id AND cr.curso_id = uc.course_id
             GROUP BY u.id, u.full_name, u.email, u.phone, sp.ra, sp.semestre, uc.status_matricula, c.id, c.name, cr.nivel_risco
             ORDER BY u.full_name`
        );
        res.status(200).json(resultado.rows);
    } catch (err) {
        console.error('Erro em getListaAlunos:', err);
        res.status(500).json({ erro: "Erro ao buscar alunos: " + err.message });
    }
};

exports.getLimitesCursos = async (req, res) => {
    try {
        const resultado = await pool.query(
            `SELECT id, name FROM courses WHERE is_active = true ORDER BY name`
        );
        res.status(200).json(resultado.rows);
    } catch (err) {
        console.error('Erro em getLimitesCursos:', err);
        res.status(500).json({ erro: "Erro ao buscar limites dos cursos: " + err.message });
    }
};

exports.getLogs = async (req, res) => {
    const limite = parseInt(req.query.limite) || 5;
    try {
        const resultado = await pool.query(
            `SELECT al.*, u.full_name AS usuario_nome
             FROM audit_logs al
             LEFT JOIN users u ON u.id = al.user_id
             ORDER BY al.created_at DESC
             LIMIT $1`,
            [limite]
        );
        res.status(200).json(resultado.rows);
    } catch (err) {
        console.error('Erro em getLogs:', err);
        res.status(500).json({ erro: "Erro ao buscar logs: " + err.message });
    }
};

exports.exportarRelatorioCSV = async (req, res) => {
    try {
        const queryStr = `
            SELECT 
                v.ra AS "RA",
                v.full_name AS "Nome",
                v.email AS "Email",
                v.course_name AS "Curso",
                v.total_obrigatorio AS "Horas Obrigatórias",
                v.total_integralizado AS "Horas Concluídas",
                (v.total_obrigatorio - v.total_integralizado) AS "Horas Faltantes",
                v.total_submissoes AS "Total Submissões",
                COALESCE(r.nivel_risco, 'baixo') AS "Nível de Risco"
            FROM view_resumo_aluno_por_curso v
            LEFT JOIN vw_risco_atual r ON r.aluno_id = v.user_id AND r.course_id = v.course_id
            ORDER BY v.course_name, v.full_name;
        `;

        const resultado = await pool.query(queryStr);

        const headers = ["RA", "Nome", "Email", "Curso", "Horas Obrigatórias", "Horas Concluídas", "Horas Faltantes", "Total Submissões", "Nível de Risco"];
        let csvContent = "\uFEFF";
        csvContent += headers.join(",") + "\n";

        resultado.rows.forEach(row => {
            const line = headers.map(header => {
                let cell = row[header] !== null && row[header] !== undefined ? row[header] : "";
                cell = cell.toString().replace(/"/g, '""');
                if (cell.includes(",") || cell.includes("\n") || cell.includes('"')) {
                    cell = `"${cell}"`;
                }
                return cell;
            });
            csvContent += line.join(",") + "\n";
        });

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=relatorio-consolidado.csv');
        res.status(200).send(csvContent);

    } catch (err) {
        console.error('Erro ao exportar relatório:', err);
        res.status(500).json({ erro: "Erro ao gerar arquivo de exportação: " + err.message });
    }
};

exports.exportarResumoCursosCSV = async (req, res) => {
    try {
        const queryStr = `
            SELECT 
                c.code AS "Sigla",
                c.name AS "Nome do Curso",
                c.minimum_required_hours AS "Horas Requeridas",
                COALESCE(r.total_alunos, 0) AS "Total de Alunos",
                COALESCE(r.total_submissoes, 0) AS "Total de Submissões",
                COALESCE(r.total_aprovadas, 0) AS "Aprovadas",
                COALESCE(r.total_reprovadas, 0) AS "Reprovadas",
                COALESCE(r.total_pendentes, 0) AS "Pendentes",
                COALESCE(r.total_horas_aprovadas, 0) AS "Total Horas Aprovadas",
                COALESCE(r.media_horas_por_aluno, 0) AS "Média de Horas/Aluno",
                COALESCE(r.eficiencia_percentual, 0) AS "Eficiência %"
            FROM courses c
            LEFT JOIN view_relatorio_geral r ON r.course_id = c.id
            WHERE c.is_active = true
            ORDER BY c.name;
        `;

        const resultado = await pool.query(queryStr);

        const headers = [
            "Sigla", "Nome do Curso", "Horas Requeridas", "Total de Alunos",
            "Total de Submissões", "Aprovadas", "Reprovadas", "Pendentes",
            "Total Horas Aprovadas", "Média de Horas/Aluno", "Eficiência %"
        ];
        let csvContent = "\uFEFF";
        csvContent += headers.join(",") + "\n";

        resultado.rows.forEach(row => {
            const line = headers.map(header => {
                let cell = row[header] !== null && row[header] !== undefined ? row[header] : "";
                cell = cell.toString().replace(/"/g, '""');
                if (cell.includes(",") || cell.includes("\n") || cell.includes('"')) {
                    cell = `"${cell}"`;
                }
                return cell;
            });
            csvContent += line.join(",") + "\n";
        });

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=resumo-cursos.csv');
        res.status(200).send(csvContent);

    } catch (err) {
        console.error('Erro ao exportar resumo de cursos:', err);
        res.status(500).json({ erro: "Erro ao gerar arquivo de exportação: " + err.message });
    }
};

exports.getExportarRelatorio = async (req, res) => {
    try {
        const resultado = await pool.query(`
            SELECT 
                s.id AS protocolo,
                u.full_name AS aluno,
                sp.ra,
                c.name AS curso,
                cat.name AS categoria,
                s.title AS titulo_atividade,
                s.status,
                s.requested_hours AS horas_solicitadas,
                s.approved_hours AS horas_aprovadas,
                s.submitted_at AS data_submissao
            FROM submissions s
            JOIN user_courses uc ON uc.id = s.user_course_id
            JOIN users u ON u.id = uc.user_id
            LEFT JOIN student_profiles sp ON sp.user_id = u.id
            JOIN courses c ON c.id = uc.course_id
            JOIN categories cat ON cat.id = s.category_id
            ORDER BY s.submitted_at DESC
        `);

        if (resultado.rows.length === 0) {
            return res.status(404).json({ erro: "Nenhum dado encontrado para exportar." });
        }

        const headers = ["Protocolo", "Aluno", "RA", "Curso", "Categoria", "Título", "Status", "Horas Solicitadas", "Horas Aprovadas", "Data Submissão"];
        
        const rows = resultado.rows.map(row => {
            return [
                row.protocolo,
                row.aluno,
                row.ra,
                row.curso,
                row.categoria,
                row.titulo_atividade,
                row.status,
                row.horas_solicitadas,
                row.horas_aprovadas,
                row.data_submissao ? new Date(row.data_submissao).toLocaleDateString('pt-BR') : ''
            ];
        });

        res.status(200).json({ headers, rows });

    } catch (err) {
        console.error('Erro ao exportar relatório:', err);
        res.status(500).json({ erro: "Erro ao gerar relatório: " + err.message });
    }
};