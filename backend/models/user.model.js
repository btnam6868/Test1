const db = require("./db.js"); // Import the promise-based pool
const bcrypt = require('bcryptjs');

const User = {}; // Using an object to hold static-like methods

// Create a new User
User.create = async (newUser) => {
  try {
    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newUser.password, salt);

    const sql = "INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?, ?)";
    const [result] = await db.query(sql, [
      newUser.username,
      newUser.email,
      hashedPassword, // Store the hashed password
      newUser.firstName || null,
      newUser.lastName || null
    ]);

    // Assign default 'User' role upon creation (adjust if needed)
    const defaultRoleSql = "SELECT id FROM roles WHERE name = 'User'";
    const [roles] = await db.query(defaultRoleSql);
    if (roles.length > 0) {
      const userRoleSql = "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)";
      await db.query(userRoleSql, [result.insertId, roles[0].id]);
    } else {
      console.warn("Default 'User' role not found. New user created without a role.");
    }


    return { id: result.insertId, ...newUser };
  } catch (err) {
    console.error("Error creating user:", err);
    throw err; // Re-throw the error to be handled by the controller
  }
};

// Find User by Email
User.findByEmail = async (email) => {
  try {
    const sql = `
      SELECT u.*, GROUP_CONCAT(r.name) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      WHERE u.email = ?
      GROUP BY u.id
    `;
    const [users] = await db.query(sql, [email]);
    if (users.length) {
      // Convert comma-separated roles string to an array
      users[0].roles = users[0].roles ? users[0].roles.split(',') : [];
      return users[0];
    }
    return null; // Return null if user not found
  } catch (err) {
    console.error("Error finding user by email:", err);
    throw err;
  }
};

// Find User by Username
User.findByUsername = async (username) => {
    try {
      const sql = `
        SELECT u.*, GROUP_CONCAT(r.name) as roles
        FROM users u
        LEFT JOIN user_roles ur ON u.id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
        WHERE u.username = ?
        GROUP BY u.id
      `;
      const [users] = await db.query(sql, [username]);
      if (users.length) {
        users[0].roles = users[0].roles ? users[0].roles.split(',') : [];
        return users[0];
      }
      return null;
    } catch (err) {
      console.error("Error finding user by username:", err);
      throw err;
    }
  };


// Find User by ID (useful for JWT verification)
User.findById = async (id) => {
  try {
    const sql = `
      SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.is_active, u.last_login, u.createdAt, u.updatedAt,
             GROUP_CONCAT(r.name) as roles,
             GROUP_CONCAT(p.name) as permissions
      FROM users u
      LEFT JOIN user_roles ur ON u.id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.id
      LEFT JOIN role_permissions rp ON r.id = rp.role_id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE u.id = ?
      GROUP BY u.id
    `;
    const [users] = await db.query(sql, [id]);
    if (users.length) {
      users[0].roles = users[0].roles ? [...new Set(users[0].roles.split(','))] : []; // Unique roles
      users[0].permissions = users[0].permissions ? [...new Set(users[0].permissions.split(','))] : []; // Unique permissions
      return users[0];
    }
    return null;
  } catch (err) {
    console.error("Error finding user by ID:", err);
    throw err;
  }
};

// TODO: Add methods for updating user, deleting user, finding all users, etc.

// Update last login timestamp
User.updateLastLogin = async (id) => {
    try {
        const sql = "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?";
        // Import db connection directly here as it wasn't passed
        const db = require("./db.js");
        await db.query(sql, [id]);
        // No return value needed, fire and forget
    } catch (err) {
        // Log error but don't necessarily throw it to block login
        console.error(`Error updating last_login for user ${id}:`, err);
    }
};

module.exports = User;
