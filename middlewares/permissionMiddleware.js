const { permissionRepository } = require('../repositories');

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
      // 2. Verificar si el usuario posee la acción requerida mediante el repositorio
      const authorized = await permissionRepository.hasPermission(idUsuario, permisoRequerido);

      if (authorized) {
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
