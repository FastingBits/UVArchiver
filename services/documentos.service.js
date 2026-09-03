const { pool } = require("../config/db.js");

const getDocsByDepartamento = async (id_usuario, { page = 1, limit = 10, search = '', date = '', userRol = null } = {}) => {
    try {
        const userResult = await pool.query(
            "SELECT id_departamento FROM usuarios WHERE id_usuario = $1 AND deleted_at IS NULL",
            [id_usuario]
        );

        if (userResult.rows.length === 0) {
            throw new Error("Usuario no encontrado o inactivo");
        }

        const idDepartamento = userResult.rows[0].id_departamento;
        return await getDocsByDepartamentoId(idDepartamento, { page, limit, search, date, userRol });
    } catch (error) {
        console.error('Error al obtener documentos:', error);
        throw error;
    }
};

const getDocsByDepartamentoId = async (id_departamento, { page = 1, limit = 10, search = '', date = '', userRol = null } = {}) => {
    try {
        page = Math.max(1, parseInt(page) || 1);
        limit = Math.max(1, parseInt(limit) || 10);
        const offset = (page - 1) * limit;

        let whereConditions = [];
        let queryParams = [];

        queryParams.push(id_departamento);
        whereConditions.push(`id_departamento = $${queryParams.length}`);
        whereConditions.push("deleted_at IS NULL");

        // Regla de confidencialidad: El rol Auditor (Rol 4) no puede ver documentos privados
        if (userRol === 4) {
            whereConditions.push("privado = 0");
        }

        if (search && search.trim() !== '') {
            queryParams.push(search.trim());
            const p1 = queryParams.length;
            queryParams.push(search.trim());
            const p2 = queryParams.length;
            whereConditions.push(`(nombre ILIKE CONCAT('%', $${p1}, '%') OR subido_por ILIKE CONCAT('%', $${p2}, '%'))`);
        }

        if (date && date.trim() !== '') {
            queryParams.push(date.trim());
            whereConditions.push(`DATE(fecha_creacion) = $${queryParams.length}`);
        }

        const whereClause = whereConditions.join(" AND ");

        // Conteo total para paginación
        const countResult = await pool.query(
            `SELECT COUNT(*) as total FROM documentos WHERE ${whereClause}`,
            queryParams
        );
        const total = parseInt(countResult.rows[0].total, 10) || 0;
        const totalPages = Math.ceil(total / limit) || 1;

        // Consulta de filas paginadas
        const dataParams = [...queryParams];
        dataParams.push(limit);
        const pLimit = dataParams.length;
        dataParams.push(offset);
        const pOffset = dataParams.length;

        const result = await pool.query(
            `SELECT * FROM documentos WHERE ${whereClause} ORDER BY fecha_creacion DESC LIMIT $${pLimit} OFFSET $${pOffset}`,
            dataParams
        );

        return {
            docs: result.rows,
            total,
            totalPages,
            currentPage: page,
            limit,
            id_departamento
        };
    } catch (error) {
        console.error('Error al obtener documentos por id de departamento:', error);
        throw error;
    }
};

const getDocumentById = async (id_documento) => {
    try {
        const result = await pool.query(
            "SELECT * FROM documentos WHERE id_documento = $1 AND deleted_at IS NULL",
            [id_documento]
        );
        return result.rows[0];
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

        const privadoValue = (privado === true || privado === 1 || privado === '1') ? 1 : 0;
        const query = `
          INSERT INTO documentos (id_departamento, id_usuario, nombre, direccion, subido_por, privado)
          VALUES ($1, $2, $3, '', $4, $5)
          RETURNING id_documento
        `;
        const result = await pool.query(query, [idDepartamento, idUsuario || null, nombre, subidoPor, privadoValue]);
        return result.rows[0]?.id_documento;
    } catch (error) {
        console.error('Error al crear documento en servicio:', error);
        throw error;
    }
};

const updateDocumentDirection = async (idDocumento, direccion) => {
    try {
        const query = "UPDATE documentos SET direccion = $1 WHERE id_documento = $2";
        const result = await pool.query(query, [direccion, idDocumento]);
        return result.rowCount;
    } catch (error) {
        console.error('Error al actualizar dirección del documento:', error);
        throw error;
    }
};

const deleteDocument = async (id_documento) => {
    try {
        const result = await pool.query(
            "UPDATE documentos SET deleted_at = CURRENT_TIMESTAMP WHERE id_documento = $1",
            [id_documento]
        );
        return result.rowCount;
    } catch (error) {
        console.error('Error al eliminar documento en servicio:', error);
        throw error;
    }
};

const updateDocumentInfo = async (idDocumento, nombre, privado) => {
    try {
        const privadoValue = (privado === true || privado === 1 || privado === '1') ? 1 : 0;
        const query = "UPDATE documentos SET nombre = $1, privado = $2 WHERE id_documento = $3 AND deleted_at IS NULL";
        const result = await pool.query(query, [nombre, privadoValue, idDocumento]);
        return result.rowCount;
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