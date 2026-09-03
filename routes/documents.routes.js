const express = require("express");
const { addDocumento, viewDocument, downloadDocument, updateDocumento, deleteDocumento } = require("../controllers/documentos.controller.js");
const { upload } = require("../middlewares/multer.middleware.js");
const { isAuthenticated } = require("../middlewares/auth.middlewares.js");
const { checkPermission } = require("../middlewares/permissionMiddleware.js");

const router = express.Router();

// Rutas de API para documentos
router.post("/", isAuthenticated, checkPermission("add_document"), upload.single("documento"), addDocumento);
router.put("/:id", isAuthenticated, checkPermission("edit_document"), updateDocumento);
router.get("/ver/:id", isAuthenticated, checkPermission("read_document"), viewDocument);
router.get("/descargar/:id", isAuthenticated, checkPermission("download_document"), downloadDocument);
router.delete("/:id", isAuthenticated, checkPermission("delete_document"), deleteDocumento);

module.exports = router;