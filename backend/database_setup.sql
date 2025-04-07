-- Create database if it doesn't exist (optional, depends on your MySQL setup)
-- CREATE DATABASE IF NOT EXISTS admin_dashboard_db;
-- USE admin_dashboard_db;

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Permissions Table
CREATE TABLE IF NOT EXISTS permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'user_create', 'user_read', 'user_update', 'user_delete', 'settings_update'
    description VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User_Roles Table (Many-to-Many relationship between Users and Roles)
CREATE TABLE IF NOT EXISTS user_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role_Permissions Table (Many-to-Many relationship between Roles and Permissions)
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Action Logs Table (Optional but recommended)
CREATE TABLE IF NOT EXISTS action_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id INT, -- Can be NULL if action is system-related or by unauthenticated user
    action VARCHAR(255) NOT NULL, -- e.g., 'login', 'user_created', 'settings_updated'
    target_type VARCHAR(100), -- e.g., 'user', 'role', 'system'
    target_id INT,
    details TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert Default Roles (Example)
INSERT INTO roles (name, description) VALUES
('Admin', 'Full system access'),
('Manager', 'Manages specific modules or users'),
('User', 'Standard user access'),
('Guest', 'Read-only or public access')
ON DUPLICATE KEY UPDATE name=name; -- Avoid error if roles already exist

-- Insert Example Permissions (Customize as needed)
INSERT INTO permissions (name, description) VALUES
('user_manage_all', 'Can create, read, update, delete any user'),
('user_manage_own', 'Can update own profile'),
('user_view_list', 'Can view list of users'),
('role_manage', 'Can manage roles and permissions'),
('settings_manage', 'Can update system settings'),
('dashboard_view', 'Can view the main dashboard')
ON DUPLICATE KEY UPDATE name=name; -- Avoid error if permissions already exist

-- Assign Permissions to Roles (Example - Customize extensively!)
-- Admin gets all permissions (adjust based on actual permissions created)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'Admin'
ON DUPLICATE KEY UPDATE role_id=role_id; -- Avoid error if assignments already exist

-- Manager permissions (Example)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.name IN ('user_view_list', 'dashboard_view')
WHERE r.name = 'Manager'
ON DUPLICATE KEY UPDATE role_id=role_id;

-- User permissions (Example)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.name IN ('user_manage_own', 'dashboard_view')
WHERE r.name = 'User'
ON DUPLICATE KEY UPDATE role_id=role_id;

-- Guest permissions (Example)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.name = 'dashboard_view'
WHERE r.name = 'Guest'
ON DUPLICATE KEY UPDATE role_id=role_id;
