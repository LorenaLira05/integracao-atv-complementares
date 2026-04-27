const pool = require('./config/database');
async function test() {
    try {
        const c = await pool.query('SELECT s.id, s.status, s.approved_hours, uc.course_id FROM submissions s JOIN user_courses uc ON uc.id = s.user_course_id');
        console.log("Submissoes:", c.rows);
    } catch(e) {
        console.error(e);
    } finally {
        pool.end();
    }
}
test();
