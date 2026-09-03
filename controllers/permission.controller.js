const { PermissionService } = require("../services/permissions.service.js");

class PermissionController {
    constructor() {
        this.permissionService = new PermissionService();
    }

    getRoles = async (req, res) => {
        try {
            const roles = await this.permissionService.getRoles();
            res.status(200).json({ success: true, roles });
        } catch (error) {
            console.error('Error al obtener roles:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }
    }

    getActions = async (req, res) => {
        try {
            const actions = await this.permissionService.getActions();
            res.status(200).json({ success: true, actions });
        } catch (error) {
            console.error('Error al obtener acciones:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }
    }

    getRoleActions = async (req, res) => {
        try {
            const roleActions = await this.permissionService.getRoleActions();
            res.status(200).json({ success: true, roleActions });
        } catch (error) {
            console.error('Error al obtener acciones de roles:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }
    }

    verifyPermission = async (req, res) => {
        try {
            const { id_user, permission_required } = req.body;

            if (!id_user || !permission_required) {
                return res.status(400).json({ success: false, message: 'Usuario y permiso requerido son obligatorios' });
            }

            const permission = await this.permissionService.verifyPermission(id_user, permission_required);
            res.status(200).json({ success: true, permission });
        } catch (error) {
            console.error('Error al verificar permiso:', error);
            res.status(500).json({ success: false, message: 'Error interno del servidor' });
        }
    }
}

module.exports = {
    permissionController: new PermissionController()
};