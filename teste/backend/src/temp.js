const pool = require('./config/database');
pool.query("SELECT * FROM course_coordinators").then(res => {
    console.table(res.rows);
    pool.end();
}).catch(console.error);
