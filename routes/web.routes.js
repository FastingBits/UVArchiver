const express = require("express");
const {
  renderRegister,
  renderLogin,
  renderUsuarios,
  renderDocumentos,
  renderDocumentosEspecificos,
  renderDepartamentos,
  renderAdminDash,
  renderUserDash,
  renderProfile,
  renderForgotPassword,
  renderResetPassword,
  renderUpdatePassword
} = require("../controllers/view.controller.js");
const { isAuthenticated } = require("../middlewares/auth.middlewares.js");
const { checkPermission } = require("../middlewares/permissionMiddleware.js");

const router = express.Router();

//router.get("/register", renderRegister);

router.get("/login", renderLogin);
router.get("/forgot-password", renderForgotPassword);
router.get("/reset-password", renderResetPassword);
router.get("/update-password", isAuthenticated, renderUpdatePassword);

router.get("/usuarios", checkPermission("read_user"), renderUsuarios);

router.get("/documentos", checkPermission("read_document"), renderDocumentos);

router.get("/documentos/departamento/:id_departamento", checkPermission("read_department"), renderDocumentosEspecificos);

router.get("/departamentos", checkPermission("read_department"), renderDepartamentos);

router.get("/profile", isAuthenticated, renderProfile);

//DashBoard user
router.get("/", isAuthenticated, renderAdminDash);

module.exports = router;
