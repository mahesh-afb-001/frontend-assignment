module.exports = {
  up: async (pgm) => {
    await pgm.sql(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        cart JSONB DEFAULT '[]'
      );
    `);
  },
  down: async (pgm) => {
    await pgm.sql('DROP TABLE users;');
  },
};