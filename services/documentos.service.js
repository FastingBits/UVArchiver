const { documentRepository, departmentRepository } = require('../repositories');

const getDocsByDepartamento = async (id_usuario, { page = 1, limit = 10, search = '', date = '', userRol = null } = {}) => {
    try {
        const userDept = await departmentRepository.findByUserId(id_usuario);

        if (!userDept) {
            throw new Error("Usuario no encontrado o inactivo");
        }

        const idDepartamento = userDept.id_departamento;
        return await getDocsByDepartamentoId(idDepartamento, { page, limit, search, date, userRol });
    } catch (error) {
        console.error('Error al obtener documentos:', error);
        throw error;
    }
};

const getDocsByDepartamentoId = async (id_departamento, { page = 1, limit = 10, search = '', date = '', userRol = null } = {}) => {
    try {
        return await documentRepository.findPaginatedByDepartmentId(id_departamento, { page, limit, search, date, userRol });
    } catch (error) {
        console.error('Error al obtener documentos por id de departamento:', error);
        throw error;
    }
};

const getDocumentById = async (id_documento) => {
    try {
        return await documentRepository.findById(id_documento);
    } catch (error) {
        console.error('Error al obtener documento por ID:', error);
        throw error;
    }
};

const createDocument = async (idDepartamento, idUsuario, nombre, subidoPor, privado = true) => {
    try {
        if (idDepartamento === 1) {
            throw new Error("Error al crear documento, el departamento no existe");
        }

        return await documentRepository.create({ idDepartamento, idUsuario, nombre, subidoPor, privado });
    } catch (error) {
        console.error('Error al crear documento en servicio:', error);
        throw error;
    }
};

const updateDocumentDirection = async (idDocumento, direccion) => {
    try {
        return await documentRepository.updateDirection(idDocumento, direccion);
    } catch (error) {
        console.error('Error al actualizar dirección del documento:', error);
        throw error;
    }
};

const deleteDocument = async (id_documento) => {
    try {
        return await documentRepository.delete(id_documento);
    } catch (error) {
        console.error('Error al eliminar documento en servicio:', error);
        throw error;
    }
};

const updateDocumentInfo = async (idDocumento, nombre, privado) => {
    try {
        return await documentRepository.updateInfo(idDocumento, nombre, privado);
    } catch (error) {
        console.error('Error al actualizar información del documento:', error);
        throw error;
    }
};

module.exports = {
    getDocsByDepartamento,
    getDocsByDepartamentoId,
    getDocumentById,
    createDocument,
    updateDocumentDirection,
    updateDocumentInfo,
    deleteDocument
};