const mysql = require('mysql2');
const dbConfig = require('../config/db.config.js');

// Create a connection pool to the database
const pool = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  waitForConnections: true,
  connectionLimit: dbConfig.pool ? dbConfig.pool.max : 10, // Use pool config or default
  queueLimit: 0 // Unlimited queueing
});

// Promisify the pool query method for async/await usage
const promisePool = pool.promise();

// Test the connection (optional but good practice)
promisePool.getConnection()
  .then(connection => {
    console.log("Successfully connected to the database.");
    connection.release(); // Release the connection back to the pool
  })
  .catch(err => {
    console.error("Database Connection Error: ", err);
    // Optional: exit process if DB connection fails on startup
    // process.exit(1);
  });

module.exports = promisePool; // Export the promise-based pool for use in models/controllers
