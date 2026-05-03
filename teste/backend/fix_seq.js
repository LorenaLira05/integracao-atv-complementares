const { Pool } = require('pg');
const pool = new Pool({ host: 'localhost', port: 5432, database: 'atividades_complementares_senac', user: 'postgres', password: '123456' });
pool.query(`SELECT setval('validations_id_seq', COALESCE((SELECT MAX(id) FROM validations), 1));`)
  .then(res => { console.log(res.rows); process.exit(0); })
  .catch(err => { console.error(err); process.exit(1); });
