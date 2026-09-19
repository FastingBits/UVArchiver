const { departmentRepository } = require('../repositories');

class DepartmentService {
    async getDepartments() {
        try {
            return await departmentRepository.findAll();
        } catch (error) {
            console.error('Error al obtener departamentos:', error);
            throw error;
        }
    }

    async getDepartmentByUserId(id_usuario) {
        try {
            return await departmentRepository.findByUserId(id_usuario);
        } catch (error) {
            console.error('Error al obtener departamento por usuario:', error);
            throw error;
        }
    }

    async getDepartmentById(id) {
        try {
            return await departmentRepository.findById(id);
        } catch (error) {
            console.error('Error al obtener departamento por ID:', error);
            throw error;
        }
    }

    async addDepartment(name, descripcion) {
        try {
            return await departmentRepository.create(name, descripcion);
        } catch (error) {
            console.error('Error al agregar departamento:', error);
            throw error;
        }
    }

    async updateDepartment(id, name, descripcion) {
        try {
            return await departmentRepository.update(id, name, descripcion);
        } catch (error) {
            console.error('Error al actualizar departamento:', error);
            throw error;
        }
    }

    async deleteDepartment(id) {
        try {
            return await departmentRepository.delete(id);
        } catch (error) {
            console.error('Error al eliminar departamento:', error);
            throw error;
        }
    }
}

module.exports = new DepartmentService();