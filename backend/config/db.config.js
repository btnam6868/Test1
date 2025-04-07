module.exports = {
  HOST: process.env.DB_HOST || "localhost",
  USER: process.env.DB_USER || "root",
  PASSWORD: process.env.DB_PASSWORD || "abc@123",
  DB: process.env.DB_NAME || "mydatabase1",
  dialect: "mysql",
  pool: { // Optional: connection pooling configuration
    max: 5,   // maximum number of connection in pool
    min: 0,   // minimum number of connection in pool
    acquire: 30000, // maximum time, in milliseconds, that pool will try to get connection before throwing error
    idle: 10000 // maximum time, in milliseconds, that a connection can be idle before being released
  }
};
