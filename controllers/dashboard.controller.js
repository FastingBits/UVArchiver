const {
    getSystemAdminStats,
    getDeptAdminStats,
    getUserStats,
    getAuditorStats
} = require("../services/dashboard.service.js");

const getDashboardStats = async (req, res) => {
    const user = req.session.user;
    if (!user) {
        return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
    }

    try {
        let stats;
        const rolId = parseInt(user.rol);
        const deptId = parseInt(user.id_departamento);

        if (rolId === 1) {
            stats = await getSystemAdminStats();
        } else if (rolId === 2) {
            stats = await getDeptAdminStats(deptId);
        } else if (rolId === 3) {
            stats = await getUserStats(deptId, user.id_usuario, user.nombre);
        } else if (rolId === 4) {
            if (deptId === 1) {
                stats = {
                    noDepartment: true,
                    message: 'Usted no tiene un departamento asignado. Verifique con el administrador del sistema si se trata de un error'
                };
            } else {
                stats = await getAuditorStats(deptId);
            }
        } else {
            return res.status(400).json({ success: false, message: 'Rol inválido o no reconocido' });
        }

        res.json({ success: true, stats });
    } catch (error) {
        console.error('Error al obtener estadísticas del dashboard:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor al procesar estadísticas' });
    }
};

module.exports = { getDashboardStats };
