const { Client } = require('pg');

async function checkSettings() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'concepto_bdd',
    password: 'Riverplate912',
    port: 5432,
  });

  try {
    await client.connect();
    const res = await client.query('SELECT * FROM agency_settings LIMIT 1');
    console.log('Agency Settings:', JSON.stringify(res.rows[0], null, 2));
  } catch (err) {
    console.error('Error connecting to DB:', err.message);
  } finally {
    await client.end();
  }
}

checkSettings();
