const { pool } = require('../../config/db.js');

class MysqlPermissionRepository {
  async getRoles() {
    const query = 'SELECT id_rol, nombre FROM roles ORDER BY id_rol DESC';
    const [rows] = await pool.query(query);
    return rows;
  }

  async getActions() {
    const query = 'SELECT id_accion, nombre FROM acciones';
    const [rows] = await pool.query(query);
    return rows;
  }

  async getRoleActions() {
    const query = `
      SELECT ra.id_rol, ra.id_accion, r.nombre as rol_nombre, a.nombre as accion_nombre
      FROM rol_acciones ra
      JOIN roles r ON ra.id_rol = r.id_rol
      JOIN acciones a ON ra.id_accion = a.id_accion
      ORDER BY r.nombre, a.nombre
    `;
    const [rows] = await pool.query(query);
    return rows;
  }

  async hasPermission(id_usuario, required_permission) {
    if (!id_usuario || !required_permission) {
      return false;
    }

    const query = `
      SELECT 1 
      FROM usuarios u
      INNER JOIN rol_acciones ra ON u.id_rol = ra.id_rol
      INNER JOIN acciones a ON ra.id_accion = a.id_accion
      WHERE u.id_usuario = ? AND a.nombre = ? AND u.deleted_at IS NULL
    `;
    const [rows] = await pool.query(query, [id_usuario, required_permission]);
    return rows.length > 0;
  }
}

module.exports = new MysqlPermissionRepository();
