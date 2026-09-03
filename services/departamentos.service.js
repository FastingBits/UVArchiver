const { pool } = require("../config/db.js");

class DepartmentService {
    async getDepartments() {
        try {
            const result = await pool.query(
                "SELECT * FROM departamentos WHERE deleted_at IS NULL ORDER BY id_departamento ASC"
            );

            return result.rows;
        } catch (error) {
            console.error('Error al obtener departamentos:', error);
            throw error;
        }
    }

    async getDepartmentByUserId(id_usuario) {
        try {
            const result = await pool.query(
                "SELECT id_departamento FROM usuarios WHERE id_usuario = $1 AND deleted_at IS NULL",
                [id_usuario]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error al obtener departamento por usuario:', error);
            throw error;
        }
    }

    async getDepartmentById(id) {
        try {
            const result = await pool.query(
                "SELECT * FROM departamentos WHERE id_departamento = $1 AND deleted_at IS NULL",
                [id]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error al obtener departamento por ID:', error);
            throw error;
        }
    }

    async addDepartment(name, descripcion) {
        try {
            const result = await pool.query(
                "INSERT INTO departamentos (nombre, descripcion) VALUES ($1, $2) RETURNING id_departamento",
                [name, descripcion]
            );
            return result.rows[0]?.id_departamento;
        } catch (error) {
            console.error('Error al agregar departamento:', error);
            throw error;
        }
    }

    async updateDepartment(id, name, descripcion) {
        try {
            const result = await pool.query(
                "UPDATE departamentos SET nombre = $1, descripcion = $2 WHERE id_departamento = $3 AND deleted_at IS NULL",
                [name, descripcion, id]
            );
            return result.rowCount;
        } catch (error) {
            console.error('Error al actualizar departamento:', error);
            throw error;
        }
    }

    async deleteDepartment(id) {
        try {
            const result = await pool.query(
                "UPDATE departamentos SET deleted_at = CURRENT_TIMESTAMP WHERE id_departamento = $1",
                [id]
            );
            return result.rowCount;
        } catch (error) {
            console.error('Error al eliminar departamento:', error);
            throw error;
        }
    }
}

module.exports = new DepartmentService();