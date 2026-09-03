const { pool } = require("../config/db.js");

async function getUserById(id_usuario) {
  const query = "SELECT * FROM usuarios WHERE id_usuario = $1 AND deleted_at IS NULL";
  const result = await pool.query(query, [id_usuario]);
  return result.rows[0];
}

async function getUserByCorreo(correo) {
  const query = "SELECT * FROM usuarios WHERE correo = $1 AND deleted_at IS NULL";
  const result = await pool.query(query, [correo]);
  return result.rows[0];
}

async function createUser(data) {
  const query = `
      INSERT INTO usuarios (
        nombre, apellido_paterno, apellido_materno, correo, contrasena, id_rol, id_departamento, pertenece_a_institucion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id_usuario
    `;

  const values = [
    data.nombres || data.nombre,
    data.apellidoPaterno || data.apellido_paterno,
    data.apellidoMaterno || data.apellido_materno,
    data.correo || data.email,
    data.contrasena || data.password,
    data.id_rol || 4,
    data.id_departamento || 1,
    data.pertenece_a_institucion !== undefined ? parseInt(data.pertenece_a_institucion) : 1
  ];

  const result = await pool.query(query, values);
  return { insertId: result.rows[0]?.id_usuario, ...result.rows[0] };
}

async function updatePassword(email, passwordHash) {
  const query = `
      UPDATE usuarios 
      SET contrasena = $1 
      WHERE correo = $2 AND deleted_at IS NULL
    `;
  const values = [passwordHash, email];

  const result = await pool.query(query, values);
  return result.rowCount > 0;
}

async function saveRecoveryCodes(id_usuario, codigo, expira_en = null) {
  try {
    const query = `
      INSERT INTO codigos_recuperacion_usuarios (id_usuario, codigo, expira_en)
      VALUES ($1, $2, $3)
      RETURNING id
    `;
    const result = await pool.query(query, [id_usuario, codigo, expira_en]);
    return { insertId: result.rows[0]?.id, ...result.rows[0] };
  } catch (error) {
    throw error;
  }
}

async function verifyCode(id_usuario, codigo) {
  try {
    const result = await pool.query(
      "SELECT id, id_usuario, codigo, usado FROM codigos_recuperacion_usuarios WHERE id_usuario = $1 AND codigo = $2 AND usado = 0 ORDER BY id DESC LIMIT 1",
      [id_usuario, codigo]
    );
    return result.rows[0];
  } catch (error) {
    throw error;
  }
}

async function markCodeUsed(id) {
  try {
    await pool.query("UPDATE codigos_recuperacion_usuarios SET usado = 1, usado_en = CURRENT_TIMESTAMP WHERE id = $1", [id]);
    const result = await pool.query("SELECT * FROM codigos_recuperacion_usuarios WHERE id = $1", [id]);
    return result.rows[0];
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getUserById,
  getUserByCorreo,
  createUser,
  updatePassword,
  saveRecoveryCodes,
  verifyCode,
  markCodeUsed,
  // Alias for compatibility with external snippets
  GetUserByEmailAuth: getUserByCorreo,
  UpdatePassword: updatePassword,
  SaveRecoveryCodes: saveRecoveryCodes,
  VerifyCode: verifyCode,
  MarkCodeUsed: markCodeUsed
};