const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/product');
const getPool = require('./config/database');
const logger = require('./utils/logger');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: '*', }));
app.use(express.json());

app.use('/api', productRoutes);

const PORT = 3000;

async function startServer() {
  try {
    const pool = await getPool;
    app.locals.db = pool; // Store pool for potential use in routes
    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();