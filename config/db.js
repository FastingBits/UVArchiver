const dotenv = require('dotenv');
dotenv.config();

const dbType = (process.env.DB_TYPE || 'postgres').trim().toLowerCase();

let pool;

if (dbType === 'mysql') {
  const mysql = require('mysql2/promise');
  pool = mysql.createPool({
    host: process.env.DB_HOST_MS || 'localhost',
    user: process.env.DB_USER_MS || 'root',
    password: process.env.DB_PASSWORD_MS || '',
    database: process.env.DB_NAME_MS || 'uvarchiver_db',
    port: Number(process.env.DB_PORT_MS) || 3306,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0,
  });
} else {
  const { Pool } = require('pg');
  pool = new Pool({
    user: process.env.DB_USER_PG || 'postgres',
    host: process.env.DB_HOST_PG || 'localhost',
    database: process.env.DB_NAME_PG || 'uvarchiver_db',
    password: process.env.DB_PASSWORD_PG || '',
    port: Number(process.env.DB_PORT_PG) || 5432,
    max: 20,
    idleTimeoutMillis: 30000,
  });
}

async function checkConnection() {
  try {
    if (dbType === 'mysql') {
      const [rows] = await pool.query('SELECT NOW() as now');
      console.log('Prueba de conexión exitosa (MySQL):', rows[0]);
    } else {
      const result = await pool.query('SELECT NOW()');
      console.log('Prueba de conexión exitosa (PostgreSQL):', result.rows[0]);
    }
  } catch (err) {
    console.error(`Error al probar conexión (${dbType.toUpperCase()}):`, err.message);
  }
}

checkConnection();

module.exports = {
  pool,
  dbType,
};
