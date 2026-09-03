const { pool } = require('../config/db.js');
const bcrypt = require('bcryptjs');

const getUsers = async () => {
    try {
        const result = await pool.query(
            "SELECT u.id_usuario, u.nombre, u.apellido_paterno, u.apellido_materno, u.correo, u.pertenece_a_institucion, u.fecha_registro, u.id_rol, r.nombre as nombre_rol, u.id_departamento, d.nombre as nombre_departamento FROM usuarios u INNER JOIN roles r ON r.id_rol = u.id_rol LEFT JOIN departamentos d ON u.id_departamento = d.id_departamento WHERE u.deleted_at IS NULL"
        );
        return result.rows;
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        throw error;
    }
};

const getUsersPaginated = async ({ page = 1, limit = 10, search = '', date = '', id_departamento = null } = {}) => {
    try {
        page = Math.max(1, parseInt(page) || 1);
        limit = Math.max(1, parseInt(limit) || 10);
        const offset = (page - 1) * limit;

        let whereConditions = ["u.deleted_at IS NULL"];
        let queryParams = [];

        if (id_departamento) {
            queryParams.push(id_departamento);
            whereConditions.push(`u.id_departamento = $${queryParams.length}`);
        }

        if (search && search.trim() !== '') {
            const term = search.trim();
            const p1 = queryParams.length + 1;
            const p2 = queryParams.length + 2;
            const p3 = queryParams.length + 3;
            const p4 = queryParams.length + 4;
            const p5 = queryParams.length + 5;
            const p6 = queryParams.length + 6;
            queryParams.push(term, term, term, term, term, term);
            whereConditions.push(`(u.nombre ILIKE CONCAT('%', $${p1}, '%') OR u.apellido_paterno ILIKE CONCAT('%', $${p2}, '%') OR u.apellido_materno ILIKE CONCAT('%', $${p3}, '%') OR u.correo ILIKE CONCAT('%', $${p4}, '%') OR r.nombre ILIKE CONCAT('%', $${p5}, '%') OR d.nombre ILIKE CONCAT('%', $${p6}, '%'))`);
        }

        if (date && date.trim() !== '') {
            queryParams.push(date.trim());
            whereConditions.push(`DATE(u.fecha_registro) = $${queryParams.length}`);
        }

        const whereClause = whereConditions.join(" AND ");

        // Conteo total
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM usuarios u 
            INNER JOIN roles r ON r.id_rol = u.id_rol 
            LEFT JOIN departamentos d ON u.id_departamento = d.id_departamento 
            WHERE ${whereClause}
        `;
        const countResult = await pool.query(countQuery, queryParams);
        const total = parseInt(countResult.rows[0].total, 10) || 0;
        const totalPages = Math.ceil(total / limit) || 1;

        // Consulta de usuarios paginados
        const dataParams = [...queryParams];
        dataParams.push(limit);
        const pLimit = dataParams.length;
        dataParams.push(offset);
        const pOffset = dataParams.length;

        const dataQuery = `
            SELECT u.id_usuario, u.nombre, u.apellido_paterno, u.apellido_materno, u.correo, 
                   u.pertenece_a_institucion, u.fecha_registro, u.id_rol, r.nombre as nombre_rol, 
                   u.id_departamento, d.nombre as nombre_departamento 
            FROM usuarios u 
            INNER JOIN roles r ON r.id_rol = u.id_rol 
            LEFT JOIN departamentos d ON u.id_departamento = d.id_departamento 
            WHERE ${whereClause}
            ORDER BY u.fecha_registro DESC 
            LIMIT $${pLimit} OFFSET $${pOffset}
        `;
        const result = await pool.query(dataQuery, dataParams);

        return {
            users: result.rows,
            total,
            totalPages,
            currentPage: page,
            limit
        };
    } catch (error) {
        console.error('Error en getUsersPaginated:', error);
        throw error;
    }
};

const getUserById = async (id) => {
    try {
        const result = await pool.query(
            "SELECT * FROM usuarios WHERE id_usuario = $1 AND deleted_at IS NULL",
            [id]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error al obtener usuario por ID:', error);
        throw error;
    }
};

const searchUser = async (data) => {
    try {
        const query = `SELECT 
        u.id_usuario, 
        u.nombre, 
        u.apellido_paterno, 
        u.apellido_materno, 
        u.correo, 
        u.pertenece_a_institucion, 
        u.fecha_registro, 
        u.id_rol, 
        r.nombre as nombre_rol, 
        u.id_departamento, 
        d.nombre as nombre_departamento 
    FROM usuarios u 
    INNER JOIN roles r ON r.id_rol = u.id_rol 
    LEFT JOIN departamentos d ON u.id_departamento = d.id_departamento
    WHERE u.deleted_at IS NULL
    AND (
        u.nombre ILIKE CONCAT('%', $1, '%') OR 
        u.apellido_paterno ILIKE CONCAT('%', $2, '%') OR 
        u.apellido_materno ILIKE CONCAT('%', $3, '%') OR
        u.correo ILIKE CONCAT('%', $4, '%')
    )`;
        const searchValue = data.value || data.query || '';
        const result = await pool.query(query, [searchValue, searchValue, searchValue, searchValue]);
        return result.rows;
    } catch (error) {
        console.error('Error al buscar usuarios:', error);
        throw error;
    }
};

const getProfileData = async (id) => {
    try {
        const result = await pool.query(
            `SELECT 
        u.id_usuario, 
        u.nombre, 
        u.apellido_paterno, 
        u.apellido_materno, 
        u.correo, 
        u.pertenece_a_institucion, 
        TO_CHAR(u.fecha_registro, 'DD/MM/YYYY') as fecha_registro, 
        u.id_rol, 
        r.nombre as nombre_rol, 
        u.id_departamento, 
        d.nombre as nombre_departamento 
    FROM usuarios u 
    INNER JOIN roles r ON r.id_rol = u.id_rol 
    LEFT JOIN departamentos d ON u.id_departamento = d.id_departamento
    WHERE u.deleted_at IS NULL
    AND u.id_usuario = $1`,
            [id]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error al obtener datos del perfil:', error);
        throw error;
    }
};

const getRoles = async () => {
    try {
        const result = await pool.query("SELECT * FROM roles");
        return result.rows;
    } catch (error) {
        console.error('Error al obtener roles:', error);
        throw error;
    }
};

const addUser = async (data) => {
    try {
        const hashedPassword = await bcrypt.hash(data.contrasena || '123456', 10);
        const query = `
            INSERT INTO usuarios (
                nombre, apellido_paterno, apellido_materno, correo, contrasena, pertenece_a_institucion, id_rol, id_departamento
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING id_usuario
        `;
        const result = await pool.query(query, [
            data.nombre,
            data.apellido_paterno,
            data.apellido_materno,
            data.correo,
            hashedPassword,
            data.pertenece_a_institucion !== undefined ? parseInt(data.pertenece_a_institucion) : 1,
            data.id_rol || 4,
            data.id_departamento || 1
        ]);
        return result.rows[0]?.id_usuario;
    } catch (error) {
        console.error('Error al agregar usuario en servicio:', error);
        throw error;
    }
};

const updateUser = async (id_usuario, data) => {
    try {
        const result = await pool.query(
            "UPDATE usuarios SET nombre = $1, apellido_paterno = $2, apellido_materno = $3, correo = $4, pertenece_a_institucion = $5, id_rol = $6, id_departamento = $7 WHERE id_usuario = $8 AND deleted_at IS NULL",
            [
                data.nombre,
                data.apellido_paterno,
                data.apellido_materno,
                data.correo,
                data.pertenece_a_institucion !== undefined ? parseInt(data.pertenece_a_institucion) : 1,
                data.id_rol,
                data.id_departamento,
                id_usuario
            ]
        );
        return result.rowCount;
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        throw error;
    }
};

const deleteUser = async (id_usuario) => {
    try {
        const result = await pool.query(
            "UPDATE usuarios SET deleted_at = CURRENT_TIMESTAMP WHERE id_usuario = $1",
            [id_usuario]
        );
        return result.rowCount;
    } catch (error) {
        console.error('Error al eliminar usuario en servicio:', error);
        throw error;
    }
};

module.exports = { getUsers, getUsersPaginated, getUserById, searchUser, getProfileData, getRoles, addUser, updateUser, deleteUser };