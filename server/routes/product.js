const express = require('express');
const router = express.Router();
const {
  createProduct,
  getAllProducts,
  getPaginatedProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addToCart,
  removeFromCart,
  getCart,
  paymentForProduct,
  getOrderHistory,
  userLogin,
  userSignup,
  getAllUsers,
} = require('../controllers/product');

router.post('/product', createProduct);
router.get('/product', getAllProducts);
router.get('/product/paginated', getPaginatedProducts);
router.get('/product/:id', getProductById);
router.put('/product/:id', updateProduct);
router.delete('/product/:id', deleteProduct);
router.post('/product/cart/:productId', addToCart);
router.delete('/product/cart/:productId', removeFromCart);
router.post('/product/getcart', getCart);
router.post('/product/payment/:productId', paymentForProduct);
router.post('/product/history', getOrderHistory);
router.post('/user/login', userLogin);
router.post('/user/signup', userSignup);
router.get('/user', getAllUsers);

module.exports = router;