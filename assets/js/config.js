const CONFIG = {
  API_BASE_URL: 'http://localhost:8080/book_store_backend',
  ENDPOINTS: {
    ADMIN_LOGIN: '/auth/admin-login',
    ADMIN_PROFILE: '/api/admins', // Append /{id} dynamically
    BOOKS: '/api/books',
    CUSTOMERS: '/api/customers',
    ORDERS: '/api/orders',
    CHARGES: '/api/charges',
    ABOUT: '/api/about',
    CONTACTS: '/api/contacts'
  }
};
