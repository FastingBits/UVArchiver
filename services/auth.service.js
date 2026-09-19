const { authRepository } = require('../repositories');

async function getUserById(id_usuario) {
  return await authRepository.getUserById(id_usuario);
}

async function getUserByCorreo(correo) {
  return await authRepository.getUserByCorreo(correo);
}

async function createUser(data) {
  const userData = {
    nombre: data.nombres || data.nombre,
    apellido_paterno: data.apellidoPaterno || data.apellido_paterno,
    apellido_materno: data.apellidoMaterno || data.apellido_materno,
    correo: data.correo || data.email,
    contrasena: data.contrasena || data.password,
    id_rol: data.id_rol || 4,
    id_departamento: data.id_departamento || 1,
    pertenece_a_institucion: data.pertenece_a_institucion !== undefined ? parseInt(data.pertenece_a_institucion, 10) : 1
  };

  return await authRepository.createUser(userData);
}

async function updatePassword(email, passwordHash) {
  return await authRepository.updatePassword(email, passwordHash);
}

async function saveRecoveryCodes(id_usuario, codigo, expira_en = null) {
  return await authRepository.saveRecoveryCodes(id_usuario, codigo, expira_en);
}

async function verifyCode(id_usuario, codigo) {
  return await authRepository.verifyCode(id_usuario, codigo);
}

async function markCodeUsed(id) {
  return await authRepository.markCodeUsed(id);
}

module.exports = {
  getUserById,
  getUserByCorreo,
  createUser,
  updatePassword,
  saveRecoveryCodes,
  verifyCode,
  markCodeUsed,
  // Alias for compatibility with external snippets
  GetUserByEmailAuth: getUserByCorreo,
  UpdatePassword: updatePassword,
  SaveRecoveryCodes: saveRecoveryCodes,
  VerifyCode: verifyCode,
  MarkCodeUsed: markCodeUsed
};