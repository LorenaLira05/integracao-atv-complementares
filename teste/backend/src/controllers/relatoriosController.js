const pool = require('../config/database');

exports.getRelatorios = async (req, res) => {
    const user_id     = parseInt(req.usuario.id);
    const isSuperAdmin = req.usuario.perfis.includes('super_admin');

    const periodo = req.query.periodo || '30'; // '7', '30', '90'
    const page    = Math.max(parseInt(req.query.page) || 1, 1);
    const limit   = 10;
    const offset  = (page - 1) * limit;

    let course_ids = [];

    try {
        if (isSuperAdmin) {
            const todosCursos = await pool.query(
                `SELECT id FROM courses WHERE is_active = true`
            );
            course_ids = todosCursos.rows.map(r => r.id);
        } else {
            const cursosDoCoordenador = await pool.query(
                `SELECT course_id FROM course_coordinators
                 WHERE user_id = $1 AND is_active = true`,
                [user_id]
            );
            course_ids = cursosDoCoordenador.rows.map(r => r.course_id);
        }

        if (course_ids.length === 0) {
            return res.status(200).json({
                total_horas: 0,
                eficiencia: { total: 0, aprovadas: 0, eficiencia_percentual: 0 },
                horas_mensais: [],
                eficiencia_por_curso: [],
                log_atividades: [],
                log_total: 0,
                log_pagina: 1,
                log_total_paginas: 1,
                avaliacao_alunos: []
            });
        }

    
        const horasProcessadas = await pool.query(
            `SELECT COALESCE(SUM(s.approved_hours), 0) AS total_horas
             FROM submissions s
             JOIN user_courses uc ON uc.id = s.user_course_id
             WHERE s.status = 'approved'
             AND uc.course_id = ANY($1)`,
            [course_ids]
        );

     
        const eficiencia = await pool.query(
            `SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE s.status = 'approved') AS aprovadas,
                COUNT(*) FILTER (WHERE s.status = 'submitted') AS pendentes,
                CASE
                    WHEN COUNT(*) > 0
                    THEN ROUND((COUNT(*) FILTER (WHERE s.status = 'approved')::numeric / COUNT(*)) * 100, 1)
                    ELSE 0
                END AS eficiencia_percentual,
                CASE
                    WHEN COUNT(DISTINCT uc.user_id) > 0
                    THEN ROUND(SUM(s.approved_hours) FILTER (WHERE s.status = 'approved')::numeric / COUNT(DISTINCT uc.user_id), 1)
                    ELSE 0
                END AS media_horas_aluno
             FROM submissions s
             JOIN user_courses uc ON uc.id = s.user_course_id
             WHERE uc.course_id = ANY($1)`,
            [course_ids]
        );

       
        const horasMensais = await pool.query(
            `SELECT
                TO_CHAR(DATE_TRUNC('month', COALESCE(s.updated_at, s.submitted_at)), 'YYYY-MM') AS mes,
                ROUND(COALESCE(SUM(s.approved_hours), 0)::numeric, 2) AS horas
             FROM submissions s
             JOIN user_courses uc ON uc.id = s.user_course_id
             WHERE uc.course_id = ANY($1)
             AND s.status = 'approved'
             AND COALESCE(s.updated_at, s.submitted_at) >= NOW() - INTERVAL '12 months'
             GROUP BY DATE_TRUNC('month', COALESCE(s.updated_at, s.submitted_at))
             ORDER BY DATE_TRUNC('month', COALESCE(s.updated_at, s.submitted_at))`,
            [course_ids]
        );

        
        const eficienciaPorCurso = await pool.query(
            `SELECT
                c.name AS nome_curso,
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE s.status = 'approved') AS aprovadas,
                CASE
                    WHEN COUNT(*) > 0
                    THEN ROUND((COUNT(*) FILTER (WHERE s.status = 'approved')::numeric / COUNT(*)) * 100, 1)
                    ELSE 0
                END AS eficiencia
             FROM submissions s
             JOIN user_courses uc ON uc.id = s.user_course_id
             JOIN courses c ON c.id = uc.course_id
             WHERE uc.course_id = ANY($1)
             GROUP BY c.name
             ORDER BY eficiencia DESC`,
            [course_ids]
        );

        
         const totalRegistros = await pool.query(
            `SELECT COUNT(*) AS total
             FROM submissions s
             JOIN user_courses uc ON uc.id = s.user_course_id
             LEFT JOIN LATERAL (
                SELECT validated_at FROM validations WHERE submission_id = s.id ORDER BY validated_at DESC LIMIT 1
             ) v ON true
             WHERE uc.course_id = ANY($1)
             AND COALESCE(v.validated_at, s.submitted_at) >= NOW() - ($2 || ' days')::interval`,
            [course_ids, periodo]
        );

        const total            = parseInt(totalRegistros.rows[0].total);
        const total_paginas    = Math.ceil(total / limit) || 1;

        
        const logAtividades = await pool.query(
            `SELECT
                s.id,
                s.title,
                s.status,
                s.submitted_at,
                s.approved_hours,
                s.requested_hours,
                u.full_name AS nome_aluno,
                cat.name AS category_name,
                v.comment AS feedback,
                v.validated_at AS data_validacao
             FROM submissions s
             JOIN user_courses uc ON uc.id = s.user_course_id
             JOIN users u ON u.id = uc.user_id
             JOIN categories cat ON cat.id = s.category_id
             LEFT JOIN LATERAL (
                SELECT comment, validated_at
                FROM validations
                WHERE submission_id = s.id
                ORDER BY validated_at DESC
                LIMIT 1
             ) v ON true
             WHERE uc.course_id = ANY($1)
             AND COALESCE(v.validated_at, s.submitted_at) >= NOW() - ($2 || ' days')::interval
             ORDER BY COALESCE(v.validated_at, s.submitted_at) DESC
             LIMIT $3 OFFSET $4`,
            [course_ids, periodo, limit, offset]
        );

        const avaliacaoAlunos = await pool.query(
            `SELECT
                u.full_name AS nome,
                u.email,
                COUNT(s.id) AS total_submissoes,
                COALESCE(SUM(s.approved_hours) FILTER (WHERE s.status = 'approved'), 0) AS horas_acumuladas,
                COUNT(s.id) FILTER (WHERE s.status = 'submitted') AS pendentes
             FROM user_courses uc
             JOIN users u ON u.id = uc.user_id
             JOIN user_roles ur ON ur.user_id = u.id
             JOIN roles r ON r.id = ur.role_id
             LEFT JOIN submissions s ON s.user_course_id = uc.id
             WHERE uc.course_id = ANY($1)
             AND r.name = 'student'
             AND uc.is_active = true
             GROUP BY u.id, u.full_name, u.email
             ORDER BY horas_acumuladas DESC`,
            [course_ids]
        );

        res.status(200).json({
            total_horas:        horasProcessadas.rows[0].total_horas,
            eficiencia:         eficiencia.rows[0],
            horas_mensais:      horasMensais.rows,
            eficiencia_por_curso: eficienciaPorCurso.rows,
            log_atividades:     logAtividades.rows,
            log_total:          total,
            log_pagina:         page,
            log_total_paginas:  total_paginas,
            avaliacao_alunos:   avaliacaoAlunos.rows
        });

    } catch (err) {
        console.error('Erro getRelatorios:', err);
        res.status(500).json({ erro: err.message });
    }
};