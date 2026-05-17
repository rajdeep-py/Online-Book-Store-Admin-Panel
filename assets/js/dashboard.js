/**
 * dashboard.js - Homepage Dashboard Controller
 * Calculates total metrics, alerts low inventories, lists recent tables,
 * and calls Chart.js integrations.
 */

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    // Only run if on dashboard home index.html
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    if (currentPage !== 'index.html' && currentPage !== '') return;

    showLoader();
    setTimeout(() => {
      initializeDashboardView();
      hideLoader();
    }, 400);
  });

  function initializeDashboardView() {
    if (!window.BookstoreAPI) return;

    // 1. Gather Metrics data
    const books = BookstoreAPI.getBooks();
    const orders = BookstoreAPI.getOrders();
    const customers = BookstoreAPI.getCustomers();
    const analytics = BookstoreAPI.getAnalytics();

    // 2. Populate Metrics Cards
    const cardRevenue = document.getElementById('metric-revenue');
    if (cardRevenue) cardRevenue.textContent = formatCurrency(analytics.totalRevenue);

    const cardOrders = document.getElementById('metric-orders');
    if (cardOrders) cardOrders.textContent = orders.length;

    const cardPending = document.getElementById('metric-pending');
    if (cardPending) cardPending.textContent = analytics.orderStatusDistribution.Pending;

    const cardDelivered = document.getElementById('metric-delivered');
    if (cardDelivered) cardDelivered.textContent = analytics.orderStatusDistribution.Delivered;

    const cardCustomers = document.getElementById('metric-customers');
    if (cardCustomers) cardCustomers.textContent = customers.length;

    const cardBooks = document.getElementById('metric-books');
    if (cardBooks) cardBooks.textContent = books.length;

    const cardLowStock = document.getElementById('metric-low-stock');
    if (cardLowStock) cardLowStock.textContent = analytics.lowStockCount;

    // 3. Render Inventory Alerts
    const inventoryAlertContainer = document.getElementById('dashboard-stock-alerts');
    if (inventoryAlertContainer) {
      const lowStockThreshold = BookstoreAPI.getSettings().lowStockThreshold;
      const lowStockBooks = books.filter(b => b.stock > 0 && b.stock <= lowStockThreshold).slice(0, 3);
      const outOfStockBooks = books.filter(b => b.stock === 0).slice(0, 3);

      let alertsHTML = '';
      outOfStockBooks.forEach(b => {
        alertsHTML += `
          <div class="stock-alert-item out-of-stock fade-in">
            <div class="stock-alert-info">
              <i class="fas fa-times-circle text-danger"></i>
              <span>"${b.title}" is completely out of stock!</span>
            </div>
            <a href="edit-book.html?id=${b.id}" class="btn btn-danger btn-sm">Restock</a>
          </div>
        `;
      });

      lowStockBooks.forEach(b => {
        alertsHTML += `
          <div class="stock-alert-item fade-in">
            <div class="stock-alert-info">
              <i class="fas fa-exclamation-triangle text-warning"></i>
              <span>"${b.title}" is running low in stock!</span>
            </div>
            <span class="stock-alert-qty text-warning">Only ${b.stock} left</span>
          </div>
        `;
      });

      if (outOfStockBooks.length === 0 && lowStockBooks.length === 0) {
        inventoryAlertContainer.innerHTML = `
          <div class="text-center p-3 text-muted">
            <i class="fas fa-check-circle text-success mb-2" style="font-size: 2rem; display: block;"></i>
            <span>All book inventories are healthy!</span>
          </div>
        `;
      } else {
        inventoryAlertContainer.innerHTML = alertsHTML;
      }
    }

    // 4. Render Best Sellers list
    const bestSellersList = document.getElementById('dashboard-best-sellers');
    if (bestSellersList) {
      if (analytics.bestSellers.length === 0) {
        bestSellersList.innerHTML = '<div class="text-center text-muted p-3">No sales logs found</div>';
      } else {
        bestSellersList.innerHTML = analytics.bestSellers.map((b, idx) => {
          const rank = idx + 1;
          let rankClass = 'rank-other';
          if (rank === 1) rankClass = 'rank-1';
          else if (rank === 2) rankClass = 'rank-2';
          else if (rank === 3) rankClass = 'rank-3';

          return `
            <div class="top-seller-card fade-in">
              <div class="top-seller-left">
                <div class="rank-badge ${rankClass}">${rank}</div>
                <img src="${b.cover}" alt="Book Cover" class="best-seller-cover">
                <div class="best-seller-details">
                  <span class="best-seller-title" title="${b.title}">${b.title}</span>
                  <span class="best-seller-author">by ${b.author}</span>
                  <span class="best-seller-sales-badge"><i class="fas fa-fire mr-1"></i>${b.salesCount} sold</span>
                </div>
              </div>
              <div class="top-seller-right">
                <span class="top-seller-revenue">${formatCurrency(b.totalRevenue)}</span>
                <span class="text-muted" style="font-size: 0.7rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.02em;">Revenue</span>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // 5. Render Recent Activities timeline
    const activityTimeline = document.getElementById('dashboard-activities');
    if (activityTimeline) {
      const notifs = BookstoreAPI.getNotifications().slice(0, 5); // top 5
      if (notifs.length === 0) {
        activityTimeline.innerHTML = '<div class="text-center text-muted p-3">No system logs found</div>';
      } else {
        activityTimeline.innerHTML = notifs.map(n => {
          let iconHTML = '<i class="fas fa-cog"></i>';
          let badgeClass = 'bg-primary-light text-primary';
          if (n.type === 'order') {
            iconHTML = '<i class="fas fa-shopping-cart"></i>';
            badgeClass = 'bg-success-light text-success';
          } else if (n.type === 'stock') {
            iconHTML = '<i class="fas fa-exclamation-triangle"></i>';
            badgeClass = 'bg-warning-light text-warning';
          } else if (n.type === 'customer') {
            iconHTML = '<i class="fas fa-user-plus"></i>';
            badgeClass = 'bg-info-light text-info';
          }

          return `
            <div class="timeline-item fade-in">
              <div class="timeline-icon-box ${badgeClass}">
                ${iconHTML}
              </div>
              <div class="timeline-content">
                <span class="timeline-title">${n.title}</span>
                <span class="timeline-desc">${n.message}</span>
                <span class="timeline-time"><i class="far fa-clock mr-1"></i>${n.time}</span>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // 6. Render Recent Orders table (latest 5 orders)
    const recentOrdersBody = document.getElementById('recent-orders-table-body');
    if (recentOrdersBody) {
      const latestOrders = orders.slice(0, 5);
      if (latestOrders.length === 0) {
        recentOrdersBody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No orders found</td></tr>';
      } else {
        recentOrdersBody.innerHTML = latestOrders.map(o => {
          const nameParts = o.customerName.split(' ');
          const initials = nameParts.map(p => p[0]).join('').substring(0, 2).toUpperCase();
          const bgColors = ['rgba(79, 70, 229, 0.1)', 'rgba(16, 185, 129, 0.1)', 'rgba(245, 158, 11, 0.1)', 'rgba(59, 130, 246, 0.1)', 'rgba(236, 72, 153, 0.1)'];
          const textColors = ['#4f46e5', '#10b981', '#f59e0b', '#3b82f6', '#ec4899'];
          const colorIndex = o.customerName.length % bgColors.length;
          const bgColor = bgColors[colorIndex];
          const textColor = textColors[colorIndex];

          let dotColor = 'status-dot-pending';
          if (o.status.toLowerCase() === 'delivered') dotColor = 'status-dot-delivered';
          else if (o.status.toLowerCase() === 'confirmed') dotColor = 'status-dot-confirmed';
          else if (o.status.toLowerCase() === 'dispatched') dotColor = 'status-dot-dispatched';
          else if (o.status.toLowerCase() === 'cancelled') dotColor = 'status-dot-cancelled';

          return `
            <tr class="fade-in hover-row-glow">
              <td><span class="order-id-badge">#${o.id}</span></td>
              <td>
                <div class="customer-cell-modern">
                  <div class="customer-avatar-mini" style="background-color: ${bgColor}; color: ${textColor};">
                    ${initials}
                  </div>
                  <div class="d-flex flex-column" style="min-width: 0;">
                    <span class="font-weight-bold text-dark text-ellipsis" style="font-size: 0.88rem;">${o.customerName}</span>
                    <span class="text-muted" style="font-size: 0.72rem;">Customer</span>
                  </div>
                </div>
              </td>
              <td style="font-size: 0.85rem; font-weight: 500; color: var(--secondary-color);">${formatDate(o.date)}</td>
              <td><span class="text-success font-weight-bold" style="font-size: 0.88rem;">${formatCurrency(o.amount)}</span></td>
              <td>
                <span class="badge badge-${o.status.toLowerCase()} d-inline-flex align-items-center" style="gap: 6px; padding: 0.35rem 0.65rem; border-radius: 30px;">
                  <span class="status-dot ${dotColor}"></span>
                  ${o.status}
                </span>
              </td>
              <td>
                <div class="table-actions">
                  <a href="order-details.html?id=${o.id}" class="action-btn" title="View Details" style="width: 28px; height: 28px; font-size: 0.75rem;">
                    <i class="fas fa-eye"></i>
                  </a>
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // 7. Render Charts (via window.Charts initializer if available)
    if (window.Charts) {
      // Line Chart (Monthly Sales)
      Charts.renderRevenueChart('dashboard-revenue-chart', analytics.salesByMonth);
      // Doughnut Chart (Order Statuses Distribution)
      Charts.renderOrderStatusChart('dashboard-order-status-chart', analytics.orderStatusDistribution);
    }
  }

})();
