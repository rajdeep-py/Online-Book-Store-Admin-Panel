const CONFIG = {
  API_BASE_URL: 'http://localhost:8080/book_store_backend',
  ENDPOINTS: {
    ADMIN_LOGIN: '/auth/admin-login',
    ADMIN_SIGNUP: '/api/admins',
    ADMIN_PROFILE: '/api/admins', // Append /{id} dynamically
    BOOKS: '/api/books',
    CUSTOMERS: '/api/admin/customers',
    ORDERS: '/api/admin/orders',
    CHARGES: '/api/charges',
    ABOUT: '/api/about',
    CONTACTS: '/api/contacts'
  }
};
