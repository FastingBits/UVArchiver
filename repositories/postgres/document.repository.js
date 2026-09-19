const { pool } = require('../../config/db.js');

class PostgresDocumentRepository {
  async findPaginatedByDepartmentId(id_departamento, { page = 1, limit = 10, search = '', date = '', userRol = null } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (pageNum - 1) * limitNum;

    const whereConditions = [];
    const queryParams = [];

    queryParams.push(id_departamento);
    whereConditions.push(`id_departamento = $${queryParams.length}`);
    whereConditions.push('deleted_at IS NULL');

    if (userRol === 4) {
      whereConditions.push('privado = 0');
    }

    if (search && search.trim() !== '') {
      queryParams.push(search.trim());
      const p1 = queryParams.length;
      queryParams.push(search.trim());
      const p2 = queryParams.length;
      whereConditions.push(`(nombre ILIKE CONCAT('%', $${p1}, '%') OR subido_por ILIKE CONCAT('%', $${p2}, '%'))`);
    }

    if (date && date.trim() !== '') {
      queryParams.push(date.trim());
      whereConditions.push(`DATE(fecha_creacion) = $${queryParams.length}`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Conteo total
    const countQuery = `SELECT COUNT(*) as total FROM documentos WHERE ${whereClause}`;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0]?.total, 10) || 0;
    const totalPages = Math.ceil(total / limitNum) || 1;

    // Consulta de registros
    const dataParams = [...queryParams, limitNum, offset];
    const pLimit = dataParams.length - 1;
    const pOffset = dataParams.length;

    const dataQuery = `SELECT * FROM documentos WHERE ${whereClause} ORDER BY fecha_creacion DESC LIMIT $${pLimit} OFFSET $${pOffset}`;
    const result = await pool.query(dataQuery, dataParams);

    return {
      docs: result.rows,
      total,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
      id_departamento
    };
  }

  async findById(id_documento) {
    const query = 'SELECT * FROM documentos WHERE id_documento = $1 AND deleted_at IS NULL';
    const result = await pool.query(query, [id_documento]);
    return result.rows[0] || null;
  }

  async create({ idDepartamento, idUsuario, nombre, subidoPor, privado }) {
    const privadoValue = (privado === true || privado === 1 || privado === '1') ? 1 : 0;
    const query = `
      INSERT INTO documentos (id_departamento, id_usuario, nombre, direccion, subido_por, privado)
      VALUES ($1, $2, $3, '', $4, $5)
      RETURNING id_documento
    `;
    const result = await pool.query(query, [idDepartamento, idUsuario || null, nombre, subidoPor, privadoValue]);
    return result.rows[0]?.id_documento;
  }

  async updateDirection(idDocumento, direccion) {
    const query = 'UPDATE documentos SET direccion = $1 WHERE id_documento = $2';
    const result = await pool.query(query, [direccion, idDocumento]);
    return result.rowCount;
  }

  async updateInfo(idDocumento, nombre, privado) {
    const privadoValue = (privado === true || privado === 1 || privado === '1') ? 1 : 0;
    const query = 'UPDATE documentos SET nombre = $1, privado = $2 WHERE id_documento = $3 AND deleted_at IS NULL';
    const result = await pool.query(query, [nombre, privadoValue, idDocumento]);
    return result.rowCount;
  }

  async delete(id_documento) {
    const query = 'UPDATE documentos SET deleted_at = CURRENT_TIMESTAMP WHERE id_documento = $1';
    const result = await pool.query(query, [id_documento]);
    return result.rowCount;
  }
}

module.exports = new PostgresDocumentRepository();
