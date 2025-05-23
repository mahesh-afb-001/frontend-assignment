module.exports = {
  up: async (pgm) => {
    await pgm.sql(`
      CREATE TABLE products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        bought_by VARCHAR(255)
      );
    `);
  },
  down: async (pgm) => {
    await pgm.sql('DROP TABLE products;');
  },
};