/**
 * auth.js - Admin Authentication and Route Protection
 * Provides secure mock sessions, remember me cookies, credentials checks,
 * and page locks across administrative dashboards.
 */

(function () {
  const SESSION_KEY = 'bookstore_admin_session';

  window.Auth = {
    // Check if user is logged in
    isLoggedIn: function () {
      return sessionStorage.getItem(SESSION_KEY) === 'active' || localStorage.getItem(SESSION_KEY) === 'active';
    },

    // Perform credentials check
    login: function (email, password, rememberMe) {
      // Credentials: admin@bookheaven.com / admin123
      if (email.trim().toLowerCase() === 'admin@bookheaven.com' && password === 'admin123') {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem(SESSION_KEY, 'active');
        
        // Log activity
        if (window.BookstoreAPI) {
          BookstoreAPI.addNotification(
            'system', 
            'Admin Login Detected', 
            `User logged in from browser session (${new Date().toLocaleTimeString()}).`
          );
        }
        return { success: true };
      }
      return { success: false, message: 'Invalid administrative email or password!' };
    },

    // Perform log out
    logout: function () {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_KEY);
      window.location.href = 'login.html';
    },

    // Route Protection Guard
    guardRoute: function () {
      const currentPage = window.location.pathname.split('/').pop();
      if (currentPage !== 'login.html' && !this.isLoggedIn()) {
        window.location.href = 'login.html';
      }
      if (currentPage === 'login.html' && this.isLoggedIn()) {
        window.location.href = 'index.html';
      }
    }
  };

  // Run Route Guard immediately on script load
  window.Auth.guardRoute();

})();
