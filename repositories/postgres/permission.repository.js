const { pool } = require('../../config/db.js');

class PostgresPermissionRepository {
  async getRoles() {
    const query = 'SELECT id_rol, nombre FROM roles ORDER BY id_rol DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  async getActions() {
    const query = 'SELECT id_accion, nombre FROM acciones';
    const result = await pool.query(query);
    return result.rows;
  }

  async getRoleActions() {
    const query = `
      SELECT ra.id_rol, ra.id_accion, r.nombre as rol_nombre, a.nombre as accion_nombre
      FROM rol_acciones ra
      JOIN roles r ON ra.id_rol = r.id_rol
      JOIN acciones a ON ra.id_accion = a.id_accion
      ORDER BY r.nombre, a.nombre
    `;
    const result = await pool.query(query);
    return result.rows;
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
      WHERE u.id_usuario = $1 AND a.nombre = $2 AND u.deleted_at IS NULL
    `;
    const result = await pool.query(query, [id_usuario, required_permission]);
    return result.rows.length > 0;
  }
}

module.exports = new PostgresPermissionRepository();
