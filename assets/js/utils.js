/**
 * utils.js - Common UI Components, Utilities and CORS-Resilient Loaders
 * Implements high-fidelity global UI widgets (Toasts, Modals, Loaders)
 * and robust HTML helper utilities.
 */

(function () {
  // Global Toast Implementation
  window.showToast = function (message, type = 'success') {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} fade-in`;
    
    let icon = 'fa-check-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    if (type === 'danger') icon = 'fa-exclamation-circle';
    if (type === 'info') icon = 'fa-info-circle';

    toast.innerHTML = `
      <div class="toast-content">
        <i class="fas ${icon} toast-icon"></i>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close-btn">&times;</button>
    `;

    toastContainer.appendChild(toast);

    // Slide out and remove
    const dismiss = () => {
      toast.classList.remove('fade-in');
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    };

    toast.querySelector('.toast-close-btn').addEventListener('click', dismiss);
    setTimeout(dismiss, 4000);
  };

  // Full Screen Loader Utility
  let loaderActiveCount = 0;
  window.showLoader = function () {
    loaderActiveCount++;
    let loader = document.getElementById('global-loader');
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'global-loader';
      loader.className = 'loader-overlay';
      loader.innerHTML = `
        <div class="loader-content">
          <div class="loader-spinner"></div>
          <p class="loader-text">Loading Bookstore Systems...</p>
        </div>
      `;
      document.body.appendChild(loader);
    }
    loader.classList.add('active');
  };

  window.hideLoader = function () {
    loaderActiveCount = Math.max(0, loaderActiveCount - 1);
    if (loaderActiveCount === 0) {
      const loader = document.getElementById('global-loader');
      if (loader) {
        loader.classList.remove('active');
      }
    }
  };

  // Formatters
  window.formatCurrency = function (value) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  };

  window.formatDate = function (dateStr) {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Modals Framework
  window.createModal = function (options = {}) {
    const { title, contentHTML, onClose, actions = [] } = options;
    
    // Close existing modal
    const existing = document.getElementById('global-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'global-modal';
    modal.className = 'modal-overlay active';
    
    const actionsHTML = actions.map(act => `
      <button class="btn btn-${act.type || 'secondary'} modal-action-btn" id="modal-btn-${act.id}">
        ${act.label}
      </button>
    `).join('');

    modal.innerHTML = `
      <div class="modal-container fade-in-up">
        <div class="modal-header">
          <h3 class="modal-title">${title || 'Notice'}</h3>
          <button class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-body">
          ${contentHTML || ''}
        </div>
        ${actions.length > 0 ? `<div class="modal-footer">${actionsHTML}</div>` : ''}
      </div>
    `;

    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden'; // Lock scrolling

    const closeModal = () => {
      modal.querySelector('.modal-container').classList.remove('fade-in-up');
      modal.querySelector('.modal-container').classList.add('fade-out-down');
      modal.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => {
        modal.remove();
        if (onClose) onClose();
      }, 300);
    };

    modal.querySelector('.modal-close-btn').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    actions.forEach(act => {
      const btn = modal.querySelector(`#modal-btn-${act.id}`);
      if (btn) {
        btn.addEventListener('click', () => {
          if (act.callback) {
            act.callback(closeModal);
          } else {
            closeModal();
          }
        });
      }
    });

    return closeModal;
  };

  // CORS-Resilient Common Components Loader (Sidebar, Navbar, Footer)
  window.loadCommonComponents = async function (activePage = '') {
    showLoader();
    
    const sidebarContainer = document.getElementById('sidebar-container');
    const navbarContainer = document.getElementById('navbar-container');
    const footerContainer = document.getElementById('footer-container');

    const admin = await BookstoreAPI.getAdminProfile();
    const settings = BookstoreAPI.getSettings();

    // 1. Sidebar HTML template
    const sidebarHTML = `
      <div class="sidebar-brand">
        <div class="brand-logo">
          <i class="fas fa-book-open"></i>
        </div>
        <span class="brand-name">Book Heaven</span>
      </div>
      <div class="sidebar-user">
        <img src="${admin.avatar}" alt="Admin Avatar" class="user-avatar-img">
        <div class="user-info">
          <span class="user-name">${admin.name}</span>
          <span class="user-role">${admin.role}</span>
        </div>
      </div>
      <nav class="sidebar-menu">
        <ul class="menu-list">
          <li class="menu-item ${activePage === 'dashboard' ? 'active' : ''}">
            <a href="index.html" class="menu-link">
              <i class="fas fa-chart-line menu-icon"></i>
              <span class="menu-text">Dashboard</span>
            </a>
          </li>
          <li class="menu-item ${activePage === 'customers' ? 'active' : ''}">
            <a href="customers.html" class="menu-link">
              <i class="fas fa-users menu-icon"></i>
              <span class="menu-text">Customers</span>
            </a>
          </li>
          <li class="menu-item ${activePage === 'orders' ? 'active' : ''}">
            <a href="orders.html" class="menu-link">
              <i class="fas fa-shopping-cart menu-icon"></i>
              <span class="menu-text">Orders</span>
            </a>
          </li>
          <li class="menu-item ${activePage === 'books' ? 'active' : ''}">
            <a href="books.html" class="menu-link">
              <i class="fas fa-book menu-icon"></i>
              <span class="menu-text">Books</span>
            </a>
          </li>
          <li class="menu-item ${activePage === 'inventory' ? 'active' : ''}">
            <a href="inventory.html" class="menu-link">
              <i class="fas fa-boxes menu-icon"></i>
              <span class="menu-text">Inventory</span>
            </a>
          </li>
          <li class="menu-item ${activePage === 'analytics' ? 'active' : ''}">
            <a href="analytics.html" class="menu-link">
              <i class="fas fa-chart-pie menu-icon"></i>
              <span class="menu-text">Analytics</span>
            </a>
          </li>

          <li class="menu-item logout-item">
            <a href="#" id="sidebar-logout-btn" class="menu-link">
              <i class="fas fa-sign-out-alt menu-icon"></i>
              <span class="menu-text">Logout</span>
            </a>
          </li>
        </ul>
      </nav>
      <div class="sidebar-toggle" id="sidebar-toggle-btn">
        <i class="fas fa-chevron-left"></i>
      </div>
    `;

    // 2. Navbar HTML template
    const unreadCount = BookstoreAPI.getNotifications().filter(n => !n.read).length;
    const navbarHTML = `
      <div class="navbar-left">
        <button class="navbar-mobile-toggle" id="mobile-sidebar-toggle">
          <i class="fas fa-bars"></i>
        </button>
        <div class="navbar-search">
          <i class="fas fa-search search-icon"></i>
          <input type="text" placeholder="Search orders, books, customers..." class="search-input" id="global-search-input">
        </div>
      </div>
      <div class="navbar-right">
        <!-- Theme Toggle -->
        <button class="nav-action-btn" id="theme-toggle-btn" title="Toggle Light/Dark Theme">
          <i class="fas ${settings.theme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>
        </button>

        
        <!-- Profile Dropdown Trigger -->
        <div class="nav-dropdown" id="profile-dropdown-wrapper">
          <button class="nav-profile-btn" id="profile-trigger-btn">
            <img src="${admin.avatar}" alt="Admin" class="nav-profile-img">
            <span class="nav-profile-name">${admin.name.split(' ')[0]}</span>
            <i class="fas fa-chevron-down profile-arrow"></i>
          </button>
          <div class="dropdown-panel profile-panel">
            <div class="profile-summary">
              <img src="${admin.avatar}" alt="Admin">
              <div>
                <h5>${admin.name}</h5>
                <p>${admin.role}</p>
              </div>
            </div>
            <ul class="profile-links">

              <li><a href="#" id="navbar-logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
            </ul>
          </div>
        </div>
      </div>
    `;

    // 3. Footer HTML template
    const footerHTML = `
      <div class="footer-left">
        <p>&copy; ${new Date().getFullYear()} <strong>Book Heaven</strong>. All rights reserved.</p>
      </div>
      <div class="footer-right">
        <p>Engineered with <i class="fas fa-heart text-danger"></i> by Antigravity v1.0.0</p>
      </div>
    `;

    // Hybrid Loader Implementation to bypass CORS issues on file:// protocol
    const isLocalProtocol = window.location.protocol === 'file:';

    function injectComponents() {
      // Injects templates into DOM
      if (sidebarContainer) sidebarContainer.innerHTML = sidebarHTML;
      if (navbarContainer) navbarContainer.innerHTML = navbarHTML;
      if (footerContainer) footerContainer.innerHTML = footerHTML;

      // Update notifications badges
      const sidebarNotifCount = document.getElementById('sidebar-notif-count');
      if (sidebarNotifCount) {
        sidebarNotifCount.textContent = unreadCount;
        sidebarNotifCount.style.display = unreadCount > 0 ? 'inline-block' : 'none';
      }

      // Initialize dropdown triggers and toggle listeners
      window.initComponentEvents();
      hideLoader();
    }

    if (isLocalProtocol) {
      // Skip fetch on file:// to bypass CORS block and render templates instantly
      setTimeout(injectComponents, 100);
    } else {
      // On web servers, we attempt to fetch component files, falling back to local template on failure
      Promise.all([
        fetch('components/sidebar.html').then(r => r.ok ? r.text() : null).catch(() => null),
        fetch('components/navbar.html').then(r => r.ok ? r.text() : null).catch(() => null),
        fetch('components/footer.html').then(r => r.ok ? r.text() : null).catch(() => null)
      ]).then(([sHTML, nHTML, fHTML]) => {
        if (sidebarContainer) sidebarContainer.innerHTML = sHTML || sidebarHTML;
        if (navbarContainer) navbarContainer.innerHTML = nHTML || navbarHTML;
        if (footerContainer) footerContainer.innerHTML = fHTML || footerHTML;

        const sidebarNotifCount = document.getElementById('sidebar-notif-count');
        if (sidebarNotifCount) {
          sidebarNotifCount.textContent = unreadCount;
          sidebarNotifCount.style.display = unreadCount > 0 ? 'inline-block' : 'none';
        }

        window.initComponentEvents();
        hideLoader();
      }).catch(() => {
        injectComponents();
      });
    }
  };

  // Event handlers initialization for common layout elements
  window.initComponentEvents = function () {
    // 1. Sidebar Toggle (Collapses / Expand)
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    
    if (sidebar && sidebarToggleBtn) {
      // Read saved setting
      const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
      if (isCollapsed) {
        sidebar.classList.add('collapsed');
        document.body.classList.add('sidebar-collapsed');
      }

      sidebarToggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        document.body.classList.toggle('sidebar-collapsed');
        localStorage.setItem('sidebar_collapsed', sidebar.classList.contains('collapsed'));
      });
    }

    // Mobile Sidebar Toggle
    const mobileToggle = document.getElementById('mobile-sidebar-toggle');
    if (mobileToggle && sidebar) {
      mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-active');
      });
    }

    // Close mobile sidebar clicking outside
    document.addEventListener('click', (e) => {
      if (sidebar && sidebar.classList.contains('mobile-active') &&
          !sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
        sidebar.classList.remove('mobile-active');
      }
    });

    // 2. Dropdown Panels
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    dropdowns.forEach(dd => {
      const trigger = dd.querySelector('button');
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdowns.forEach(other => {
          if (other !== dd) other.classList.remove('active');
        });
        dd.classList.toggle('active');
      });
    });

    document.addEventListener('click', () => {
      dropdowns.forEach(dd => dd.classList.remove('active'));
    });

    // 3. Theme Toggle (Light / Dark Mode)
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const settings = BookstoreAPI.getSettings();
        const newTheme = settings.theme === 'light' ? 'dark' : 'light';
        BookstoreAPI.updateSettings({ theme: newTheme });
        
        document.documentElement.setAttribute('data-theme', newTheme);
        themeBtn.innerHTML = `<i class="fas ${newTheme === 'dark' ? 'fa-sun' : 'fa-moon'}"></i>`;
        showToast(`Theme switched to ${newTheme} mode!`, 'info');
      });
    }

    // Apply saved theme initially
    const savedTheme = BookstoreAPI.getSettings().theme;
    document.documentElement.setAttribute('data-theme', savedTheme);

    // 4. Populate Navbar Notifications List
    const notifList = document.getElementById('navbar-notif-list');
    if (notifList) {
      const notifs = BookstoreAPI.getNotifications().slice(0, 5); // top 5
      if (notifs.length === 0) {
        notifList.innerHTML = '<div class="empty-dropdown">No new notifications</div>';
      } else {
        notifList.innerHTML = notifs.map(n => {
          let icon = 'fa-shopping-bag';
          let color = 'primary';
          if (n.type === 'stock') { icon = 'fa-exclamation-triangle'; color = 'warning'; }
          if (n.type === 'customer') { icon = 'fa-user-plus'; color = 'info'; }
          if (n.type === 'system') { icon = 'fa-cog'; color = 'secondary'; }

          return `
            <a href="notifications.html" class="dropdown-item ${n.read ? 'read' : 'unread'}">
              <div class="item-icon bg-${color}-light text-${color}">
                <i class="fas ${icon}"></i>
              </div>
              <div class="item-details">
                <span class="item-title">${n.title}</span>
                <span class="item-message">${n.message}</span>
                <span class="item-time">${n.time}</span>
              </div>
            </a>
          `;
        }).join('');
      }
    }

    // 5. Logout listeners
    const logoutHandler = (e) => {
      e.preventDefault();
      createModal({
        title: 'Confirm Logout',
        contentHTML: '<p>Are you sure you want to end your current session and exit the admin panel?</p>',
        actions: [
          { id: 'cancel', label: 'Cancel', type: 'secondary' },
          { 
            id: 'logout', 
            label: 'Logout', 
            type: 'danger', 
            callback: () => {
              window.location.href = 'login.html';
            } 
          }
        ]
      });
    };

    const sidebarLogout = document.getElementById('sidebar-logout-btn');
    const navbarLogout = document.getElementById('navbar-logout-btn');
    if (sidebarLogout) sidebarLogout.addEventListener('click', logoutHandler);
    if (navbarLogout) navbarLogout.addEventListener('click', logoutHandler);

    // 6. Global Search Input Trigger
    const globalSearch = document.getElementById('global-search-input');
    if (globalSearch) {
      globalSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && globalSearch.value.trim() !== '') {
          const val = encodeURIComponent(globalSearch.value.trim());
          const currentLoc = window.location.pathname.split('/').pop();
          
          // Smart redirection based on query
          if (currentLoc === 'books.html' || currentLoc === 'orders.html' || currentLoc === 'customers.html') {
            // Already on a search-friendly page, let local search handler pick it up
            const searchBox = document.querySelector('.table-search-input') || document.querySelector('.search-input');
            if (searchBox) {
              searchBox.value = globalSearch.value;
              searchBox.dispatchEvent(new Event('input', { bubbles: true }));
            }
          } else {
            // Redirect to appropriate page with query parameter
            window.location.href = `books.html?search=${val}`;
          }
        }
      });
    }
  };

})();
