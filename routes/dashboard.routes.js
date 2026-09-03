const express = require("express");
const { getDashboardStats } = require("../controllers/dashboard.controller.js");
const { isAuthenticated } = require("../middlewares/auth.middlewares.js");

const router = express.Router();

router.get("/stats", isAuthenticated, getDashboardStats);

module.exports = router;
