import { getProducts, addProduct, updateProduct, deleteProduct } from './api.js';
import { showProducts } from './products.js';
import { trackEvent } from './mixpanel.js';

export async function showAdminProducts() {
  const adminProductsSection = document.getElementById('admin-products-section');
  const adminProductsList = document.getElementById('admin-products-list');
  const addProductBtn = document.getElementById('admin-add-product');
  const editProductBtn = document.getElementById('admin-edit-product');
  const cancelEditBtn = document.getElementById('admin-cancel-edit');
  const editForm = document.querySelector('.edit-form');
  const addError = document.getElementById('admin-add-error');
  const editError = document.getElementById('admin-edit-error');

  adminProductsSection.classList.remove('hidden');
  document.getElementById('products-section').classList.add('hidden');
  document.getElementById('cart-section').classList.add('hidden');
  document.getElementById('order-history-section').classList.add('hidden');
  trackEvent('View Admin Products');

  async function loadProducts() {
    const result = await getProducts();
    if (result.success) {
      adminProductsList.innerHTML = result.products.map(product => `
        <div class="card">
          <h3>${product.name}</h3>
          <p>Quantity: ${product.quantity}</p>
          <p>Price: $${product.price}</p>
          <button class="edit-product btn" data-id="${product.id}" data-name="${product.name}" data-quantity="${product.quantity}" data-price="${product.price}">Edit Product</button>
          <button class="delete-product btn delete" data-id="${product.id}">Delete Product</button>
        </div>
      `).join('');
      trackEvent('Admin Products Loaded', { totalProducts: result.products.length });

      document.querySelectorAll('.edit-product').forEach(btn => {
        btn.addEventListener('click', () => {
          document.getElementById('admin-edit-product-id').value = btn.dataset.id;
          document.getElementById('admin-edit-product-name').value = btn.dataset.name;
          document.getElementById('admin-edit-product-quantity').value = btn.dataset.quantity;
          document.getElementById('admin-edit-product-price').value = btn.dataset.price;
          editForm.classList.remove('hidden');
          trackEvent('Edit Product Form Opened', { productId: btn.dataset.id });
        });
      });

      document.querySelectorAll('.delete-product').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          trackEvent('Delete Product Attempt', { productId: id });
          const result = await deleteProduct(id,localStorage.getItem('userId'));
          if (result.success) {
            trackEvent('Delete Product Success', { productId: id });
            alert(result.message);
            loadProducts();
          } else {
            trackEvent('Delete Product Failed', { productId: id, error: result.message });
            alert(result.message);
          }
        });
      });
    } else {
      trackEvent('Admin Products Load Failed', { error: result.message });
      alert(result.message);
    }
  }

  await loadProducts();

  addProductBtn.addEventListener('click', async () => {
    const name = document.getElementById('admin-product-name').value;
    const quantity = parseInt(document.getElementById('admin-product-quantity').value);
    const price = document.getElementById('admin-product-price').value;
    trackEvent('Add Product Attempt', { name });
    const userId = localStorage.getItem('userId');
    const result = await addProduct(name, quantity, price,userId);
    if (result.success) {
      trackEvent('Add Product Success', { name });
      alert(result.message);
      document.getElementById('admin-product-name').value = '';
      document.getElementById('admin-product-quantity').value = '';
      document.getElementById('admin-product-price').value = '';
      addError.classList.add('hidden');
      loadProducts();
    } else {
      trackEvent('Add Product Failed', { name, error: result.message });
      addError.textContent = result.message;
      addError.classList.remove('hidden');
    }
  });

  editProductBtn.addEventListener('click', async () => {
    const id = document.getElementById('admin-edit-product-id').value;
    const name = document.getElementById('admin-edit-product-name').value;
    const quantity = parseInt(document.getElementById('admin-edit-product-quantity').value);
    const price = document.getElementById('admin-edit-product-price').value;
    const userId = localStorage.getItem('userId');
    trackEvent('Edit Product Attempt', { productId: id });
    const result = await updateProduct(id, name, quantity, price, userId);
    if (result.success) {
      trackEvent('Edit Product Success', { productId: id });
      alert(result.message);
      editForm.classList.add('hidden');
      editError.classList.add('hidden');
      loadProducts();
    } else {
      trackEvent('Edit Product Failed', { productId: id, error: result.message });
      editError.textContent = result.message;
      editError.classList.remove('hidden');
    }
  });

  cancelEditBtn.addEventListener('click', () => {
    editForm.classList.add('hidden');
    editError.classList.add('hidden');
    trackEvent('Edit Product Cancelled');
  });

  // Handle "Show Products" button
  document.getElementById('admin-show-products-btn').addEventListener('click', () => {
    trackEvent('Navigate to Show Products');
    showProducts();
  });
}