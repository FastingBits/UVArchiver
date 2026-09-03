const { getDocsByDepartamento, getDocsByDepartamentoId } = require("../services/documentos.service.js");
const { getUsers, getUsersPaginated, getProfileData } = require("../services/user.service.js");
const PermissionService = require("../services/permissions.service.js");
const DepartmentService = require("../services/departamentos.service.js");

const renderRegister = (req, res) => {
    res.render('auth/register', { title: 'Registro' });
};

const renderLogin = (req, res) => {
    res.render('auth/login', { title: 'Iniciar Sesión' });
};

const renderForgotPassword = (req, res) => {
    res.render('auth/forgot-password', { title: 'Recuperar Contraseña' });
};

const renderResetPassword = (req, res) => {
    const token = req.query.token || '';
    res.render('auth/reset-password', { title: 'Restablecer Contraseña', token });
};

const renderUpdatePassword = (req, res) => {
    res.render('auth/update-password', { title: 'Actualizar Contraseña', user: req.session.user });
};

const renderAdminDash = (req, res) => {
    const user = req.session.user;
    if (user.rol === 1 || user.rol === 2) {
        res.render("adminDashboard", { user });
    } else {
        res.render("userDashboard", { user });
    }
};

const renderUserDash = (req, res) => {
    res.render("userDashboard", { user: req.session.user });
};

const renderUsuarios = async (req, res) => {
    try {
        const user = req.session.user;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const date = req.query.date || '';
        const id_departamento = user.rol === 1 ? null : user.id_departamento;

        const { users, total, totalPages, currentPage } = await getUsersPaginated({
            page,
            limit,
            search,
            date,
            id_departamento
        });

        const departamentos = await DepartmentService.getDepartments();
        const roles = await PermissionService.getRoles();
        res.render('users/users', {
            usuarios: users,
            departamentos: departamentos,
            roles: roles,
            user: req.session.user,
            pagination: {
                total,
                totalPages,
                currentPage,
                limit,
                search,
                date
            }
        });
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).send('Error al cargar usuarios');
    }
};

const renderDocumentos = async (req, res) => {
    try {
        const userId = req.session.user.id_usuario;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const date = req.query.date || '';

        const { docs, total, totalPages, currentPage, id_departamento } = await getDocsByDepartamento(userId, {
            page,
            limit,
            search,
            date,
            userRol: req.session.user.rol
        });
        const dept = await DepartmentService.getDepartmentById(id_departamento);
        const nombreDept = dept ? dept.nombre : 'Mi Departamento';

        res.render('documents/documents', {
            documentos: docs,
            viewScope: 'own',
            nombreDepartamento: nombreDept,
            user: req.session.user,
            idDepartamento: id_departamento,
            pagination: {
                total,
                totalPages,
                currentPage,
                limit,
                search,
                date
            }
        });
    } catch (error) {
        console.error('Error al obtener documentos:', error);
        res.status(500).send('Error al cargar documentos');
    }
};

const renderDocumentosEspecificos = async (req, res) => {
    try {
        const { id_departamento } = req.params;
        if (id_departamento === "1") {
            return res.render('404', { user: req.session.user });
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const date = req.query.date || '';

        const { docs, total, totalPages, currentPage } = await getDocsByDepartamentoId(id_departamento, {
            page,
            limit,
            search,
            date,
            userRol: req.session.user.rol
        });

        const dept = await DepartmentService.getDepartmentById(id_departamento);
        const nombreDept = dept ? dept.nombre : 'Departamento';

        res.render('documents/documents', {
            documentos: docs,
            viewScope: 'global',
            nombreDepartamento: nombreDept,
            user: req.session.user,
            idDepartamento: id_departamento,
            pagination: {
                total,
                totalPages,
                currentPage,
                limit,
                search,
                date
            }
        });
    } catch (error) {
        console.error('Error al obtener documentos específicos:', error);
        res.status(500).send('Error al cargar documentos del departamento');
    }
};

const renderDepartamentos = async (req, res) => {
    try {
        const departamentos = await DepartmentService.getDepartments();
        res.render('departaments/departaments', { departamentos: departamentos });
    } catch (error) {
        console.error('Error al obtener departamentos:', error);
        res.status(500).send('Error al cargar departamentos');
    }
};

const renderProfile = async (req, res) => {
    try {
        const user = req.session.user;
        const profileData = await getProfileData(user.id_usuario);
        res.render('users/profile', { user: user, profileData: profileData });
    } catch (error) {
        console.error('Error al obtener perfil:', error);
        res.status(500).send('Error al cargar perfil');
    }
};

module.exports = {
    renderRegister,
    renderLogin,
    renderForgotPassword,
    renderResetPassword,
    renderUpdatePassword,
    renderUsuarios,
    renderDepartamentos,
    renderDocumentos,
    renderDocumentosEspecificos,
    renderAdminDash,
    renderUserDash,
    renderProfile
};