require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const path = require('path'); // Import the path module

const app = express();
const PORT = process.env.PORT || 5001; // Use environment variable or default port

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Serve static files from the frontend/public directory
app.use(express.static(path.join(__dirname, '..', 'frontend', 'public')));

// Basic route for testing - serves the index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'public', 'index.html'));
});

// --- API Routes ---
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes); // Mount authentication routes

const userRoutes = require('./routes/user.routes');
app.use('/api/users', userRoutes); // Mount user management routes

// TODO: Add Role Management Routes (e.g., /api/roles)
// TODO: Add Permission Management Routes (e.g., /api/permissions)
// TODO: Add System Settings Routes (e.g., /api/settings)
// TODO: Add Authorization Middleware

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app; // Export for potential testing
