const getPool = require('../config/database');
const logger = require('../utils/logger');

class UserRepository {
  async findByEmail(email) {
    try {
      const pool = await getPool;
      const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      return result.rows[0];
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

async findById(id) {
  try {
    console.log("findById invoked at:", new Date().toISOString(), "with id:", id);
    const productId = parseInt(id, 10);
    if (isNaN(productId) || productId <= 0) {
      logger.warn(`Invalid product ID: ${id}`);
      return null; // Return null instead of throwing to allow caller to handle
    }
    const pool = await getPool;
    console.log("Executing query for productId:", productId);
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
    console.log("Query result:", result.rows[0]);
    return result.rows|| null;
  } catch (error) {
    logger.error('Error finding product by ID:', error);
    throw error;
  }
}





  async createUser(email, password) {
  try {
    let is_admin = false;

    // Set is_admin to true for specific credentials
    if (email === "admin@afb.abc" && password === "admin") {
      is_admin = true;
    }

    const pool = await getPool;

    const result = await pool.query(
      'INSERT INTO users (email, password, is_admin) VALUES ($1, $2, $3) RETURNING id, email, is_admin',
      [email, password, is_admin]
    );

    return result.rows[0];
  } catch (error) {
    logger.error('Error creating user:', error);
    throw error;
  }
}


  async getAllUsers() {
    try {
      const pool = await getPool;
      const result = await pool.query('SELECT id, email, is_admin FROM users');
      return result.rows;
    } catch (error) {
      logger.error('Error retrieving all users:', error);
      throw error;
    }
  }

  async updateCart(userId, cart) {
    try {
      const pool = await getPool;
      const result = await pool.query(
        'UPDATE users SET cart = $1 WHERE id = $2 RETURNING id, cart',
        [JSON.stringify(cart), userId]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating user cart:', error);
      throw error;
    }
  }
}

module.exports = new UserRepository();