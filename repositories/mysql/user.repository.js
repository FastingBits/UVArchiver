const { pool } = require('../../config/db.js');

class MysqlUserRepository {
  async findAll() {
    const query = `
      SELECT u.id_usuario, u.nombre, u.apellido_paterno, u.apellido_materno, u.correo, 
             u.pertenece_a_institucion, u.fecha_registro, u.id_rol, r.nombre as nombre_rol, 
             u.id_departamento, d.nombre as nombre_departamento 
      FROM usuarios u 
      INNER JOIN roles r ON r.id_rol = u.id_rol 
      LEFT JOIN departamentos d ON u.id_departamento = d.id_departamento 
      WHERE u.deleted_at IS NULL
    `;
    const [rows] = await pool.query(query);
    return rows;
  }

  async findPaginated({ page = 1, limit = 10, search = '', date = '', id_departamento = null } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (pageNum - 1) * limitNum;

    const whereConditions = ['u.deleted_at IS NULL'];
    const queryParams = [];

    if (id_departamento) {
      whereConditions.push('u.id_departamento = ?');
      queryParams.push(id_departamento);
    }

    if (search && search.trim() !== '') {
      const term = search.trim();
      queryParams.push(term, term, term, term, term, term);
      whereConditions.push(`(
        u.nombre LIKE CONCAT('%', ?, '%') OR 
        u.apellido_paterno LIKE CONCAT('%', ?, '%') OR 
        u.apellido_materno LIKE CONCAT('%', ?, '%') OR 
        u.correo LIKE CONCAT('%', ?, '%') OR 
        r.nombre LIKE CONCAT('%', ?, '%') OR 
        d.nombre LIKE CONCAT('%', ?, '%')
      )`);
    }

    if (date && date.trim() !== '') {
      whereConditions.push('DATE(u.fecha_registro) = ?');
      queryParams.push(date.trim());
    }

    const whereClause = whereConditions.join(' AND ');

    // Conteo total
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM usuarios u 
      INNER JOIN roles r ON r.id_rol = u.id_rol 
      LEFT JOIN departamentos d ON u.id_departamento = d.id_departamento 
      WHERE ${whereClause}
    `;
    const [countRows] = await pool.query(countQuery, queryParams);
    const total = parseInt(countRows[0]?.total, 10) || 0;
    const totalPages = Math.ceil(total / limitNum) || 1;

    // Registros paginados
    const dataQuery = `
      SELECT u.id_usuario, u.nombre, u.apellido_paterno, u.apellido_materno, u.correo, 
             u.pertenece_a_institucion, u.fecha_registro, u.id_rol, r.nombre as nombre_rol, 
             u.id_departamento, d.nombre as nombre_departamento 
      FROM usuarios u 
      INNER JOIN roles r ON r.id_rol = u.id_rol 
      LEFT JOIN departamentos d ON u.id_departamento = d.id_departamento 
      WHERE ${whereClause}
      ORDER BY u.fecha_registro DESC 
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(dataQuery, [...queryParams, limitNum, offset]);

    return {
      users: rows,
      total,
      totalPages,
      currentPage: pageNum,
      limit: limitNum
    };
  }

  async findById(id) {
    const query = 'SELECT * FROM usuarios WHERE id_usuario = ? AND deleted_at IS NULL';
    const [rows] = await pool.query(query, [id]);
    return rows[0] || null;
  }

  async search(term) {
    const query = `
      SELECT 
        u.id_usuario, 
        u.nombre, 
        u.apellido_paterno, 
        u.apellido_materno, 
        u.correo, 
        u.pertenece_a_institucion, 
        u.fecha_registro, 
        u.id_rol, 
        r.nombre as nombre_rol, 
        u.id_departamento, 
        d.nombre as nombre_departamento 
      FROM usuarios u 
      INNER JOIN roles r ON r.id_rol = u.id_rol 
      LEFT JOIN departamentos d ON u.id_departamento = d.id_departamento
      WHERE u.deleted_at IS NULL
      AND (
        u.nombre LIKE CONCAT('%', ?, '%') OR 
        u.apellido_paterno LIKE CONCAT('%', ?, '%') OR 
        u.apellido_materno LIKE CONCAT('%', ?, '%') OR 
        u.correo LIKE CONCAT('%', ?, '%')
      )
    `;
    const searchValue = term || '';
    const [rows] = await pool.query(query, [searchValue, searchValue, searchValue, searchValue]);
    return rows;
  }

  async getProfileData(id) {
    const query = `
      SELECT 
        u.id_usuario, 
        u.nombre, 
        u.apellido_paterno, 
        u.apellido_materno, 
        u.correo, 
        u.pertenece_a_institucion, 
        DATE_FORMAT(u.fecha_registro, '%d/%m/%Y') as fecha_registro, 
        u.id_rol, 
        r.nombre as nombre_rol, 
        u.id_departamento, 
        d.nombre as nombre_departamento 
      FROM usuarios u 
      INNER JOIN roles r ON r.id_rol = u.id_rol 
      LEFT JOIN departamentos d ON u.id_departamento = d.id_departamento
      WHERE u.deleted_at IS NULL
      AND u.id_usuario = ?
    `;
    const [rows] = await pool.query(query, [id]);
    return rows[0] || null;
  }

  async getRoles() {
    const query = 'SELECT * FROM roles';
    const [rows] = await pool.query(query);
    return rows;
  }

  async create(data) {
    const query = `
      INSERT INTO usuarios (
        nombre, apellido_paterno, apellido_materno, correo, contrasena, pertenece_a_institucion, id_rol, id_departamento
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(query, [
      data.nombre,
      data.apellido_paterno,
      data.apellido_materno,
      data.correo,
      data.contrasena,
      data.pertenece_a_institucion !== undefined ? parseInt(data.pertenece_a_institucion, 10) : 1,
      data.id_rol || 4,
      data.id_departamento || 1
    ]);
    return result.insertId;
  }

  async update(id_usuario, data) {
    const query = `
      UPDATE usuarios 
      SET nombre = ?, apellido_paterno = ?, apellido_materno = ?, correo = ?, 
          pertenece_a_institucion = ?, id_rol = ?, id_departamento = ? 
      WHERE id_usuario = ? AND deleted_at IS NULL
    `;
    const [result] = await pool.query(query, [
      data.nombre,
      data.apellido_paterno,
      data.apellido_materno,
      data.correo,
      data.pertenece_a_institucion !== undefined ? parseInt(data.pertenece_a_institucion, 10) : 1,
      data.id_rol,
      data.id_departamento,
      id_usuario
    ]);
    return result.affectedRows;
  }

  async delete(id_usuario) {
    const query = 'UPDATE usuarios SET deleted_at = CURRENT_TIMESTAMP WHERE id_usuario = ?';
    const [result] = await pool.query(query, [id_usuario]);
    return result.affectedRows;
  }
}

module.exports = new MysqlUserRepository();
