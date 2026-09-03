const express = require("express");
const { registerUser, loginUser, logoutUser, updatePassword, forgotPassword, resetPassword } = require("../controllers/auth.controller.js");
const { isAuthenticated } = require("../middlewares/auth.middlewares.js");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

router.put("/update-password", isAuthenticated, updatePassword);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/logout", logoutUser);

module.exports = router;
