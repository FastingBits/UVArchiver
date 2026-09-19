const { pool } = require('../../config/db.js');

class MysqlDepartmentRepository {
  async findAll() {
    const query = 'SELECT * FROM departamentos WHERE deleted_at IS NULL ORDER BY id_departamento ASC';
    const [rows] = await pool.query(query);
    return rows;
  }

  async findByUserId(id_usuario) {
    const query = 'SELECT id_departamento FROM usuarios WHERE id_usuario = ? AND deleted_at IS NULL';
    const [rows] = await pool.query(query, [id_usuario]);
    return rows[0] || null;
  }

  async findById(id) {
    const query = 'SELECT * FROM departamentos WHERE id_departamento = ? AND deleted_at IS NULL';
    const [rows] = await pool.query(query, [id]);
    return rows[0] || null;
  }

  async create(nombre, descripcion) {
    const query = 'INSERT INTO departamentos (nombre, descripcion) VALUES (?, ?)';
    const [result] = await pool.query(query, [nombre, descripcion]);
    return result.insertId;
  }

  async update(id, nombre, descripcion) {
    const query = 'UPDATE departamentos SET nombre = ?, descripcion = ? WHERE id_departamento = ? AND deleted_at IS NULL';
    const [result] = await pool.query(query, [nombre, descripcion, id]);
    return result.affectedRows;
  }

  async delete(id) {
    const query = 'UPDATE departamentos SET deleted_at = CURRENT_TIMESTAMP WHERE id_departamento = ?';
    const [result] = await pool.query(query, [id]);
    return result.affectedRows;
  }
}

module.exports = new MysqlDepartmentRepository();
