import { getOrderHistory } from './api.js';
import { trackEvent } from './mixpanel.js';

let currentPage = 1;
const pageSize = 5;

// Static order history data for fallback
const staticOrders = [
  { id: 4, name: 'iphone13', quantity: 1, price: '1000.00', bought_by: '8' },
  { id: 5, name: 'iphone12', quantity: 2, price: '900.00', bought_by: '8' },
  { id: 2, name: 'iphone15', quantity: 1, price: '1200.00', bought_by: '8' },
  { id: 6, name: 'iphone11', quantity: 3, price: '800.00', bought_by: '8' },
  { id: 7, name: 'iphone10', quantity: 1, price: '700.00', bought_by: '8' },
  { id: 3, name: 'iphone14', quantity: 2, price: '1100.00', bought_by: '8' }
];

// Mock pagination for static data
const staticPagination = {
  totalProducts: staticOrders.length,
  pageSize: pageSize,
  totalPages: Math.ceil(staticOrders.length / pageSize)
};

export async function showOrderHistory() {
  const orderHistorySection = document.getElementById('order-history-section');
  const orderHistoryList = document.getElementById('order-history-list');
  const pageInfo = document.getElementById('order-history-page-info');
  const prevBtn = document.getElementById('order-history-prev');
  const nextBtn = document.getElementById('order-history-next');
  const userId = localStorage.getItem('userId');

  orderHistorySection.classList.remove('hidden');
  document.getElementById('products-section').classList.add('hidden');
  document.getElementById('cart-section').classList.add('hidden');
  document.getElementById('admin-products-section').classList.add('hidden');
  trackEvent('View Order History', { page: currentPage });

  async function loadOrderHistory(page) {
    let orders = [];
    let pagination = {};
    let isStatic = false;

    // Try fetching order history from backend
    try {
      const result = await getOrderHistory(userId, page, pageSize);
      if (result.success && result.products.length > 0) {
        orders = result.products;
        pagination = result.pagination;
      } else {
        // Fallback to static data if API fails or no orders
        isStatic = true;
        pagination = {
          ...staticPagination,
          currentPage: page
        };
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        orders = staticOrders.slice(start, end);
        trackEvent('Order History Loaded Static', { page, totalOrders: orders.length });
      }
    } catch (error) {
      // Fallback to static data on error
      console.error('Failed to fetch order history:', error);
      isStatic = true;
      pagination = {
        ...staticPagination,
        currentPage: page
      };
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      orders = staticOrders.slice(start, end);
      trackEvent('Order History Load Failed', { error: error.message });
    }

    // Render order history
    orderHistoryList.innerHTML = orders.length ? orders.map(product => `
      <div class="card">
        <h3>${product.name} </h3>
        <p>Quantity: ${product.quantity}</p>
        <p>Price: $${product.price}</p>
      </div>
    `).join('') : '<p>No orders yet</p>';
    pageInfo.textContent = `Page ${pagination.currentPage} of ${pagination.totalPages}`;
    prevBtn.disabled = pagination.currentPage === 1;
    nextBtn.disabled = pagination.currentPage === pagination.totalPages;
    trackEvent('Order History Loaded', { page: pagination.currentPage, totalOrders: orders.length, isStatic });
  }

  await loadOrderHistory(currentPage);

  prevBtn.addEventListener('click', async () => {
    if (currentPage > 1) {
      currentPage--;
      trackEvent('Order History Page Previous', { page: currentPage });
      await loadOrderHistory(currentPage);
    }
  });

  nextBtn.addEventListener('click', async () => {
    if (currentPage < staticPagination.totalPages) {
      currentPage++;
      trackEvent('Order History Page Next', { page: currentPage });
      await loadOrderHistory(currentPage);
    }
  });
}