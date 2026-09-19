const { pool } = require('../../config/db.js');

class PostgresDashboardRepository {
  async getSystemAdminStats() {
    const totalDeptsRes = await pool.query(
      'SELECT COUNT(*) as total FROM departamentos WHERE id_departamento != 1 AND deleted_at IS NULL'
    );
    const totalDepts = parseInt(totalDeptsRes.rows[0]?.total, 10) || 0;

    const totalUsersRes = await pool.query(
      'SELECT COUNT(*) as total FROM usuarios WHERE deleted_at IS NULL'
    );
    const totalUsers = parseInt(totalUsersRes.rows[0]?.total, 10) || 0;

    const totalDocsRes = await pool.query(
      'SELECT COUNT(*) as total FROM documentos WHERE deleted_at IS NULL'
    );
    const totalDocs = parseInt(totalDocsRes.rows[0]?.total, 10) || 0;

    const docsPerDeptRes = await pool.query(`
      SELECT d.nombre as departamento, COUNT(doc.id_documento) as total 
      FROM departamentos d 
      LEFT JOIN documentos doc ON d.id_departamento = doc.id_departamento AND doc.deleted_at IS NULL 
      WHERE d.id_departamento != 1 AND d.deleted_at IS NULL 
      GROUP BY d.id_departamento, d.nombre
      ORDER BY total DESC LIMIT 5
    `);

    const recentDeptsRes = await pool.query(`
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
      chartData: docsPerDeptRes.rows,
      recentData: recentDeptsRes.rows
    };
  }

  async getDeptAdminStats(idDepartamento) {
    const totalUsersRes = await pool.query(
      'SELECT COUNT(*) as total FROM usuarios WHERE id_departamento = $1 AND deleted_at IS NULL',
      [idDepartamento]
    );
    const totalUsers = parseInt(totalUsersRes.rows[0]?.total, 10) || 0;

    const totalDocsRes = await pool.query(
      'SELECT COUNT(*) as total FROM documentos WHERE id_departamento = $1 AND deleted_at IS NULL',
      [idDepartamento]
    );
    const totalDocs = parseInt(totalDocsRes.rows[0]?.total, 10) || 0;

    const docsThisMonthRes = await pool.query(`
      SELECT COUNT(*) as total 
      FROM documentos 
      WHERE id_departamento = $1 AND deleted_at IS NULL 
        AND EXTRACT(MONTH FROM fecha_creacion) = EXTRACT(MONTH FROM CURRENT_DATE) 
        AND EXTRACT(YEAR FROM fecha_creacion) = EXTRACT(YEAR FROM CURRENT_DATE)
    `, [idDepartamento]);
    const docsThisMonth = parseInt(docsThisMonthRes.rows[0]?.total, 10) || 0;

    const monthlyTrendRes = await pool.query(`
      SELECT TO_CHAR(fecha_creacion, 'Mon YYYY') as mes, COUNT(*) as total 
      FROM documentos 
      WHERE id_departamento = $1 AND deleted_at IS NULL 
        AND fecha_creacion >= NOW() - INTERVAL '6 months' 
      GROUP BY TO_CHAR(fecha_creacion, 'Mon YYYY'), EXTRACT(YEAR FROM fecha_creacion), EXTRACT(MONTH FROM fecha_creacion) 
      ORDER BY MIN(fecha_creacion) ASC
    `, [idDepartamento]);

    const recentDocsRes = await pool.query(`
      SELECT id_documento, nombre, subido_por, fecha_creacion 
      FROM documentos 
      WHERE id_departamento = $1 AND deleted_at IS NULL 
      ORDER BY fecha_creacion DESC LIMIT 5
    `, [idDepartamento]);

    return {
      cards: {
        totalUsers,
        totalDocs,
        docsThisMonth
      },
      chartData: monthlyTrendRes.rows,
      recentData: recentDocsRes.rows
    };
  }

  async getUserStats(idDepartamento, idUsuario, username) {
    const myDocsRes = await pool.query(
      'SELECT COUNT(*) as total FROM documentos WHERE id_departamento = $1 AND (id_usuario = $2 OR (id_usuario IS NULL AND subido_por = $3)) AND deleted_at IS NULL',
      [idDepartamento, idUsuario || 0, username || '']
    );
    const myDocs = parseInt(myDocsRes.rows[0]?.total, 10) || 0;

    const totalDeptDocsRes = await pool.query(
      'SELECT COUNT(*) as total FROM documentos WHERE id_departamento = $1 AND deleted_at IS NULL',
      [idDepartamento]
    );
    const totalDeptDocs = parseInt(totalDeptDocsRes.rows[0]?.total, 10) || 0;

    const docsThisWeekRes = await pool.query(`
      SELECT COUNT(*) as total 
      FROM documentos 
      WHERE id_departamento = $1 AND deleted_at IS NULL 
        AND fecha_creacion >= NOW() - INTERVAL '7 days'
    `, [idDepartamento]);
    const docsThisWeek = parseInt(docsThisWeekRes.rows[0]?.total, 10) || 0;

    const fileExtensionsRes = await pool.query(`
      SELECT LOWER(SUBSTRING(direccion FROM '[^.]+$')) as ext, COUNT(*) as total 
      FROM documentos 
      WHERE id_departamento = $1 AND deleted_at IS NULL 
      GROUP BY ext
      ORDER BY total DESC LIMIT 5
    `, [idDepartamento]);

    const myRecentDocsRes = await pool.query(`
      SELECT id_documento, nombre, subido_por, fecha_creacion 
      FROM documentos 
      WHERE id_departamento = $1 AND (id_usuario = $2 OR (id_usuario IS NULL AND subido_por = $3)) AND deleted_at IS NULL 
      ORDER BY fecha_creacion DESC LIMIT 5
    `, [idDepartamento, idUsuario || 0, username || '']);

    return {
      cards: {
        myDocs,
        totalDeptDocs,
        docsThisWeek
      },
      chartData: fileExtensionsRes.rows,
      recentData: myRecentDocsRes.rows
    };
  }

  async getAuditorStats(idDepartamento) {
    const totalDocsRes = await pool.query(
      'SELECT COUNT(*) as total FROM documentos WHERE id_departamento = $1 AND privado = 0 AND deleted_at IS NULL',
      [idDepartamento]
    );
    const totalDocs = parseInt(totalDocsRes.rows[0]?.total, 10) || 0;

    const docsModifiedRecentlyRes = await pool.query(`
      SELECT COUNT(*) as total 
      FROM documentos 
      WHERE id_departamento = $1 AND privado = 0 AND deleted_at IS NULL 
        AND fecha_ultima_actualizacion >= NOW() - INTERVAL '15 days'
    `, [idDepartamento]);
    const docsModifiedRecently = parseInt(docsModifiedRecentlyRes.rows[0]?.total, 10) || 0;

    const totalUsersRes = await pool.query(
      'SELECT COUNT(*) as total FROM usuarios WHERE id_departamento = $1 AND deleted_at IS NULL',
      [idDepartamento]
    );
    const totalUsers = parseInt(totalUsersRes.rows[0]?.total, 10) || 0;

    const activityPerUserRes = await pool.query(`
      SELECT subido_por as usuario, COUNT(*) as total 
      FROM documentos 
      WHERE id_departamento = $1 AND privado = 0 AND deleted_at IS NULL 
      GROUP BY subido_por
      ORDER BY total DESC
      LIMIT 5
    `, [idDepartamento]);

    const recentModifiedDocsRes = await pool.query(`
      SELECT id_documento, nombre, subido_por, fecha_ultima_actualizacion as fecha_creacion 
      FROM documentos 
      WHERE id_departamento = $1 AND privado = 0 AND deleted_at IS NULL 
      ORDER BY fecha_ultima_actualizacion DESC LIMIT 5
    `, [idDepartamento]);

    return {
      cards: {
        totalDocs,
        docsModifiedRecently,
        totalUsers
      },
      chartData: activityPerUserRes.rows,
      recentData: recentModifiedDocsRes.rows
    };
  }
}

module.exports = new PostgresDashboardRepository();
