const API_BASE_URL = 'http://localhost:3000/api';

async function apiRequest(endpoint, method = 'GET', data = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (data) {
    options.body = JSON.stringify(data);
  }
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  return await response.json();
}

export const login = (email, password) =>
  apiRequest('/user/login', 'POST', { email, password });

export const signup = (email, password) =>
  apiRequest('/user/signup', 'POST', { email, password });

export const getProducts = () =>
  apiRequest('/product');

export const getProductById = (id) =>
  apiRequest(`/product/${id}`);

export const addProduct = (name, quantity, price,userId) =>
  apiRequest('/product', 'POST', { name, quantity, price ,userId});

export const updateProduct = (id, name, quantity, price, userId) =>
  apiRequest(`/product/${id}`, 'PUT', { name, quantity, price, userId });

export const deleteProduct = (id, data) =>
  apiRequest(`/product/${id}`, 'DELETE', {data});


export const getPaginatedProducts = (page = 1, pageSize = 2) =>
  apiRequest(`/product/paginated?page=${page}&pageSize=${pageSize}`);

export const addToCart = (productId, userId, quantity) =>
  apiRequest(`/product/cart/${productId}`, 'POST', { userId, quantity });

export const getCart = (userId) =>
  apiRequest(`/cart?userId=${userId}`);

export const removeFromCart = (productId, userId) =>
  apiRequest(`/product/cart/${productId}`, 'DELETE', { userId });

export const payForProduct = (productId, userId) =>
  apiRequest(`/product/payment/${productId}`, 'POST', { userId });

export const getOrderHistory = (userId, page = 1, pageSize = 5) =>
  apiRequest(`/product/history?userId=${userId}&page=${page}&pageSize=${pageSize}`);