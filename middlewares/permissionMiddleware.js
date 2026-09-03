const { pool } = require('../config/db.js');

/**
 * Middleware para verificar si el usuario tiene permiso para realizar una acción
 * @param {string} permisoRequerido - Nombre de la acción (ej: 'read_document', 'delete_user')
 */
const checkPermission = (permisoRequerido) => {
  return async (req, res, next) => {
    // 1. Verificar si hay un usuario autenticado en la sesión
    if (!req.session || !req.session.user) {
      if (req.originalUrl.startsWith('/api')) {
        return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
      }
      return res.redirect('/login');
    }

    const idUsuario = req.session.user.id_usuario;

    try {
      // 2. Verificar en la base de datos si el rol del usuario posee la acción
      const query = `
        SELECT 1 
        FROM usuarios u
        INNER JOIN rol_acciones ra ON u.id_rol = ra.id_rol
        INNER JOIN acciones a ON ra.id_accion = a.id_accion
        WHERE u.id_usuario = $1 AND a.nombre = $2 AND u.deleted_at IS NULL
      `;

      const result = await pool.query(query, [idUsuario, permisoRequerido]);

      if (result.rows.length > 0) {
        return next(); // Usuario autorizado
      }

      // 3. Respuesta en caso de no tener el permiso (formateada según API o Web)
      console.warn(`Acceso denegado: Usuario ID ${idUsuario} intentó acceder a la acción '${permisoRequerido}'.`);

      if (req.originalUrl.startsWith('/api')) {
        return res.status(403).json({
          success: false,
          message: 'No cuentas con los permisos necesarios para realizar esta acción.'
        });
      }

      return res.status(403).render('404', {
        title: 'Acceso Denegado',
        message: 'No tienes los permisos necesarios para realizar esta acción.'
      });
    } catch (error) {
      console.error('Error en middleware de permisos:', error);
      if (req.originalUrl.startsWith('/api')) {
        return res.status(500).json({ success: false, message: 'Error interno al validar autorizaciones.' });
      }
      return res.status(500).send('Error interno del servidor al validar autorizaciones.');
    }
  };
};

module.exports = { checkPermission };
