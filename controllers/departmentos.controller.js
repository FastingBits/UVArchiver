const DepartmentService = require("../services/departamentos.service");
const { promises: fs } = require("fs");
const path = require("path");

const getDepartments = async (req, res) => {
    try {
        const departments = await DepartmentService.getDepartments();
        res.json({ success: true, departments });
    } catch (error) {
        console.error('Error al obtener departamentos:', error);
        res.status(500).json({ success: false, message: 'Error al obtener departamentos' });
    }
};

const addDepartment = async (req, res) => {
    const { name, descripcion } = req.body;
    if (!name || !descripcion) {
        return res.status(400).json({ success: false, message: 'El nombre y la descripción del departamento son obligatorios' });
    }
    try {
        const departmentId = await DepartmentService.addDepartment(name, descripcion);

        if (!departmentId) {
            return res.status(400).json({ success: false, message: 'Error al agregar el departamento' });
        }

        const deptPath = path.join(__dirname, '..', 'uploads', 'Departamentos', `depto_${departmentId}`);
        await fs.mkdir(deptPath, { recursive: true });

        res.json({ success: true, departmentId, message: 'Departamento agregado correctamente' });
    } catch (error) {
        console.error('Error al agregar departamento:', error);
        if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
            return res.status(409).json({ success: false, message: 'Ya existe un departamento registrado con ese nombre.' });
        }
        res.status(500).json({ success: false, message: 'Error al agregar departamento' });
    }
};

const updateDepartment = async (req, res) => {
    const { id } = req.params;
    const { name, descripcion } = req.body;
    if (!name || !descripcion) {
        return res.status(400).json({ success: false, message: 'El nombre y la descripción del departamento son obligatorios' });
    }
    try {
        const affectedRows = await DepartmentService.updateDepartment(id, name, descripcion);
        if (affectedRows > 0) {
            res.json({ success: true, message: 'Departamento actualizado correctamente' });
        } else {
            res.status(404).json({ success: false, message: 'Departamento no encontrado o eliminado' });
        }
    } catch (error) {
        console.error('Error al actualizar departamento:', error);
        if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
            return res.status(409).json({ success: false, message: 'Ya existe otro departamento registrado con ese nombre.' });
        }
        res.status(500).json({ success: false, message: 'Error al actualizar departamento' });
    }
};

const deleteDepartment = async (req, res) => {
    const { id } = req.params;
    try {
        const affectedRows = await DepartmentService.deleteDepartment(id);
        if (affectedRows > 0) {
            res.json({ success: true, message: 'Departamento eliminado correctamente' });
        } else {
            res.status(404).json({ success: false, message: 'Departamento no encontrado' });
        }
    } catch (error) {
        console.error('Error al eliminar departamento:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar departamento' });
    }
};

module.exports = { getDepartments, addDepartment, updateDepartment, deleteDepartment };