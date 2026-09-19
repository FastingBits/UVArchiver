const { pool } = require('../../config/db.js');

class MysqlAuthRepository {
  async getUserById(id_usuario) {
    const query = 'SELECT * FROM usuarios WHERE id_usuario = ? AND deleted_at IS NULL';
    const [rows] = await pool.query(query, [id_usuario]);
    return rows[0] || null;
  }

  async getUserByCorreo(correo) {
    const query = 'SELECT * FROM usuarios WHERE correo = ? AND deleted_at IS NULL';
    const [rows] = await pool.query(query, [correo]);
    return rows[0] || null;
  }

  async createUser(data) {
    const query = `
      INSERT INTO usuarios (
        nombre, apellido_paterno, apellido_materno, correo, contrasena, id_rol, id_departamento, pertenece_a_institucion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      data.nombre,
      data.apellido_paterno,
      data.apellido_materno,
      data.correo,
      data.contrasena,
      data.id_rol,
      data.id_departamento,
      data.pertenece_a_institucion
    ];

    const [result] = await pool.query(query, values);
    const id = result.insertId;
    return { insertId: id, id_usuario: id };
  }

  async updatePassword(email, passwordHash) {
    const query = `
      UPDATE usuarios 
      SET contrasena = ? 
      WHERE correo = ? AND deleted_at IS NULL
    `;
    const [result] = await pool.query(query, [passwordHash, email]);
    return result.affectedRows > 0;
  }

  async saveRecoveryCodes(id_usuario, codigo, expira_en = null) {
    const query = `
      INSERT INTO codigos_recuperacion_usuarios (id_usuario, codigo, expira_en)
      VALUES (?, ?, ?)
    `;
    const [result] = await pool.query(query, [id_usuario, codigo, expira_en]);
    const id = result.insertId;
    return { insertId: id, id };
  }

  async verifyCode(id_usuario, codigo) {
    const query = `
      SELECT id, id_usuario, codigo, usado 
      FROM codigos_recuperacion_usuarios 
      WHERE id_usuario = ? AND codigo = ? AND usado = 0 
      ORDER BY id DESC LIMIT 1
    `;
    const [rows] = await pool.query(query, [id_usuario, codigo]);
    return rows[0] || null;
  }

  async markCodeUsed(id) {
    await pool.query('UPDATE codigos_recuperacion_usuarios SET usado = 1, usado_en = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    const [rows] = await pool.query('SELECT * FROM codigos_recuperacion_usuarios WHERE id = ?', [id]);
    return rows[0] || null;
  }
}

module.exports = new MysqlAuthRepository();
