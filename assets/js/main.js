/**
 * main.js - Core UI Initializer and Session Guard
 * Runs on every administration view. Initializes layout renders,
 * binds global scrolls, and confirms active sessions.
 */

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    // 1. Session Protection Guard Check
    if (window.Auth) {
      Auth.guardRoute();
    }

    // 2. Identify Current View Active Link
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    let activeKey = 'dashboard';
    
    if (currentPage.includes('customer')) activeKey = 'customers';
    else if (currentPage.includes('order')) activeKey = 'orders';
    else if (currentPage.includes('book')) activeKey = 'books';
    else if (currentPage.includes('categor')) activeKey = 'categories';
    else if (currentPage.includes('inventory')) activeKey = 'inventory';
    else if (currentPage.includes('analytics')) activeKey = 'analytics';
    else if (currentPage.includes('notification')) activeKey = 'notifications';
    else if (currentPage.includes('setting')) activeKey = 'settings';
    else if (currentPage.includes('profile')) activeKey = 'profile';

    // 3. Trigger Common Renders (Sidebar, Navbar, Footer)
    if (window.loadCommonComponents) {
      loadCommonComponents(activeKey);
    }

    // 4. Sticky Header Scrolling shadow trigger
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
      if (navbar) {
        if (window.scrollY > 10) {
          navbar.classList.add('navbar-scrolled');
          navbar.style.boxShadow = 'var(--shadow-md)';
        } else {
          navbar.classList.remove('navbar-scrolled');
          navbar.style.boxShadow = 'none';
        }
      }
    });

    // 5. Apply saved HTML theme on load to prevent flash
    if (window.BookstoreAPI) {
      const savedTheme = BookstoreAPI.getSettings().theme;
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  });
})();
