const { dashboardRepository } = require('../repositories');

const getSystemAdminStats = async () => {
    try {
        return await dashboardRepository.getSystemAdminStats();
    } catch (error) {
        console.error('Error en getSystemAdminStats:', error);
        throw error;
    }
};

const getDeptAdminStats = async (idDepartamento) => {
    try {
        return await dashboardRepository.getDeptAdminStats(idDepartamento);
    } catch (error) {
        console.error('Error en getDeptAdminStats:', error);
        throw error;
    }
};

const getUserStats = async (idDepartamento, idUsuario, username) => {
    try {
        return await dashboardRepository.getUserStats(idDepartamento, idUsuario, username);
    } catch (error) {
        console.error('Error en getUserStats:', error);
        throw error;
    }
};

const getAuditorStats = async (idDepartamento) => {
    try {
        return await dashboardRepository.getAuditorStats(idDepartamento);
    } catch (error) {
        console.error('Error en getAuditorStats:', error);
        throw error;
    }
};

module.exports = {
    getSystemAdminStats,
    getDeptAdminStats,
    getUserStats,
    getAuditorStats
};
