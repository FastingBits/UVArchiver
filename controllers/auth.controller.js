const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authService = require("../services/auth.service");

const JWT_SECRET = process.env.JWT_TEMP_SECRET || process.env.JWT_SECRET || "uv_archiver_jwt_temp_secret_key_2026";

const loginUser = async (req, res) => {
    const { correo, contraseña } = req.body;

    if (!correo || !contraseña) {
        return res.status(400).json({ success: false, message: 'Correo y contraseña son obligatorios' });
    }

    try {
        const user = await authService.getUserByCorreo(correo);

        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        const isMatch = await bcrypt.compare(contraseña, user.contrasena);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos' });
        }

        req.session.user = {
            id_usuario: user.id_usuario,
            nombre: user.nombre,
            apellido_paterno: user.apellido_paterno,
            apellido_materno: user.apellido_materno,
            correo: user.correo,
            rol: user.id_rol,
            id_departamento: user.id_departamento,
        };

        res.status(200).json({ success: true, message: 'Usuario logueado correctamente' });
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        res.status(500).json({ success: false, message: 'Error interno del servidor. Por favor, intenta más tarde.' });
    }
};

const logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error al cerrar sesión:", err);
            return res.status(500).json({ success: false, message: "Error al cerrar sesión" });
        }
        res.redirect("/login");
    });
};

const registerUser = async (req, res) => {
    const {
        nombres,
        apellidoPaterno,
        apellidoMaterno,
        correo,
        contraseña
    } = req.body;

    if (!nombres || !apellidoPaterno || !apellidoMaterno || !correo || !contraseña) {
        return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios' });
    }

    const isInstitutional = correo.toLowerCase().endsWith("@uv.mx");
    if (!isInstitutional) {
        return res.status(403).json({
            success: false,
            message: 'El auto-registro está reservado exclusivamente para correos institucionales (@uv.mx). Si eres un usuario externo, solicita tu cuenta con el administrador.'
        });
    }

    try {
        const hashedPassword = await bcrypt.hash(contraseña, 10);

        const data = {
            nombres,
            apellidoPaterno,
            apellidoMaterno,
            correo,
            contrasena: hashedPassword,
            id_rol: 4,
            id_departamento: 1,
            pertenece_a_institucion: 1
        };

        await authService.createUser(data);

        res.status(200).json({
            success: true,
            message: 'Registro exitoso. Su usuario ha sido creado con rol de Auditor institucional sin departamento asignado.'
        });
    } catch (error) {
        console.error('Error al registrar el usuario:', error);
        if (error.code === 'ER_DUP_ENTRY' || error.code === '23505') {
            return res.status(409).json({ success: false, message: 'El correo electrónico ya está registrado en el sistema.' });
        }
        res.status(500).json({ success: false, message: 'Error al registrar el usuario' });
    }
};

const updatePassword = async (req, res) => {
    try {
        const currentPassword = req.body.currentPassword || req.body.contrasenaActual || req.body.contraseñaActual;
        const newPassword = req.body.newPassword || req.body.nuevaContrasena || req.body.nuevaContraseña;
        const newPasswordConfirm = req.body.newPasswordConfirm || req.body.confirmarContrasena || req.body.confirmarContraseña;

        const email = req.session?.user?.correo || req.user?.email || req.user?.correo || req.body.email || req.body.correo;

        if (!currentPassword || !newPassword || !newPasswordConfirm) {
            return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });
        }

        if (!email) {
            return res.status(401).json({ success: false, message: "Sesión no válida o correo no proporcionado" });
        }

        const user = await authService.getUserByCorreo(email);
        if (!user) {
            return res.status(404).json({ success: false, message: "Credenciales inválidas o usuario no encontrado" });
        }

        const isValid = await bcrypt.compare(currentPassword, user.contrasena);
        if (!isValid) {
            return res.status(401).json({ success: false, message: "La contraseña actual es incorrecta" });
        }

        if (newPassword !== newPasswordConfirm) {
            return res.status(400).json({ success: false, message: "Las nuevas contraseñas no coinciden" });
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);
        const updated = await authService.updatePassword(user.correo, passwordHash);

        if (!updated) {
            return res.status(500).json({ success: false, message: "Error al actualizar la contraseña" });
        }

        return res.status(200).json({
            success: true,
            message: "Contraseña actualizada correctamente"
        });
    } catch (error) {
        console.error("Error en updatePassword:", error);
        return res.status(500).json({ success: false, message: error.message || "Error interno del servidor" });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const email = req.body.email || req.body.correo;
        if (!email) {
            return res.status(400).json({ success: false, message: "El correo electrónico es requerido." });
        }

        const user = await authService.getUserByCorreo(email);
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "Si el correo está registrado se ha enviado un mensaje para restablecer la contraseña."
            });
        }

        const tokenResetPassword = jwt.sign(
            { id: user.id_usuario, email: user.correo },
            JWT_SECRET,
            { expiresIn: "15m" }
        );

        const expiraEn = new Date(Date.now() + 15 * 60 * 1000);
        await authService.saveRecoveryCodes(user.id_usuario, tokenResetPassword, expiraEn);

        // En un entorno de producción, aquí se invoca el servicio de correo (Nodemailer, SMTP, etc.)
        // para enviar el enlace: `/reset-password?token=${tokenResetPassword}`
        console.log("Token de recuperación enviado:", `http://localhost:3000/reset-password?token=${tokenResetPassword}`);

        return res.status(200).json({
            success: true,
            message: "Si el correo está registrado se ha enviado un mensaje para restablecer la contraseña.",
            token: process.env.NODE_ENV !== "production" ? tokenResetPassword : undefined
        });
    } catch (error) {
        console.error("Error en forgotPassword:", error);
        return res.status(500).json({ success: false, message: error.message || "Error interno del servidor" });
    }
};

const resetPassword = async (req, res) => {
    try {
        const token = req.body.token;
        const password = req.body.password || req.body.nuevaContrasena || req.body.nuevaContraseña;
        const verifyPassword = req.body.verifyPassword || req.body.confirmarContrasena || req.body.confirmarContraseña;

        if (!token || !password || !verifyPassword) {
            return res.status(400).json({ success: false, message: "Todos los campos son obligatorios" });
        }

        if (password !== verifyPassword) {
            return res.status(400).json({ success: false, message: "Las contraseñas no coinciden" });
        }

        let dataVerify;
        try {
            dataVerify = jwt.verify(token, JWT_SECRET);
        } catch (jwtErr) {
            return res.status(400).json({ success: false, message: "El token de recuperación es inválido o ha expirado" });
        }

        const recoveryCode = await authService.verifyCode(dataVerify.id, token);
        if (!recoveryCode) {
            return res.status(400).json({ success: false, message: "El token de recuperación ya fue utilizado o es inválido" });
        }

        const user = await authService.getUserByCorreo(dataVerify.email);
        if (!user) {
            return res.status(404).json({ success: false, message: "Usuario no encontrado" });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const updated = await authService.updatePassword(user.correo, passwordHash);

        if (!updated) {
            return res.status(500).json({ success: false, message: "Error al actualizar la contraseña" });
        }

        await authService.markCodeUsed(recoveryCode.id);

        return res.status(200).json({
            success: true,
            message: "Contraseña actualizada correctamente"
        });
    } catch (error) {
        console.error("Error en resetPassword:", error);
        return res.status(500).json({ success: false, message: error.message || "Error interno del servidor" });
    }
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    updatePassword,
    forgotPassword,
    resetPassword
};