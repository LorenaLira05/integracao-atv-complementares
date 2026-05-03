const { Pool } = require('pg');
const pool = new Pool({ host: 'localhost', port: 5432, database: 'atividades_complementares_senac', user: 'postgres', password: '123456' });
pool.query("SELECT column_name FROM information_schema.key_column_usage WHERE constraint_name = 'validations_pkey';")
  .then(res => { console.log(res.rows); process.exit(0); })
  .catch(err => { console.error(err); process.exit(1); });
