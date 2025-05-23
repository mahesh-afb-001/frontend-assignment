import { getPaginatedProducts, addToCart, payForProduct } from './api.js';
import { trackEvent } from './mixpanel.js';

let currentPage = 1;
const pageSize = 2;

export async function showProducts() {
  const productsSection = document.getElementById('products-section');
  const productsList = document.getElementById('products-list');
  const pageInfo = document.getElementById('products-page-info');
  const prevBtn = document.getElementById('products-prev');
  const nextBtn = document.getElementById('products-next');
  const userId = localStorage.getItem('userId');

  productsSection.classList.remove('hidden');
  document.getElementById('cart-section').classList.add('hidden');
  document.getElementById('order-history-section').classList.add('hidden');
  document.getElementById('admin-products-section').classList.add('hidden');
  trackEvent('View Products Page', { page: currentPage });

  async function loadProducts(page) {
    const result = await getPaginatedProducts(page, pageSize);
    if (result.success) {
      productsList.innerHTML = result.products.map(product => `
        <div class="card">
          <h3>${product.name}</h3>
          <p>Quantity: ${product.quantity}</p>
          <p>Price: $${product.price}</p>
          <button class="add-to-cart btn" data-id="${product.id}">Add to Cart</button>
          <button class="pay-now btn" data-id="${product.id}">Pay</button>
        </div>
      `).join('');
      pageInfo.textContent = `Page ${result.pagination.currentPage} of ${result.pagination.totalPages}`;
      prevBtn.disabled = result.pagination.currentPage === 1;
      nextBtn.disabled = result.pagination.currentPage === result.pagination.totalPages;
      trackEvent('Products Loaded', { page: result.pagination.currentPage, totalProducts: result.products.length });

      document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', async () => {
          const productId = btn.dataset.id;
          const result = await addToCart(productId, userId, 1);
          trackEvent('Add to Cart', { productId, quantity: 1 });
          alert(result.message);
        });
      });

      document.querySelectorAll('.pay-now').forEach(btn => {
        btn.addEventListener('click', async () => {
          const productId = btn.dataset.id;
          trackEvent('Payment Attempt', { productId });
          const result = await payForProduct(productId, userId);
          if (result.success) {
            trackEvent('Payment Success', { productId });
          } else {
            trackEvent('Payment Failed', { productId, error: result.message });
          }
          alert(result.message);
          loadProducts(page);
        });
      });
    }
  }

  await loadProducts(currentPage);

  prevBtn.addEventListener('click', async () => {
    if (currentPage > 1) {
      currentPage--;
      trackEvent('Products Page Previous', { page: currentPage });
      await loadProducts(currentPage);
    }
  });

  nextBtn.addEventListener('click', async () => {
    currentPage++;
    trackEvent('Products Page Next', { page: currentPage });
    await loadProducts(currentPage);
  });
}