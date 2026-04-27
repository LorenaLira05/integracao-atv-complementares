const pool = require('./config/database');
async function run() {
    try {
        const user_id = 1; // Assuming SUPER_ADMIN is 1
        const todosCursos = await pool.query(`SELECT id FROM courses WHERE is_active = true`);
        let course_ids = todosCursos.rows.map(r => r.id);
        
        console.log("course_ids:", course_ids);
        if (course_ids.length === 0) return;

        const metricas = await pool.query(
            `SELECT
                COUNT(*) FILTER (WHERE s.status = 'submitted') AS pendentes,
                COUNT(*) FILTER (WHERE s.status = 'approved') AS aprovadas,
                COUNT(*) FILTER (WHERE s.status = 'rejected') AS reprovadas,
                ROUND(COALESCE(AVG(s.approved_hours) FILTER (WHERE s.status = 'approved'), 0), 1) AS media_horas
             FROM submissions s
             JOIN user_courses uc ON uc.id = s.user_course_id
             WHERE uc.course_id = ANY($1)`,
            [course_ids]
        );
        console.log("metricas:", metricas.rows);

        const alunos = await pool.query(
            `SELECT COUNT(DISTINCT uc.user_id) AS total_alunos
             FROM user_courses uc
             JOIN user_roles ur ON ur.user_id = uc.user_id
             JOIN roles r ON r.id = ur.role_id
             WHERE uc.course_id = ANY($1)
             AND r.name = 'student'
             AND uc.is_active = true`,
            [course_ids]
        );
        console.log("alunos:", alunos.rows);

        const porCategoria = await pool.query(
            `SELECT
                cat.name AS categoria,
                COUNT(*) AS total
             FROM submissions s
             JOIN user_courses uc ON uc.id = s.user_course_id
             JOIN categories cat ON cat.id = s.category_id
             WHERE uc.course_id = ANY($1)
             GROUP BY cat.name
             ORDER BY total DESC`,
            [course_ids]
        );
        console.log("porCategoria:", porCategoria.rows);
        const cursosMaisEnvios = await pool.query(
            `SELECT
                c.name AS nome_curso,
                COUNT(*) AS total_envios
             FROM submissions s
             JOIN user_courses uc ON uc.id = s.user_course_id
             JOIN courses c ON c.id = uc.course_id
             WHERE uc.course_id = ANY($1)
             GROUP BY c.name
             ORDER BY total_envios DESC
             LIMIT 5`,
            [course_ids]
        );
        console.log("cursosMaisEnvios:", cursosMaisEnvios.rows);

        const ultimasAtividades = await pool.query(
            `SELECT
                s.id,
                s.title,
                s.status,
                s.submitted_at,
                u.full_name AS nome_aluno,
                cat.name AS categoria
             FROM submissions s
             JOIN user_courses uc ON uc.id = s.user_course_id
             JOIN users u ON u.id = uc.user_id
             JOIN categories cat ON cat.id = s.category_id
             WHERE uc.course_id = ANY($1)
             ORDER BY s.submitted_at DESC
             LIMIT 5`,
            [course_ids]
        );
        console.log("ultimasAtividades:", ultimasAtividades.rows);
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
run();
