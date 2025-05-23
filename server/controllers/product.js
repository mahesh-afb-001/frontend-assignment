const userRepository = require('../repositories/userRepository');
const productRepository = require('../repositories/productRepository');
const logger = require('../utils/logger');

module.exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const user = await userRepository.findByEmail(email);
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: { id: user.id, email: user.email, isAdmin: user.is_admin },
    });
  } catch (error) {
    logger.error('Error in logging in:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports.userSignup = async (req, res) => {
  try {
    console.log("data recived",req.body)
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }
    const newUser = await userRepository.createUser(email, password);
    if (email ==="admin@afb.com" && password ==="admin"){
        newUser.is_admin = true;
        
    }
    return res.status(201).json({
      success: true,
      message: 'User signup successfully',
      user: { id: newUser.id, email: newUser.email, isAdmin: newUser.is_admin },
    });
  } catch (error) {
    logger.error('Error in sign up:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await userRepository.getAllUsers();
    return res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      users,
    });
  } catch (error) {
    logger.error('Error in retrieving users:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports.createProduct = async (req, res) => {
  try {
    const { name, quantity, price, userId } = req.body;
    if (!name || !quantity || !price || !userId) {
      return res.status(400).json({ success: false, message: 'Name, quantity, price, and userId are required' });
    }
    const user = await userRepository.findById(userId);
    if (!user ) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Admin access required' });
    }
    const product = await productRepository.createProduct(name, quantity, price);
    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error) {
    logger.error('Error in creating product:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports.getAllProducts = async (req, res) => {
  try {
    const products = await productRepository.getAllProducts();
    return res.status(200).json({
      success: true,
      message: 'Products retrieved successfully',
      products,
    });
  } catch (error) {
    logger.error('Error in retrieving products:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports.getPaginatedProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;
    if (page < 1 || pageSize < 1) {
      return res.status(400).json({ success: false, message: 'Page and pageSize must be positive integers' });
    }
    const { products, totalProducts } = await productRepository.getPaginatedProducts(page, pageSize);
    const totalPages = Math.ceil(totalProducts / pageSize);
    if ((page - 1) * pageSize >= totalProducts && totalProducts > 0) {
      return res.status(400).json({ success: false, message: 'Page number exceeds total pages' });
    }
    return res.status(200).json({
      success: true,
      message: 'Paginated products retrieved successfully',
      pagination: { currentPage: page, pageSize, totalProducts, totalPages },
      products,
    });
  } catch (error) {
    logger.error('Error in retrieving paginated products:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productRepository.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Product retrieved successfully',
      product,
    });
  } catch (error) {
    logger.error('Error in retrieving product:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, quantity, price, userId } = req.body;
    const user = await userRepository.findById(userId);
    if (!user || !user.is_admin) {
      return res.status(403).json({ success: false, message: 'Unauthorized: Admin access required' });
    }
    const product = await productRepository.updateProduct(id, name, quantity, price);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product,
    });
  } catch (error) {
    logger.error('Error in updating product:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const user = await userRepository.findById(userId);
    // if (!user ) {
    //   return res.status(403).json({ success: false, message: 'Unauthorized: Admin access required' });
    // }
    const product = await productRepository.deleteProduct(id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully',
      product,
    });
  } catch (error) {
    logger.error('Error in deleting product:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports.addToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId, quantity } = req.body;
    if (!productId || !userId || !quantity) {
      return res.status(400).json({ success: false, message: 'Product ID, user ID, and quantity are required' });
    }
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive integer' });
    }
    const product = await productRepository.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    let cart = user.cart || [];
    const cartItemIndex = cart.findIndex((item) => item.productId === productId);
    if (cartItemIndex !== -1) {
      cart[cartItemIndex].quantity += parsedQuantity;
    } else {
      cart.push({ productId, quantity: parsedQuantity });
    }
    const updatedUser = await userRepository.updateCart(userId, cart);
    return res.status(200).json({
      success: true,
      message: 'Product added to cart successfully',
      cart: updatedUser.cart,
    });
  } catch (error) {
    logger.error('Error in adding to cart:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports.removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId } = req.body;
    if (!productId || !userId) {
      return res.status(400).json({ success: false, message: 'Product ID and user ID are required' });
    }
    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    let cart = user.cart || [];
    const cartItemIndex = cart.findIndex((item) => item.productId === productId);
    if (cartItemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found in cart' });
    }
    const removedItem = cart.splice(cartItemIndex, 1)[0];
    const updatedUser = await userRepository.updateCart(userId, cart);
    return res.status(200).json({
      success: true,
      message: 'Product removed from cart successfully',
      removedItem,
      cart: updatedUser.cart,
    });
  } catch (error) {
    logger.error('Error in removing from cart:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports.getCart = async (req, res) => {
  try {
    console.log("getCart invoked at:", new Date().toISOString(), {
      url: req.originalUrl,
      query: req.query,
      body: req.body,
      method: req.method,
      headers: req.headers
    });
    const userId = req.query.userId || req.body.userId;
    console.log("userId received:", userId);

    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId) || parsedUserId <= 0) {
      console.log("Invalid userId, returning 400:", userId);
      return res.status(400).json({ success: false, message: 'Valid User ID is required' });
    }

    const user = await userRepository.findById(parsedUserId);
    if (!user) {
      console.log("User not found for userId:", parsedUserId);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Initialize cart if undefined or null
    const cart = user.cart ?? [];
    console.log("Raw cart data for userId", parsedUserId, ":", cart);
    if (cart.length === 0) {
      console.log("Cart is empty for userId", parsedUserId);
    }

    // Safe fallback
    const cartItems = Array.isArray(cart) ? cart : [];

    const enrichedCart = await Promise.all(
      cartItems.map(async (item) => {
        if (
          typeof item !== 'object' ||
          item === null ||
          !item.productId ||
          !item.quantity
        ) {
          logger.warn(`Invalid cart item structure: ${JSON.stringify(item)}`);
          return null;
        }

        const productId = Number(item.productId);
        const quantity = Number(item.quantity);

        if (isNaN(productId) || isNaN(quantity)) {
          logger.warn(`Invalid productId/quantity: ${JSON.stringify(item)}`);
          return null;
        }

        try {
          console.log("Fetching product for cart item, productId:", productId);
          const product = await productRepository.findById(productId);
          return {
            productId,
            quantity,
            product: product || null,
          };
        } catch (err) {
          logger.error(`Error fetching product for cart item: ${JSON.stringify(item)}`, err);
          return null;
        }
      })
    );

    const filteredCart = enrichedCart.filter(Boolean);
    console.log("Returning enriched cart:", filteredCart);
    return res.status(200).json({
      success: true,
      message: 'Cart retrieved successfully',
      cart: filteredCart,
    });

  } catch (error) {
    logger.error('Error retrieving cart:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};




module.exports.paymentForProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId, paid, quantity } = req.body;
    if (!productId || !userId || paid === undefined || !quantity) {
      return res.status(400).json({ success: false, message: 'Product ID, user ID, paid status, and quantity are required' });
    }
    const isPaid = paid === 'true' || paid === true;
    if (!isPaid) {
      return res.status(400).json({ success: false, message: 'Payment failed: paid status is false' });
    }
    const parsedQuantity = parseInt(quantity, 10);
    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ success: false, message: 'Quantity must be a positive integer' });
    }
    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const product = await productRepository.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const availableQuantity = parseInt(product.quantity);
    if (availableQuantity < parsedQuantity) {
      return res.status(400).json({ success: false, message: 'Insufficient product quantity' });
    }
    const updatedProduct = await productRepository.updateProductPurchase(
      productId,
      availableQuantity - parsedQuantity,
      user.email
    );
    // Initialize cart if undefined or null
    let cart = user.cart ?? [];
    if (!Array.isArray(cart)) {
      cart = [];
    }
    // Optionally remove product from cart if present
    const cartItemIndex = cart.findIndex((item) => item.productId === productId);
    if (cartItemIndex !== -1) {
      cart.splice(cartItemIndex, 1);
      await userRepository.updateCart(userId, cart);
    }
    return res.status(200).json({
      success: true,
      message: 'Payment successful',
      product: updatedProduct,
      cart: cart,
    });
  } catch (error) {
    logger.error('Error in processing payment:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports.getOrderHistory = async (req, res) => {
  try {
    console.log("his",req);
    const {  page = 1, pageSize = 5 } = req.query;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }
    
    const parsedPage = parseInt(page);
    const parsedPageSize = parseInt(pageSize);
    if (isNaN(parsedPage) || parsedPage < 1 || isNaN(parsedPageSize) || parsedPageSize < 1) {
      return res.status(400).json({ success: false, message: 'Page and pageSize must be positive integers' });
    }
    const { products, totalProducts } = await productRepository.getOrderHistory(userId, parsedPage, parsedPageSize);
    const totalPages = Math.ceil(totalProducts / parsedPageSize);
    if ((page - 1) * pageSize >= totalProducts && totalProducts > 0) {
      return res.status(400).json({ success: false, message: 'Page number exceeds total pages' });
    }
    return res.status(200).json({
      success: true,
      message: 'Order history retrieved successfully',
      pagination: { currentPage: parsedPage, pageSize: parsedPageSize, totalProducts, totalPages },
      products,
    });
  } catch (error) {
    logger.error('Error in retrieving order history:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};