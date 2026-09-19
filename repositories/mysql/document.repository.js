const { pool } = require('../../config/db.js');

class MysqlDocumentRepository {
  async findPaginatedByDepartmentId(id_departamento, { page = 1, limit = 10, search = '', date = '', userRol = null } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const offset = (pageNum - 1) * limitNum;

    const whereConditions = [];
    const queryParams = [];

    whereConditions.push('id_departamento = ?');
    queryParams.push(id_departamento);

    whereConditions.push('deleted_at IS NULL');

    if (userRol === 4) {
      whereConditions.push('privado = 0');
    }

    if (search && search.trim() !== '') {
      const term = search.trim();
      whereConditions.push('(nombre LIKE CONCAT(\'%\', ?, \'%\') OR subido_por LIKE CONCAT(\'%\', ?, \'%\'))');
      queryParams.push(term, term);
    }

    if (date && date.trim() !== '') {
      whereConditions.push('DATE(fecha_creacion) = ?');
      queryParams.push(date.trim());
    }

    const whereClause = whereConditions.join(' AND ');

    // Conteo total
    const countQuery = `SELECT COUNT(*) as total FROM documentos WHERE ${whereClause}`;
    const [countRows] = await pool.query(countQuery, queryParams);
    const total = parseInt(countRows[0]?.total, 10) || 0;
    const totalPages = Math.ceil(total / limitNum) || 1;

    // Consulta de filas
    const dataQuery = `
      SELECT * FROM documentos 
      WHERE ${whereClause} 
      ORDER BY fecha_creacion DESC 
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(dataQuery, [...queryParams, limitNum, offset]);

    return {
      docs: rows,
      total,
      totalPages,
      currentPage: pageNum,
      limit: limitNum,
      id_departamento
    };
  }

  async findById(id_documento) {
    const query = 'SELECT * FROM documentos WHERE id_documento = ? AND deleted_at IS NULL';
    const [rows] = await pool.query(query, [id_documento]);
    return rows[0] || null;
  }

  async create({ idDepartamento, idUsuario, nombre, subidoPor, privado }) {
    const privadoValue = (privado === true || privado === 1 || privado === '1') ? 1 : 0;
    const query = `
      INSERT INTO documentos (id_departamento, id_usuario, nombre, direccion, subido_por, privado)
      VALUES (?, ?, ?, '', ?, ?)
    `;
    const [result] = await pool.query(query, [idDepartamento, idUsuario || null, nombre, subidoPor, privadoValue]);
    return result.insertId;
  }

  async updateDirection(idDocumento, direccion) {
    const query = 'UPDATE documentos SET direccion = ? WHERE id_documento = ?';
    const [result] = await pool.query(query, [direccion, idDocumento]);
    return result.affectedRows;
  }

  async updateInfo(idDocumento, nombre, privado) {
    const privadoValue = (privado === true || privado === 1 || privado === '1') ? 1 : 0;
    const query = 'UPDATE documentos SET nombre = ?, privado = ? WHERE id_documento = ? AND deleted_at IS NULL';
    const [result] = await pool.query(query, [nombre, privadoValue, idDocumento]);
    return result.affectedRows;
  }

  async delete(id_documento) {
    const query = 'UPDATE documentos SET deleted_at = CURRENT_TIMESTAMP WHERE id_documento = ?';
    const [result] = await pool.query(query, [id_documento]);
    return result.affectedRows;
  }
}

module.exports = new MysqlDocumentRepository();
