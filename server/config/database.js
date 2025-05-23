const { Pool, Client } = require('pg');
const logger = require('../utils/logger');
require('dotenv').config();

let poolInstance = null;

async function initializeDatabase() {
  const dbName = process.env.DB_NAME;
  const adminConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres', // Connect to default 'postgres' database
  };

  const client = new Client(adminConfig);

  try {
    // Connect to the default 'postgres' database
    await client.connect();
    logger.info('Connected to PostgreSQL admin database');

    // Check if the target database exists
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (res.rowCount === 0) {
      // Create the database if it doesn't exist
      await client.query(`CREATE DATABASE "${dbName}"`);
      logger.info(`Database ${dbName} created successfully`);
    } else {
      logger.info(`Database ${dbName} already exists`);
    }
  } catch (error) {
    logger.error('Error initializing database:', error);
    throw error;
  } finally {
    await client.end();
  }

  // Initialize the connection pool
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: dbName,
  });

  // Test the pool connection
  try {
    await pool.query('SELECT NOW()');
    logger.info(`Connected to database ${dbName}`);
  } catch (error) {
    logger.error(`Error connecting to database ${dbName}:`, error);
    throw error;
  }

  return pool;
}

async function getPool() {
  if (!poolInstance) {
    poolInstance = await initializeDatabase();
  }
  return poolInstance;
}

module.exports = getPool();