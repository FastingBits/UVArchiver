const { permissionRepository } = require('../repositories');

class PermissionService {
    async getRoles() {
        try {
            return await permissionRepository.getRoles();
        } catch (error) {
            console.error('Error al obtener roles:', error);
            throw error;
        }
    }

    async getActions() {
        try {
            return await permissionRepository.getActions();
        } catch (error) {
            console.error('Error al obtener acciones:', error);
            throw error;
        }
    }

    async getRoleActions() {
        try {
            return await permissionRepository.getRoleActions();
        } catch (error) {
            console.error('Error al obtener acciones de roles:', error);
            throw error;
        }
    }

    async verifyPermission(id_user, required_permission) {
        try {
            return await permissionRepository.hasPermission(id_user, required_permission);
        } catch (error) {
            console.error('Error al verificar permiso:', error);
            throw error;
        }
    }
}

module.exports = new PermissionService();