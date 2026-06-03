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
    login: async function (email, password, rememberMe) {
      try {
        const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.ADMIN_LOGIN}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include'
        });

        if (response.ok) {
          let adminId = 1; // Default ID if not returned
          let sessionId = null;
          try {
            const data = await response.json();
            if (data && data.admin_id) adminId = data.admin_id;
            else if (data && data.id) adminId = data.id;
            if (data && data.session_id) sessionId = data.session_id;
          } catch (e) {
            // Not JSON
          }

          const storage = rememberMe ? localStorage : sessionStorage;
          storage.setItem(SESSION_KEY, 'active');
          storage.setItem('admin_id', adminId);
          if (sessionId) {
            storage.setItem('bookheaven_admin_session_id', sessionId);
          }
          
          // Log activity
          if (window.BookstoreAPI) {
            BookstoreAPI.addNotification(
              'system', 
              'Admin Login Detected', 
              `User logged in from browser session (${new Date().toLocaleTimeString()}).`
            );
          }
          return { success: true };
        } else {
          return { success: false, message: 'Invalid administrative email or password!' };
        }
      } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Connection error. Please try again.' };
      }
    },

    // Create a new admin account
    registerAdmin: async function (adminName, adminEmail, adminPassword) {
      try {
        const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.ADMIN_SIGNUP}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            admin_name: adminName,
            admin_email: adminEmail,
            admin_password: adminPassword
          }),
          credentials: 'include'
        });

        if (response.ok) {
          let createdAdmin = null;
          try {
            createdAdmin = await response.json();
          } catch (e) {
            // Response may be empty or non-JSON.
          }

          if (window.BookstoreAPI) {
            BookstoreAPI.addNotification(
              'system',
              'Admin Account Created',
              `New admin account registered from browser session (${new Date().toLocaleTimeString()}).`
            );
          }

          return {
            success: true,
            message: createdAdmin?.message || 'Admin account created successfully.'
          };
        }

        let errorMessage = 'Unable to create admin account.';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // Keep default error message.
        }

        return { success: false, message: errorMessage };
      } catch (error) {
        console.error('Signup error:', error);
        return { success: false, message: 'Connection error. Please try again.' };
      }
    },

    // Perform log out
    logout: function () {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem('bookheaven_admin_session_id');
      localStorage.removeItem('bookheaven_admin_session_id');
      window.location.href = 'login.html';
    },

    // Route Protection Guard
    guardRoute: function () {
      const currentPage = window.location.pathname.split('/').pop();
      const publicPages = ['login.html', 'signup.html'];

      if (!publicPages.includes(currentPage) && !this.isLoggedIn()) {
        window.location.href = 'login.html';
      }
      if (currentPage === 'login.html' && this.isLoggedIn()) {
        window.location.href = 'index.html';
      }
      if (currentPage === 'signup.html' && this.isLoggedIn()) {
        window.location.href = 'index.html';
      }
    }
  };

  // Run Route Guard immediately on script load
  window.Auth.guardRoute();

})();
