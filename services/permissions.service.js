const { pool } = require("../config/db.js");

class PermissionService {
    constructor() {
        this.pool = pool;
    }

    async getRoles() {
        try {
            const result = await this.pool.query("SELECT id_rol, nombre FROM roles ORDER BY id_rol DESC");
            return result.rows;
        } catch (error) {
            console.error('Error al obtener roles:', error);
            throw error;
        }
    }

    async getActions() {
        try {
            const result = await this.pool.query("SELECT id_accion, nombre FROM acciones");
            return result.rows;
        } catch (error) {
            console.error('Error al obtener acciones:', error);
            throw error;
        }
    };

    async getRoleActions() {
        try {
            const result = await this.pool.query(`
            SELECT ra.id_rol, ra.id_accion, r.nombre as rol_nombre, a.nombre as accion_nombre
            FROM rol_acciones ra
            JOIN roles r ON ra.id_rol = r.id_rol
            JOIN acciones a ON ra.id_accion = a.id_accion
            ORDER BY r.nombre, a.nombre
            `);

            return result.rows;
        } catch (error) {
            console.error('Error al obtener acciones de roles:', error);
            throw error;
        }
    };

    async verifyPermission(id_user, required_permission) {
        try {
            if (!id_user || !required_permission) {
                return false;
            }

            const userResult = await this.pool.query(`
            SELECT id_rol FROM usuarios
            WHERE id_usuario = $1
            `, [id_user]);

            if (!userResult.rows[0]) {
                console.error('Usuario no encontrado');
                return false;
            }

            const permResult = await this.pool.query(`
            SELECT id_accion FROM acciones
            WHERE nombre = $1
            `, [required_permission]);

            if (!permResult.rows[0]) {
                return false;
            }

            const checkResult = await this.pool.query(`
            SELECT 1 FROM rol_acciones
            WHERE id_rol = $1 AND id_accion = $2
            `, [userResult.rows[0].id_rol, permResult.rows[0].id_accion]);

            return checkResult.rows.length > 0;
        } catch (error) {
            console.error('Error al verificar permiso:', error);
            throw error;
        }
    }
}

module.exports = new PermissionService();