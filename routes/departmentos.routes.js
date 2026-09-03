const express = require("express");
const { getDepartments, addDepartment, updateDepartment, deleteDepartment } = require("../controllers/departmentos.controller.js");
const { isAuthenticated } = require("../middlewares/auth.middlewares.js");
const { checkPermission } = require("../middlewares/permissionMiddleware.js");

const router = express.Router();

router.get("/", isAuthenticated, checkPermission("read_department"), getDepartments);
router.post("/", isAuthenticated, checkPermission("add_department"), addDepartment);
router.put("/:id", isAuthenticated, checkPermission("edit_department"), updateDepartment);
router.delete("/:id", isAuthenticated, checkPermission("delete_department"), deleteDepartment);

module.exports = router;