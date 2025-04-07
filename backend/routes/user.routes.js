const express = require('express');
const router = express.Router();
const controller = require("../controllers/user.controller");
const { verifyToken, hasRole, hasPermission } = require("../middleware/authJwt"); // Import middleware

// --- User Routes ---
// Apply verifyToken middleware to all routes in this file
router.use(verifyToken);

// GET /api/users - Find all users (Requires 'user_view_list' permission)
router.get(
    "/",
    [hasPermission('user_view_list')],
    controller.findAll
);

// GET /api/users/:id - Find a single user
// Authorization (Admin or self) should be checked within the controller for this specific case
router.get(
    "/:id",
    controller.findOne
);

// PUT /api/users/:id - Update a user
// Authorization (Admin or self) should be checked within the controller
router.put(
    "/:id",
    controller.update
);

// DELETE /api/users/:id - Delete a user (Requires 'Admin' role)
router.delete(
    "/:id",
    [hasRole('Admin')], // Only Admin can delete users directly via this route
    controller.delete
);

// --- Admin Specific User Actions ---
// These routes require Admin role

// POST /api/users/:id/roles - Assign a role to a user
router.post(
    "/:id/roles",
    [hasRole('Admin')], // Requires Admin role
    controller.assignRole // Expects { roleId: X } in request body
);

// DELETE /api/users/:id/roles/:roleId - Remove a role from a user
router.delete(
    "/:id/roles/:roleId", // Pass roleId in the URL parameter
    [hasRole('Admin')], // Requires Admin role
    controller.removeRole
);


// GET /api/users/list - Get all users for management
router.get(
    "/list",
    [hasRole('Admin')],
    controller.getAllUsers
);

module.exports = router;
