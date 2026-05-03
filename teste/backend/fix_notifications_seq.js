const { Pool } = require('pg');
const pool = new Pool({ host: 'localhost', port: 5432, database: 'atividades_complementares_senac', user: 'postgres', password: '123456' });
pool.query(`SELECT setval('notifications_id_seq', COALESCE((SELECT MAX(id) FROM notifications), 1));`)
  .then(res => { console.log('Sequence fixed:', res.rows); process.exit(0); })
  .catch(err => { console.error('Error fixing sequence:', err); process.exit(1); });
