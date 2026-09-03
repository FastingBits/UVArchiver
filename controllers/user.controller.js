const UserService = require("../services/user.service.js");

const getUsers = async (req, res) => {
    try {
        const loggedUser = req.session.user;
        const allUsers = await UserService.getUsers();

        if (loggedUser && loggedUser.rol === 2) {
            const filteredUsers = allUsers.filter(u => u.id_departamento === loggedUser.id_departamento);
            return res.json({ success: true, users: filteredUsers });
        }

        res.json({ success: true, users: allUsers });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ success: false, message: 'Error al obtener usuarios' });
    }
};

const searchUser = async (req, res) => {
    const { query } = req.body;
    try {
        const loggedUser = req.session.user;
        let users = await UserService.searchUser({ query });

        if (loggedUser && loggedUser.rol === 2) {
            users = users.filter(u => u.id_departamento === loggedUser.id_departamento);
        }

        res.json({ success: true, users });
    } catch (error) {
        console.error('Error al buscar usuarios:', error);
        res.status(500).json({ success: false, message: 'Error al buscar usuarios' });
    }
};

const addUser = async (req, res) => {
    const loggedUser = req.session.user;
    let { nombre, apellido_paterno, apellido_materno, correo, contrasena, id_rol, id_departamento, pertenece_a_institucion } = req.body;
    if (!nombre || !apellido_paterno || !apellido_materno || !correo) {
        return res.status(400).json({ success: false, message: 'Los campos nombre, apellido paterno, materno y correo son obligatorios' });
    }

    let finalDeptId = id_departamento ? parseInt(id_departamento) : 1;
    let finalRolId = id_rol ? parseInt(id_rol) : 4;

    if (loggedUser && loggedUser.rol === 2) {
        finalDeptId = loggedUser.id_departamento;
        if (finalRolId === 1) {
            return res.status(403).json({ success: false, message: 'No tienes privilegios para asignar el rol de Administrador de Sistema.' });
        }
    }

    if ((!loggedUser || loggedUser.rol !== 1) && finalRolId === 1) {
        return res.status(403).json({ success: false, message: 'Sólo un Administrador de Sistema puede asignar el rol de Administrador de Sistema.' });
    }

    const isInstitutional = correo.toLowerCase().endsWith("@uv.mx");
    if (!isInstitutional) {
        if (finalRolId !== 4) {
            return res.status(400).json({
                success: false,
                message: 'Un usuario externo (no institucional) únicamente puede tener asignado el rol de Auditor.'
            });
        }
    }

    if ((finalRolId === 2 || finalRolId === 3) && finalDeptId === 1) {
        return res.status(400).json({
            success: false,
            message: 'Para asignar el rol de Administrador o Usuario, el usuario debe pertenecer a un departamento asignado.'
        });
    }

    try {
        const userId = await UserService.addUser({
            nombre,
            apellido_paterno,
            apellido_materno,
            correo,
            contrasena,
            id_rol: finalRolId,
            id_departamento: finalDeptId,
            pertenece_a_institucion: pertenece_a_institucion !== undefined ? pertenece_a_institucion : (isInstitutional ? 1 : 0)
        });
        res.json({ success: true, userId, message: 'Usuario agregado correctamente' });
    } catch (error) {
        console.error('Error al agregar usuario:', error);
        if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
            return res.status(409).json({ success: false, message: 'El correo electrónico ya está registrado en el sistema.' });
        }
        res.status(500).json({ success: false, message: 'Error al agregar usuario' });
    }
};

const updateUser = async (req, res) => {
    const loggedUser = req.session.user;
    const { id } = req.params;
    let { nombre, apellido_paterno, apellido_materno, correo, id_rol, id_departamento, pertenece_a_institucion } = req.body;
    if (!nombre || !apellido_paterno || !apellido_materno || !correo || !id_rol || !id_departamento) {
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    let finalDeptId = parseInt(id_departamento);
    let finalRolId = parseInt(id_rol);

    if (loggedUser && loggedUser.rol === 2) {
        try {
            const targetUser = await UserService.getUserById(id);
            if (!targetUser) {
                return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
            }
            if (targetUser.id_departamento !== loggedUser.id_departamento) {
                return res.status(403).json({ success: false, message: 'Sólo puedes gestionar y actualizar usuarios pertenecientes a tu propio departamento.' });
            }
            const newDeptVal = parseInt(id_departamento);
            if (newDeptVal !== loggedUser.id_departamento && newDeptVal !== 1) {
                return res.status(403).json({ success: false, message: 'Un administrador de departamento sólo puede mantener al usuario en su departamento o removerlo (Sin departamento).' });
            }
            finalDeptId = newDeptVal;

            if (finalRolId === 1) {
                return res.status(403).json({ success: false, message: 'No puedes promover a un usuario al rol de Administrador de Sistema.' });
            }
        } catch (err) {
            console.error('Error al verificar usuario objetivo:', err);
            return res.status(500).json({ success: false, message: 'Error interno al validar permisos.' });
        }
    }

    if ((!loggedUser || loggedUser.rol !== 1) && finalRolId === 1) {
        return res.status(403).json({ success: false, message: 'Sólo un Administrador de Sistema puede promover usuarios a Administrador de Sistema.' });
    }
    const isInstitutional = correo.toLowerCase().endsWith("@uv.mx");
    if (!isInstitutional) {
        if (finalRolId !== 4) {
            return res.status(400).json({
                success: false,
                message: 'Un usuario externo (no institucional) únicamente puede tener asignado el rol de Auditor.'
            });
        }

        if (pertenece_a_institucion) {
            return res.status(400).json({
                success: false,
                message: 'Un usuario con correo no institucional no puede pertenecer a una institución.'
            })
        }
    }

    if ((finalRolId === 2 || finalRolId === 3) && finalDeptId === 1) {
        return res.status(400).json({
            success: false,
            message: 'Para asignar el rol de Administrador o Usuario, el usuario debe pertenecer a un departamento asignado.'
        });
    }

    try {
        const affectedRows = await UserService.updateUser(id, {
            nombre,
            apellido_paterno,
            apellido_materno,
            correo,
            id_rol: finalRolId,
            id_departamento: finalDeptId,
            pertenece_a_institucion: pertenece_a_institucion !== undefined ? pertenece_a_institucion : (isInstitutional ? 1 : 0)
        });
        if (affectedRows > 0) {
            if (req.session.user && parseInt(id) === req.session.user.id_usuario) {
                req.session.user.nombre = nombre;
                req.session.user.apellido_paterno = apellido_paterno;
                req.session.user.apellido_materno = apellido_materno;
                req.session.user.correo = correo;
                req.session.user.id_rol = finalRolId;
                req.session.user.id_departamento = finalDeptId;

                req.session.save();
            }
            res.json({ success: true, message: 'Usuario actualizado correctamente' });
        } else {
            res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error al actualizar usuario:', error);
        if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
            return res.status(409).json({ success: false, message: 'El correo electrónico ya está registrado por otro usuario.' });
        }
        res.status(500).json({ success: false, message: 'Error al actualizar usuario' });
    }
};

const deleteUser = async (req, res) => {
    const loggedUser = req.session.user;
    const { id } = req.params;

    // Regla de seguridad: Sólo system_admin (Rol 1) puede eliminar usuarios
    if (!loggedUser || loggedUser.rol !== 1) {
        return res.status(403).json({ success: false, message: 'Sólo un Administrador de Sistema tiene autorización para eliminar usuarios.' });
    }

    try {
        const affectedRows = await UserService.deleteUser(id);
        if (affectedRows > 0) {
            res.json({ success: true, message: 'Usuario eliminado correctamente' });
        } else {
            res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar usuario' });
    }
};

module.exports = { getUsers, addUser, searchUser, updateUser, deleteUser };
