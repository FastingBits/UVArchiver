const { pool } = require('../../config/db.js');

class PostgresDepartmentRepository {
  async findAll() {
    const query = 'SELECT * FROM departamentos WHERE deleted_at IS NULL ORDER BY id_departamento ASC';
    const result = await pool.query(query);
    return result.rows;
  }

  async findByUserId(id_usuario) {
    const query = 'SELECT id_departamento FROM usuarios WHERE id_usuario = $1 AND deleted_at IS NULL';
    const result = await pool.query(query, [id_usuario]);
    return result.rows[0] || null;
  }

  async findById(id) {
    const query = 'SELECT * FROM departamentos WHERE id_departamento = $1 AND deleted_at IS NULL';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async create(nombre, descripcion) {
    const query = 'INSERT INTO departamentos (nombre, descripcion) VALUES ($1, $2) RETURNING id_departamento';
    const result = await pool.query(query, [nombre, descripcion]);
    return result.rows[0]?.id_departamento;
  }

  async update(id, nombre, descripcion) {
    const query = 'UPDATE departamentos SET nombre = $1, descripcion = $2 WHERE id_departamento = $3 AND deleted_at IS NULL';
    const result = await pool.query(query, [nombre, descripcion, id]);
    return result.rowCount;
  }

  async delete(id) {
    const query = 'UPDATE departamentos SET deleted_at = CURRENT_TIMESTAMP WHERE id_departamento = $1';
    const result = await pool.query(query, [id]);
    return result.rowCount;
  }
}

module.exports = new PostgresDepartmentRepository();
