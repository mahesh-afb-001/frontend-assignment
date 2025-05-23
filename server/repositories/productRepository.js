const getPool = require('../config/database');
const logger = require('../utils/logger');

class ProductRepository {
  async getAllProducts() {
    try {
      const pool = await getPool;
      const result = await pool.query('SELECT * FROM products ORDER BY id');
      return result.rows;
    } catch (error) {
      logger.error('Error retrieving all products:', error);
      throw error;
    }
  }

  async getPaginatedProducts(page, pageSize) {
    try {
      const pool = await getPool;
      const offset = (page - 1) * pageSize;
      const totalResult = await pool.query('SELECT COUNT(*) FROM products');
      const totalProducts = parseInt(totalResult.rows[0].count);
      const result = await pool.query(
        'SELECT * FROM products ORDER BY id LIMIT $1 OFFSET $2',
        [pageSize, offset]
      );
      return { products: result.rows, totalProducts };
    } catch (error) {
      logger.error('Error retrieving paginated products:', error);
      throw error;
    }
  }

  async findById(id) {
    try {
      const pool = await getPool;
      const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
      return result.rows[0];
    } catch (error) {
      logger.error('Error finding product by ID:', error);
      throw error;
    }
  }

  async createProduct(name, quantity, price) {
    try {
      const pool = await getPool;
      const result = await pool.query(
        'INSERT INTO products (name, quantity, price) VALUES ($1, $2, $3) RETURNING *',
        [name, quantity, price]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating product:', error);
      throw error;
    }
  }

  async updateProduct(id, name, quantity, price) {
    try {
      const pool = await getPool;
      const result = await pool.query(
        'UPDATE products SET name = $1, quantity = $2, price = $3 WHERE id = $4 RETURNING *',
        [name, quantity, price, id]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating product:', error);
      throw error;
    }
  }

  async deleteProduct(id) {
    try {
      const pool = await getPool;
      const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
      return result.rows[0];
    } catch (error) {
      logger.error('Error deleting product:', error);
      throw error;
    }
  }

  async updateProductPurchase(id, quantity, boughtBy) {
    try {
      const pool = await getPool;
      const result = await pool.query(
        'UPDATE products SET quantity = $1, bought_by = $2 WHERE id = $3 RETURNING *',
        [quantity, boughtBy, id]
      );
      return result.rows[0];
    } catch (error) {
      logger.error('Error updating product purchase:', error);
      throw error;
    }
  }

  async getOrderHistory(userId, page, pageSize) {
    try {
      const pool = await getPool;
      const offset = (page - 1) * pageSize;
      const totalResult = await pool.query(
        'SELECT COUNT(*) FROM products WHERE bought_by = (SELECT email FROM users WHERE id = $1)',
        [userId]
      );
      const totalProducts = parseInt(totalResult.rows[0].count);
      const result = await pool.query(
        'SELECT * FROM products WHERE bought_by = (SELECT email FROM users WHERE id = $1) ORDER BY id LIMIT $2 OFFSET $3',
        [userId, pageSize, offset]
      );
      return { products: result.rows, totalProducts };
    } catch (error) {
      logger.error('Error retrieving order history:', error);
      throw error;
    }
  }
}

module.exports = new ProductRepository();