const { pool } = require('../../config/db.js');

class MysqlDashboardRepository {
  async getSystemAdminStats() {
    const [totalDeptsRes] = await pool.query(
      'SELECT COUNT(*) as total FROM departamentos WHERE id_departamento != 1 AND deleted_at IS NULL'
    );
    const totalDepts = parseInt(totalDeptsRes[0]?.total, 10) || 0;

    const [totalUsersRes] = await pool.query(
      'SELECT COUNT(*) as total FROM usuarios WHERE deleted_at IS NULL'
    );
    const totalUsers = parseInt(totalUsersRes[0]?.total, 10) || 0;

    const [totalDocsRes] = await pool.query(
      'SELECT COUNT(*) as total FROM documentos WHERE deleted_at IS NULL'
    );
    const totalDocs = parseInt(totalDocsRes[0]?.total, 10) || 0;

    const [docsPerDeptRes] = await pool.query(`
      SELECT d.nombre as departamento, COUNT(doc.id_documento) as total 
      FROM departamentos d 
      LEFT JOIN documentos doc ON d.id_departamento = doc.id_departamento AND doc.deleted_at IS NULL 
      WHERE d.id_departamento != 1 AND d.deleted_at IS NULL 
      GROUP BY d.id_departamento, d.nombre
      ORDER BY total DESC LIMIT 5
    `);

    const [recentDeptsRes] = await pool.query(`
      SELECT nombre, descripcion, fecha_creacion 
      FROM departamentos 
      WHERE id_departamento != 1 AND deleted_at IS NULL 
      ORDER BY fecha_creacion DESC LIMIT 5
    `);

    return {
      cards: {
        totalDepts,
        totalUsers,
        totalDocs
      },
      chartData: docsPerDeptRes,
      recentData: recentDeptsRes
    };
  }

  async getDeptAdminStats(idDepartamento) {
    const [totalUsersRes] = await pool.query(
      'SELECT COUNT(*) as total FROM usuarios WHERE id_departamento = ? AND deleted_at IS NULL',
      [idDepartamento]
    );
    const totalUsers = parseInt(totalUsersRes[0]?.total, 10) || 0;

    const [totalDocsRes] = await pool.query(
      'SELECT COUNT(*) as total FROM documentos WHERE id_departamento = ? AND deleted_at IS NULL',
      [idDepartamento]
    );
    const totalDocs = parseInt(totalDocsRes[0]?.total, 10) || 0;

    const [docsThisMonthRes] = await pool.query(`
      SELECT COUNT(*) as total 
      FROM documentos 
      WHERE id_departamento = ? AND deleted_at IS NULL 
        AND MONTH(fecha_creacion) = MONTH(CURRENT_DATE()) 
        AND YEAR(fecha_creacion) = YEAR(CURRENT_DATE())
    `, [idDepartamento]);
    const docsThisMonth = parseInt(docsThisMonthRes[0]?.total, 10) || 0;

    const [monthlyTrendRes] = await pool.query(`
      SELECT DATE_FORMAT(fecha_creacion, '%b %Y') as mes, COUNT(*) as total 
      FROM documentos 
      WHERE id_departamento = ? AND deleted_at IS NULL 
        AND fecha_creacion >= DATE_SUB(NOW(), INTERVAL 6 MONTH) 
      GROUP BY DATE_FORMAT(fecha_creacion, '%b %Y'), YEAR(fecha_creacion), MONTH(fecha_creacion) 
      ORDER BY MIN(fecha_creacion) ASC
    `, [idDepartamento]);

    const [recentDocsRes] = await pool.query(`
      SELECT id_documento, nombre, subido_por, fecha_creacion 
      FROM documentos 
      WHERE id_departamento = ? AND deleted_at IS NULL 
      ORDER BY fecha_creacion DESC LIMIT 5
    `, [idDepartamento]);

    return {
      cards: {
        totalUsers,
        totalDocs,
        docsThisMonth
      },
      chartData: monthlyTrendRes,
      recentData: recentDocsRes
    };
  }

  async getUserStats(idDepartamento, idUsuario, username) {
    const [myDocsRes] = await pool.query(
      'SELECT COUNT(*) as total FROM documentos WHERE id_departamento = ? AND (id_usuario = ? OR (id_usuario IS NULL AND subido_por = ?)) AND deleted_at IS NULL',
      [idDepartamento, idUsuario || 0, username || '']
    );
    const myDocs = parseInt(myDocsRes[0]?.total, 10) || 0;

    const [totalDeptDocsRes] = await pool.query(
      'SELECT COUNT(*) as total FROM documentos WHERE id_departamento = ? AND deleted_at IS NULL',
      [idDepartamento]
    );
    const totalDeptDocs = parseInt(totalDeptDocsRes[0]?.total, 10) || 0;

    const [docsThisWeekRes] = await pool.query(`
      SELECT COUNT(*) as total 
      FROM documentos 
      WHERE id_departamento = ? AND deleted_at IS NULL 
        AND fecha_creacion >= DATE_SUB(NOW(), INTERVAL 7 DAY)
    `, [idDepartamento]);
    const docsThisWeek = parseInt(docsThisWeekRes[0]?.total, 10) || 0;

    const [fileExtensionsRes] = await pool.query(`
      SELECT LOWER(SUBSTRING_INDEX(direccion, '.', -1)) as ext, COUNT(*) as total 
      FROM documentos 
      WHERE id_departamento = ? AND deleted_at IS NULL 
      GROUP BY ext
      ORDER BY total DESC LIMIT 5
    `, [idDepartamento]);

    const [myRecentDocsRes] = await pool.query(`
      SELECT id_documento, nombre, subido_por, fecha_creacion 
      FROM documentos 
      WHERE id_departamento = ? AND (id_usuario = ? OR (id_usuario IS NULL AND subido_por = ?)) AND deleted_at IS NULL 
      ORDER BY fecha_creacion DESC LIMIT 5
    `, [idDepartamento, idUsuario || 0, username || '']);

    return {
      cards: {
        myDocs,
        totalDeptDocs,
        docsThisWeek
      },
      chartData: fileExtensionsRes,
      recentData: myRecentDocsRes
    };
  }

  async getAuditorStats(idDepartamento) {
    const [totalDocsRes] = await pool.query(
      'SELECT COUNT(*) as total FROM documentos WHERE id_departamento = ? AND privado = 0 AND deleted_at IS NULL',
      [idDepartamento]
    );
    const totalDocs = parseInt(totalDocsRes[0]?.total, 10) || 0;

    const [docsModifiedRecentlyRes] = await pool.query(`
      SELECT COUNT(*) as total 
      FROM documentos 
      WHERE id_departamento = ? AND privado = 0 AND deleted_at IS NULL 
        AND fecha_ultima_actualizacion >= DATE_SUB(NOW(), INTERVAL 15 DAY)
    `, [idDepartamento]);
    const docsModifiedRecently = parseInt(docsModifiedRecentlyRes[0]?.total, 10) || 0;

    const [totalUsersRes] = await pool.query(
      'SELECT COUNT(*) as total FROM usuarios WHERE id_departamento = ? AND deleted_at IS NULL',
      [idDepartamento]
    );
    const totalUsers = parseInt(totalUsersRes[0]?.total, 10) || 0;

    const [activityPerUserRes] = await pool.query(`
      SELECT subido_por as usuario, COUNT(*) as total 
      FROM documentos 
      WHERE id_departamento = ? AND privado = 0 AND deleted_at IS NULL 
      GROUP BY subido_por
      ORDER BY total DESC
      LIMIT 5
    `, [idDepartamento]);

    const [recentModifiedDocsRes] = await pool.query(`
      SELECT id_documento, nombre, subido_por, fecha_ultima_actualizacion as fecha_creacion 
      FROM documentos 
      WHERE id_departamento = ? AND privado = 0 AND deleted_at IS NULL 
      ORDER BY fecha_ultima_actualizacion DESC LIMIT 5
    `, [idDepartamento]);

    return {
      cards: {
        totalDocs,
        docsModifiedRecently,
        totalUsers
      },
      chartData: activityPerUserRes,
      recentData: recentModifiedDocsRes
    };
  }
}

module.exports = new MysqlDashboardRepository();
