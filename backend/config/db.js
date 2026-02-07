const mysql = require('mysql2/promise');
require('dotenv').config();



const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'taskmanagement_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,                    // Max concurrent connections
  queueLimit: 0,                           // Unlimited queued requests
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
  multipleStatements: false                // Security: Prevent multiple SQL statements
});


pool.getConnection()
  .then(connection => {
    console.log('MySQL Database Connected Successfully');
    connection.release();
  })
  .catch(error => {
    console.error(' MySQL Connection Error:', error.message);
    console.error('  Check your .env file and MySQL server status');
    process.exit(1);  // Exit if unable to connect to database
  });

module.exports = pool;
