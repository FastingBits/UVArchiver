const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Configuración del pool de conexiones
const pool = new Pool({
  user: process.env.DB_USER_PG,
  host: process.env.DB_HOST_PG,
  database: process.env.DB_NAME_PG,
  password: process.env.DB_PASSWORD_PG,
  port: Number(process.env.DB_PORT_PG),
  max: 20, // Número máximo de clientes en el pool
  idleTimeoutMillis: 30000, // Tiempo que una conexión inactiva permanece abierta
});

async function checkConnection() {
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('Prueba de conexión exitosa:', result.rows[0]);
  } catch (err) {
    console.error('Error al probar conexión:', err);
  }
}

checkConnection();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
