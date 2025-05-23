module.exports = {
  tableName: 'users',
  columns: {
    id: 'serial PRIMARY KEY',
    email: 'varchar(255) NOT NULL UNIQUE',
    password: 'varchar(255) NOT NULL',
    is_admin: 'boolean NOT NULL DEFAULT FALSE',
    cart: 'jsonb NOT NULL DEFAULT \'[]\'',
    created_at: 'timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP',
  },
};
