/**
 * notifications.js - Activity Logs and Notifications Manager
 * Lists system notifications, filters read/unread items, and coordinates
 * mark all as read triggers.
 */

(function () {
  let filteredNotifs = [];
  let currentNotifFilter = 'all';

  document.addEventListener('DOMContentLoaded', () => {
    const filename = window.location.pathname.split('/').pop();
    if (filename !== 'notifications.html') return;

    initializeNotificationsView();
  });

  function initializeNotificationsView() {
    if (!window.BookstoreAPI) return;

    const notifs = BookstoreAPI.getNotifications();
    filteredNotifs = [...notifs];

    // Render initial page
    renderNotificationsList();
    updateUnreadHeaderCount();

    // Bind Filter Tabs (All, Unread)
    const tabs = document.querySelectorAll('.notif-filter-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentNotifFilter = tab.dataset.filter;
        applyFilters(currentNotifFilter);
      });
    });

    // Bind Mark All Read button
    const markReadBtn = document.getElementById('mark-all-read-btn');
    if (markReadBtn) {
      markReadBtn.addEventListener('click', () => {
        const list = BookstoreAPI.getNotifications();
        let unreadFound = false;

        list.forEach(n => {
          if (!n.read) {
            BookstoreAPI.markNotificationRead(n.id);
            unreadFound = true;
          }
        });

        if (unreadFound) {
          showToast('All notifications marked as read.', 'success');
          // Re-render
          initializeNotificationsView();
          
          // Re-trigger navbar badge updates
          if (window.initComponentEvents) {
            window.initComponentEvents();
          }
          // Update sidebar badge
          const sidebarBadge = document.getElementById('sidebar-notif-count');
          if (sidebarBadge) {
            sidebarBadge.style.display = 'none';
          }
          // Update navbar badge
          const navBadge = document.querySelector('.nav-badge');
          if (navBadge) {
            navBadge.remove();
          }
        } else {
          showToast('No unread notifications.', 'info');
        }
      });
    }
  }

  function updateUnreadHeaderCount() {
    const count = BookstoreAPI.getNotifications().filter(n => !n.read).length;
    const headerCount = document.getElementById('unread-notif-header-count');
    if (headerCount) {
      headerCount.textContent = count > 0 ? `(${count} Unread)` : '';
    }
  }

  function applyFilters(filter) {
    const notifs = BookstoreAPI.getNotifications();
    
    if (filter === 'unread') {
      filteredNotifs = notifs.filter(n => !n.read);
    } else {
      filteredNotifs = [...notifs];
    }

    renderNotificationsList();
  }

  function renderNotificationsList() {
    const container = document.getElementById('notifications-list-container');
    if (!container) return;

    if (filteredNotifs.length === 0) {
      container.innerHTML = `
        <div class="empty-state p-4">
          <i class="fas fa-bell empty-state-icon"></i>
          <h3>No Notifications Found</h3>
          <p>Your notifications inbox is completely empty.</p>
        </div>
      `;
    } else {
      container.innerHTML = filteredNotifs.map(n => {
        let icon = 'fa-shopping-bag';
        let color = 'primary';
        if (n.type === 'stock') { icon = 'fa-exclamation-triangle'; color = 'warning'; }
        if (n.type === 'customer') { icon = 'fa-user-plus'; color = 'info'; }
        if (n.type === 'system') { icon = 'fa-cog'; color = 'secondary'; }

        return `
          <div class="list-item fade-in align-items-center p-3 ${n.read ? 'read' : 'unread'}" 
               style="border: 1px solid var(--border-color); border-radius: var(--border-radius-sm); margin-bottom: 0.75rem; background-color: ${n.read ? 'var(--light-color)' : 'rgba(99, 102, 241, 0.02)'};"
               id="notif-item-${n.id}">
            <div class="item-left align-items-center">
              <div class="item-icon bg-${color}-light text-${color}" style="width: 44px; height: 44px; border-radius: 8px; display:flex; justify-content:center; align-items:center; font-size: 1.1rem;">
                <i class="fas ${icon}"></i>
              </div>
              <div class="item-title-desc">
                <span class="item-primary" style="font-size: 0.95rem;">${n.title}</span>
                <span class="item-secondary" style="font-size: 0.82rem; margin-top: 0.15rem;">${n.message}</span>
              </div>
            </div>
            <div class="item-right align-items-end">
              <span class="item-meta mb-2">${n.time}</span>
              ${!n.read ? `
                <button class="btn btn-secondary btn-sm mark-single-read-btn" data-id="${n.id}">
                  Mark as Read
                </button>
              ` : '<span class="text-muted" style="font-size:0.75rem;"><i class="fas fa-check-double text-success"></i> Read</span>'}
            </div>
          </div>
        `;
      }).join('');

      // Bind single read marks
      container.querySelectorAll('.mark-single-read-btn').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const id = btn.dataset.id;
          BookstoreAPI.markNotificationRead(id);
          showToast('Notification marked as read.', 'success');
          
          // Re-render
          initializeNotificationsView();
          
          // Trigger navbar badge updates
          if (window.initComponentEvents) {
            window.initComponentEvents();
          }
        };
      });
    }
  }

})();
