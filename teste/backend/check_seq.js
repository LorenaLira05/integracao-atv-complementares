const { Pool } = require('pg');
const pool = new Pool({ host: 'localhost', port: 5432, database: 'atividades_complementares_senac', user: 'postgres', password: '123456' });
pool.query(`
  SELECT 
    (SELECT MAX(id) FROM validations) as max_id, 
    last_value 
  FROM validations_id_seq;
`)
  .then(res => { console.log(res.rows); process.exit(0); })
  .catch(err => { console.error(err); process.exit(1); });
