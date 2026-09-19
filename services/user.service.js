const { userRepository } = require('../repositories');
const bcrypt = require('bcryptjs');

const getUsers = async () => {
    try {
        return await userRepository.findAll();
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        throw error;
    }
};

const getUsersPaginated = async ({ page = 1, limit = 10, search = '', date = '', id_departamento = null } = {}) => {
    try {
        return await userRepository.findPaginated({ page, limit, search, date, id_departamento });
    } catch (error) {
        console.error('Error en getUsersPaginated:', error);
        throw error;
    }
};

const getUserById = async (id) => {
    try {
        return await userRepository.findById(id);
    } catch (error) {
        console.error('Error al obtener usuario por ID:', error);
        throw error;
    }
};

const searchUser = async (data) => {
    try {
        const searchValue = data.value || data.query || '';
        return await userRepository.search(searchValue);
    } catch (error) {
        console.error('Error al buscar usuarios:', error);
        throw error;
    }
};

const getProfileData = async (id) => {
    try {
        return await userRepository.getProfileData(id);
    } catch (error) {
        console.error('Error al obtener datos del perfil:', error);
        throw error;
    }
};

const getRoles = async () => {
    try {
        return await userRepository.getRoles();
    } catch (error) {
        console.error('Error al obtener roles:', error);
        throw error;
    }
};

const addUser = async (data) => {
    try {
        const hashedPassword = await bcrypt.hash(data.contrasena || '123456', 10);
        return await userRepository.create({
            ...data,
            contrasena: hashedPassword
        });
    } catch (error) {
        console.error('Error al agregar usuario en servicio:', error);
        throw error;
    }
};

const updateUser = async (id_usuario, data) => {
    try {
        return await userRepository.update(id_usuario, data);
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        throw error;
    }
};

const deleteUser = async (id_usuario) => {
    try {
        return await userRepository.delete(id_usuario);
    } catch (error) {
        console.error('Error al eliminar usuario en servicio:', error);
        throw error;
    }
};

module.exports = { getUsers, getUsersPaginated, getUserById, searchUser, getProfileData, getRoles, addUser, updateUser, deleteUser };