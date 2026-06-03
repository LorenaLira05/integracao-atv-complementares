const pool = require('./config/database');

async function seed() {
    try {
        console.log("Buscando alunos do curso 1 e 2...");
        const userCourses = await pool.query(`SELECT * FROM user_courses LIMIT 10`);
        
        let uc1 = userCourses.rows.find(r => r.course_id == 1);
        let uc2 = userCourses.rows.find(r => r.course_id == 2);
        
        // Se não tiver alunos, cria alunos
        if (!uc1) {
            console.log("Criando aluno para curso 1...");
            const res = await pool.query(`INSERT INTO users (full_name, email, password_hash, status) VALUES ('Aluno Curso 1', 'aluno1@teste.com', '123', 'active') RETURNING id`);
            const uId = res.rows[0].id;
            const ucRes = await pool.query(`INSERT INTO user_courses (user_id, course_id, is_active) VALUES ($1, 1, true) RETURNING id`, [uId]);
            uc1 = { id: ucRes.rows[0].id };
            // Dar role student
            await pool.query(`INSERT INTO user_roles (user_id, role_id) VALUES ($1, (SELECT id FROM roles WHERE name='student'))`, [uId]);
        }
        
        if (!uc2) {
            console.log("Criando aluno para curso 2...");
            const res = await pool.query(`INSERT INTO users (full_name, email, password_hash, status) VALUES ('Aluno Curso 2', 'aluno2@teste.com', '123', 'active') RETURNING id`);
            const uId = res.rows[0].id;
            const ucRes = await pool.query(`INSERT INTO user_courses (user_id, course_id, is_active) VALUES ($1, 2, true) RETURNING id`, [uId]);
            uc2 = { id: ucRes.rows[0].id };
            await pool.query(`INSERT INTO user_roles (user_id, role_id) VALUES ($1, (SELECT id FROM roles WHERE name='student'))`, [uId]);
        }
        
        const catRes = await pool.query(`SELECT id FROM categories LIMIT 1`);
        const catId = catRes.rows[0].id;

        console.log("Inserindo submissões para Ricardo (curso 1)...");
        await pool.query(`INSERT INTO submissions (user_course_id, category_id, title, description, requested_hours, activity_date, status, approved_hours) VALUES 
        ($1, $2, 'Seminário de UX', 'Participação', 10, NOW(), 'submitted', null),
        ($1, $2, 'Curso de Figma', 'Conclusão', 20, NOW(), 'submitted', null),
        ($1, $2, 'Palestra Tech', 'Participação', 5, NOW(), 'approved', 5),
        ($1, $2, 'Workshop Design', 'Participação', 8, NOW(), 'rejected', 0)`, [uc1.id, catId]);

        console.log("Inserindo submissões para Helena (curso 2)...");
        await pool.query(`INSERT INTO submissions (user_course_id, category_id, title, description, requested_hours, activity_date, status, approved_hours) VALUES 
        ($1, $2, 'Seminário de Direito', 'Participação', 15, NOW(), 'submitted', null),
        ($1, $2, 'Curso de Leis', 'Conclusão', 30, NOW(), 'submitted', null),
        ($1, $2, 'Palestra Jurídica', 'Participação', 4, NOW(), 'submitted', null),
        ($1, $2, 'Workshop Penal', 'Participação', 10, NOW(), 'approved', 10)`, [uc2.id, catId]);

        console.log("Dados inseridos com sucesso!");
    } catch (e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
seed();
