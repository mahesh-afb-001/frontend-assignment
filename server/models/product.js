module.exports = {
  tableName: 'products',
  columns: {
    id: 'serial PRIMARY KEY',
    name: 'varchar(255) NOT NULL',
    quantity: 'integer NOT NULL',
    price: 'decimal(10,2) NOT NULL',
    bought_by: 'varchar(255) DEFAULT \'\'',
    created_at: 'timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP',
  },
};