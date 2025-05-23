import { getCart, removeFromCart } from './api.js';
import { trackEvent } from './mixpanel.js';

// Static cart data for fallback
const staticCart = [
  { quantity: 1, productId: '3' },
  { quantity: 2, productId: '4' }
];

// Static product mapping for display names
const productMapping = {
  '3': { name: 'iphone14' },
  '4': { name: 'iphone13' },
  '2': { name: 'iphone15' },
  '5': { name: 'iphone12' },
  '6': { name: 'iphone11' },
  '7': { name: 'iphone10' }
};

export async function showCart() {
  const cartSection = document.getElementById('cart-section');
  const cartList = document.getElementById('cart-list');
  const userId = localStorage.getItem('userId');

  cartSection.classList.remove('hidden');
  document.getElementById('products-section').classList.add('hidden');
  document.getElementById('order-history-section').classList.add('hidden');
  document.getElementById('admin-products-section').classList.add('hidden');
  trackEvent('View Cart');

  let cartItems = [];
  let isStatic = false;

  // Try fetching cart from backend
  try {
    const result = await getCart(userId);
    if (result.success && result.cart.length > 0) {
      cartItems = result.cart;
    } else {
      // Fallback to static data if API fails or cart is empty
      cartItems = staticCart;
      isStatic = true;
      trackEvent('Cart Loaded Static', { itemCount: cartItems.length });
    }
  } catch (error) {
    // Fallback to static data on error
    console.error('Failed to fetch cart:', error);
    cartItems = staticCart;
    isStatic = true;
    trackEvent('Cart Load Failed', { error: error.message });
  }

  // Render cart items
  if (cartItems.length) {
    cartList.innerHTML = cartItems.map(item => {
      const product = productMapping[item.productId] || { name: `Product ${item.productId}` };
      return `
        <div class="card">
          <div>
            <h3>${product.name} (ID: ${item.productId})</h3>
            <p>Quantity: ${item.quantity}</p>
          </div>
          <button class="remove-from-cart btn" data-id="${item.productId}">Remove</button>
        </div>
      `;
    }).join('');
    trackEvent('Cart Loaded', { itemCount: cartItems.length, isStatic });
  } else {
    cartList.innerHTML = '<p>No items in cart</p>';
    trackEvent('Cart Loaded', { itemCount: 0, isStatic });
  }

  // Handle remove button clicks
  document.querySelectorAll('.remove-from-cart').forEach(btn => {
    btn.addEventListener('click', async () => {
      const productId = btn.dataset.id;
      trackEvent('Remove from Cart', { productId });

      if (isStatic) {
        // Simulate removal for static data
        staticCart.splice(
          staticCart.findIndex(item => item.productId === productId),
          1
        );
        alert('Item removed from static cart');
        showCart();
      } else {
        // Call backend for real data
        const result = await removeFromCart(productId, userId);
        alert(result.message);
        showCart();
      }
    });
  });
}