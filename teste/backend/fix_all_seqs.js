const { Pool } = require('pg');
const pool = new Pool({ host: 'localhost', port: 5432, database: 'atividades_complementares_senac', user: 'postgres', password: '123456' });

async function fixAllSequences() {
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `);
    
    for (const row of res.rows) {
      const table = row.table_name;
      try {
        const seqRes = await pool.query(`SELECT pg_get_serial_sequence($1, 'id') AS seq`, [table]);
        const seqName = seqRes.rows[0]?.seq;
        
        if (seqName) {
          await pool.query(`SELECT setval($1, COALESCE((SELECT MAX(id) FROM ${table}), 1))`, [seqName]);
          console.log(`Fixed sequence for ${table}: ${seqName}`);
        }
      } catch (err) {
        // Ignorar tabelas sem coluna id
      }
    }
    console.log("All sequences updated successfully!");
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}

fixAllSequences();
