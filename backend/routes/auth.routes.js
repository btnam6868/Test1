const express = require('express');
const router = express.Router();
const controller = require("../controllers/auth.controller");
// Add any necessary middleware here later (e.g., validation)

// POST /api/auth/register
router.post("/register", controller.register);

// POST /api/auth/login
router.post("/login", controller.login);

// TODO: Add routes for password reset, email verification, etc. if needed

module.exports = router;
