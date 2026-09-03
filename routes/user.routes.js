const express = require("express");
const { getUsers, addUser, updateUser, deleteUser } = require("../controllers/user.controller.js");
const { isAuthenticated } = require("../middlewares/auth.middlewares.js");
const { checkPermission } = require("../middlewares/permissionMiddleware.js");

const router = express.Router();

router.get("/", isAuthenticated, checkPermission("read_user"), getUsers);
//router.post("/buscar", isAuthenticated, checkPermission("read_user"), searchUser);
router.post("/", isAuthenticated, checkPermission("add_user"), addUser);
router.put("/:id", isAuthenticated, checkPermission("edit_user"), updateUser);
router.delete("/:id", isAuthenticated, checkPermission("delete_user"), deleteUser);

module.exports = router;
