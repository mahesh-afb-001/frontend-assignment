import { getCart, payForProduct } from './api.js';
import { showCart } from './cart.js';
import { trackEvent } from './mixpanel.js';

export function initPayment() {
  document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('pay-now')) {
      const userId = localStorage.getItem('userId');
      const productId = e.target.dataset.id;
      trackEvent('Payment Attempt', { productId });
      const result = await payForProduct(productId, userId);
      if (result.success) {
        trackEvent('Payment Success', { productId });
      } else {
        trackEvent('Payment Failed', { productId, error: result.message });
      }
      alert(result.message);
      showCart();
    }
  });
}