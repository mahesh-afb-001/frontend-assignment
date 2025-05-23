import './style.css';
import { initAuth } from './auth.js';
import { showProducts } from './products.js';
import { showCart } from './cart.js';
import { initPayment } from './payment.js';
import { showOrderHistory } from './orderHistory.js';
import { showAdminProducts } from './admin.js';
import { trackEvent, initMixpanel } from './mixpanel.js';

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initMixpanel();
  } catch (error) {
    console.error('Mixpanel initialization failed, continuing without analytics:', error);
  }
  initAuth();
  initPayment();

  // User Navbar Handlers
  document.getElementById('products-btn').addEventListener('click', () => {
    trackEvent('Navigate to Products');
    showProducts();
  });
  document.getElementById('cart-btn').addEventListener('click', () => {
    trackEvent('Navigate to Cart');
    showCart();
  });
  document.getElementById('order-history-btn').addEventListener('click', () => {
    trackEvent('Navigate to Order History');
    showOrderHistory();
  });
  document.getElementById('logout-btn').addEventListener('click', () => {
    trackEvent('Logout', { userId: localStorage.getItem('userId') });
    localStorage.removeItem('userId');
    localStorage.removeItem('isAdmin');
    document.getElementById('user-navbar').classList.add('hidden');
    document.getElementById('admin-navbar').classList.add('hidden');
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('signup-section').classList.add('hidden');
    document.getElementById('products-section').classList.add('hidden');
    document.getElementById('cart-section').classList.add('hidden');
    document.getElementById('order-history-section').classList.add('hidden');
    document.getElementById('admin-products-section').classList.add('hidden');
  });

  // Admin Navbar Handlers
  document.getElementById('admin-products-btn').addEventListener('click', () => {
    trackEvent('Navigate to Admin Products');
    showAdminProducts();
  });
  document.getElementById('admin-show-products-btn').addEventListener('click', () => {
    trackEvent('Navigate to Show Products');
    showProducts();
  });
  document.getElementById('admin-logout-btn').addEventListener('click', () => {
    trackEvent('Admin Logout', { userId: localStorage.getItem('userId') });
    localStorage.removeItem('userId');
    localStorage.removeItem('isAdmin');
    document.getElementById('user-navbar').classList.add('hidden');
    document.getElementById('admin-navbar').classList.add('hidden');
    document.getElementById('login-section').classList.remove('hidden');
    document.getElementById('signup-section').classList.add('hidden');
    document.getElementById('products-section').classList.add('hidden');
    document.getElementById('cart-section').classList.add('hidden');
    document.getElementById('order-history-section').classList.add('hidden');
    document.getElementById('admin-products-section').classList.add('hidden');
  });
});