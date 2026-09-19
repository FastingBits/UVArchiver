const { pool } = require('../../config/db.js');

class PostgresUserRepository {
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
    const result = await pool.query(query);
    return result.rows;
  }

  async findPaginated({ page = 1, limit = 10, search = '', date = '', id_departamento = null } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (pageNum - 1) * limitNum;

    const whereConditions = ['u.deleted_at IS NULL'];
    const queryParams = [];

    if (id_departamento) {
      queryParams.push(id_departamento);
      whereConditions.push(`u.id_departamento = $${queryParams.length}`);
    }

    if (search && search.trim() !== '') {
      const term = search.trim();
      const p1 = queryParams.length + 1;
      const p2 = queryParams.length + 2;
      const p3 = queryParams.length + 3;
      const p4 = queryParams.length + 4;
      const p5 = queryParams.length + 5;
      const p6 = queryParams.length + 6;
      queryParams.push(term, term, term, term, term, term);
      whereConditions.push(`(u.nombre ILIKE CONCAT('%', $${p1}, '%') OR u.apellido_paterno ILIKE CONCAT('%', $${p2}, '%') OR u.apellido_materno ILIKE CONCAT('%', $${p3}, '%') OR u.correo ILIKE CONCAT('%', $${p4}, '%') OR r.nombre ILIKE CONCAT('%', $${p5}, '%') OR d.nombre ILIKE CONCAT('%', $${p6}, '%'))`);
    }

    if (date && date.trim() !== '') {
      queryParams.push(date.trim());
      whereConditions.push(`DATE(u.fecha_registro) = $${queryParams.length}`);
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
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0]?.total, 10) || 0;
    const totalPages = Math.ceil(total / limitNum) || 1;

    // Registros paginados
    const dataParams = [...queryParams, limitNum, offset];
    const pLimit = dataParams.length - 1;
    const pOffset = dataParams.length;

    const dataQuery = `
      SELECT u.id_usuario, u.nombre, u.apellido_paterno, u.apellido_materno, u.correo, 
             u.pertenece_a_institucion, u.fecha_registro, u.id_rol, r.nombre as nombre_rol, 
             u.id_departamento, d.nombre as nombre_departamento 
      FROM usuarios u 
      INNER JOIN roles r ON r.id_rol = u.id_rol 
      LEFT JOIN departamentos d ON u.id_departamento = d.id_departamento 
      WHERE ${whereClause}
      ORDER BY u.fecha_registro DESC 
      LIMIT $${pLimit} OFFSET $${pOffset}
    `;
    const result = await pool.query(dataQuery, dataParams);

    return {
      users: result.rows,
      total,
      totalPages,
      currentPage: pageNum,
      limit: limitNum
    };
  }

  async findById(id) {
    const query = 'SELECT * FROM usuarios WHERE id_usuario = $1 AND deleted_at IS NULL';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
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
        u.nombre ILIKE CONCAT('%', $1, '%') OR 
        u.apellido_paterno ILIKE CONCAT('%', $2, '%') OR 
        u.apellido_materno ILIKE CONCAT('%', $3, '%') OR
        u.correo ILIKE CONCAT('%', $4, '%')
      )
    `;
    const searchValue = term || '';
    const result = await pool.query(query, [searchValue, searchValue, searchValue, searchValue]);
    return result.rows;
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
        TO_CHAR(u.fecha_registro, 'DD/MM/YYYY') as fecha_registro, 
        u.id_rol, 
        r.nombre as nombre_rol, 
        u.id_departamento, 
        d.nombre as nombre_departamento 
      FROM usuarios u 
      INNER JOIN roles r ON r.id_rol = u.id_rol 
      LEFT JOIN departamentos d ON u.id_departamento = d.id_departamento
      WHERE u.deleted_at IS NULL
      AND u.id_usuario = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async getRoles() {
    const query = 'SELECT * FROM roles';
    const result = await pool.query(query);
    return result.rows;
  }

  async create(data) {
    const query = `
      INSERT INTO usuarios (
        nombre, apellido_paterno, apellido_materno, correo, contrasena, pertenece_a_institucion, id_rol, id_departamento
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id_usuario
    `;
    const result = await pool.query(query, [
      data.nombre,
      data.apellido_paterno,
      data.apellido_materno,
      data.correo,
      data.contrasena,
      data.pertenece_a_institucion !== undefined ? parseInt(data.pertenece_a_institucion, 10) : 1,
      data.id_rol || 4,
      data.id_departamento || 1
    ]);
    return result.rows[0]?.id_usuario;
  }

  async update(id_usuario, data) {
    const query = `
      UPDATE usuarios 
      SET nombre = $1, apellido_paterno = $2, apellido_materno = $3, correo = $4, 
          pertenece_a_institucion = $5, id_rol = $6, id_departamento = $7 
      WHERE id_usuario = $8 AND deleted_at IS NULL
    `;
    const result = await pool.query(query, [
      data.nombre,
      data.apellido_paterno,
      data.apellido_materno,
      data.correo,
      data.pertenece_a_institucion !== undefined ? parseInt(data.pertenece_a_institucion, 10) : 1,
      data.id_rol,
      data.id_departamento,
      id_usuario
    ]);
    return result.rowCount;
  }

  async delete(id_usuario) {
    const query = 'UPDATE usuarios SET deleted_at = CURRENT_TIMESTAMP WHERE id_usuario = $1';
    const result = await pool.query(query, [id_usuario]);
    return result.rowCount;
  }
}

module.exports = new PostgresUserRepository();
