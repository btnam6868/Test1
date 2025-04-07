const User = require("../models/user.model.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Retrieve JWT secret and expiration from environment variables
const jwtSecret = process.env.JWT_SECRET;
const jwtExpiration = process.env.JWT_EXPIRATION || '1h'; // Default to 1 hour if not set

if (!jwtSecret) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
  process.exit(1); // Exit if JWT secret is missing
}

exports.register = async (req, res) => {
  // Validate request body
  if (!req.body.username || !req.body.email || !req.body.password) {
    return res.status(400).send({ message: "Username, email, and password are required!" });
  }

  // Basic email format validation (consider using a library like validator.js for more robust validation)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(req.body.email)) {
      return res.status(400).send({ message: "Invalid email format." });
  }

  // Basic password length validation
  if (req.body.password.length < 6) {
      return res.status(400).send({ message: "Password must be at least 6 characters long." });
  }


  try {
    // Check if username or email already exists
    const existingUserByUsername = await User.findByUsername(req.body.username);
    if (existingUserByUsername) {
      return res.status(400).send({ message: "Failed! Username is already in use!" });
    }

    const existingUserByEmail = await User.findByEmail(req.body.email);
    if (existingUserByEmail) {
      return res.status(400).send({ message: "Failed! Email is already in use!" });
    }

    // Create a new user object
    const user = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password, // Password will be hashed by the model
      firstName: req.body.firstName,
      lastName: req.body.lastName
    };

    // Save User in the database
    const createdUser = await User.create(user);
    res.status(201).send({ message: "User registered successfully!", userId: createdUser.id });

  } catch (err) {
    res.status(500).send({ message: err.message || "Some error occurred while registering the user." });
  }
};

exports.login = async (req, res) => {
  // Validate request body
  if (!req.body.login || !req.body.password) { // 'login' can be username or email
    return res.status(400).send({ message: "Username/email and password are required!" });
  }

  try {
    // Find user by username or email
    let user = await User.findByUsername(req.body.login);
    if (!user) {
      user = await User.findByEmail(req.body.login);
    }

    if (!user) {
      return res.status(404).send({ message: "User Not found." });
    }

    // Compare password with the stored hash
    const passwordIsValid = await bcrypt.compare(
      req.body.password,
      user.password_hash // Compare with the hashed password from DB
    );

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Invalid Password!"
      });
    }

    // Check if user is active
    if (!user.is_active) {
        return res.status(403).send({ message: "User account is inactive." });
    }

    // Fetch full user details including permissions for the token
    const userDetails = await User.findById(user.id);
    if (!userDetails) {
        // Should not happen if login was successful, but good to check
        return res.status(500).send({ message: "Error retrieving user details after login." });
    }


    // Generate JWT
    const token = jwt.sign(
        {
            id: userDetails.id,
            username: userDetails.username,
            roles: userDetails.roles, // Include roles in the token
            permissions: userDetails.permissions // Include permissions in the token
        },
        jwtSecret,
        {
            expiresIn: jwtExpiration // e.g., '1h', '24h', '7d'
        }
    );

    // Optionally update last_login timestamp (fire and forget)
    User.updateLastLogin(user.id).catch(err => console.error("Failed to update last login:", err));


    // Send response
    res.status(200).send({
      id: userDetails.id,
      username: userDetails.username,
      email: userDetails.email,
      firstName: userDetails.first_name,
      lastName: userDetails.last_name,
      roles: userDetails.roles,
      permissions: userDetails.permissions,
      accessToken: token
    });

  } catch (err) {
    res.status(500).send({ message: err.message || "Some error occurred during login." });
  }
};
