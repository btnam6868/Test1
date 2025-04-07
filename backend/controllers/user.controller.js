const User = require("../models/user.model.js");
const bcrypt = require("bcryptjs"); // Needed for password updates

const db = require("../models/db.js"); // Import the promise-based pool

// Get all users with roles for management
exports.getAllUsers = async (req, res) => {
    try {
        const sql = `
            SELECT 
                u.id, 
                u.username, 
                u.email, 
                u.first_name, 
                u.last_name,
                r.name as role
            FROM users u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN roles r ON ur.role_id = r.id
            ORDER BY u.id ASC
        `;
        const [users] = await db.query(sql);
        res.status(200).send(users);
    } catch (err) {
        console.error("Error getting all users:", err);
        res.status(500).send({ message: "Error retrieving users" });
    }
};

// Find all users (potentially with filtering/pagination later)
exports.findAll = async (req, res) => {
    try {
        // Add role/permission checks if needed (e.g., only Admins can see all users)
        const sql = `
            SELECT id, username, email, first_name, last_name
            FROM users
        `;
        const [users] = await db.query(sql);
        res.status(200).send(users);
    } catch (err) {
        console.error("Error finding all users:", err);
        res.status(500).send({ message: err.message || "Some error occurred while retrieving users." });
    }
};

// Find a single user by ID
exports.findOne = async (req, res) => {
    const userId = req.params.id;
    // TODO: Implement logic to find a user by ID
    // TODO: Add checks: Can the requesting user view this profile? (e.g., Admin or self)
    res.status(501).send({ message: `Find user ${userId} not implemented yet.` });
};

// Update a user by ID
exports.update = async (req, res) => {
    const userId = req.params.id;
    // TODO: Implement logic to update user details (handle password changes separately)
    // TODO: Add checks: Can the requesting user update this profile? (e.g., Admin or self)
    // TODO: Validate input data
    // TODO: Be careful not to update password hash unless explicitly requested with current password validation
    res.status(501).send({ message: `Update user ${userId} not implemented yet.` });
};

// Delete a user by ID
exports.delete = async (req, res) => {
    const userId = req.params.id;
    // TODO: Implement logic to delete a user
    // TODO: Add checks: Can the requesting user delete this profile? (e.g., Admin only)
    // TODO: Consider soft delete vs hard delete
    res.status(501).send({ message: `Delete user ${userId} not implemented yet.` });
};

// --- Specific Admin Actions ---

// Admin: Assign role to user
exports.assignRole = async (req, res) => {
    const userId = req.params.id;
    const { roleId } = req.body;
    // TODO: Implement logic to assign a role (add entry to user_roles)
    // TODO: Validate roleId exists
    res.status(501).send({ message: `Assign role ${roleId} to user ${userId} not implemented yet.` });
};

// Admin: Remove role from user
exports.removeRole = async (req, res) => {
    const userId = req.params.id;
    const { roleId } = req.body; // Or pass roleId in URL params?
    // TODO: Implement logic to remove a role (delete entry from user_roles)
    res.status(501).send({ message: `Remove role ${roleId} from user ${userId} not implemented yet.` });
};
