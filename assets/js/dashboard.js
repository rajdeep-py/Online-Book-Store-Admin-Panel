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
        bestSellersList.innerHTML = analytics.bestSellers.map(b => `
          <div class="list-item fade-in">
            <div class="best-seller-book">
              <img src="${b.cover}" alt="Book Cover" class="best-seller-cover">
              <div class="best-seller-details">
                <span class="best-seller-title">${b.title}</span>
                <span class="best-seller-author">by ${b.author}</span>
                <span class="best-seller-sales">${b.salesCount} sold</span>
              </div>
            </div>
            <span class="item-value">${formatCurrency(b.totalRevenue)}</span>
          </div>
        `).join('');
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
          let dotColor = 'dot-primary';
          if (n.type === 'stock') dotColor = 'dot-warning';
          if (n.type === 'customer') dotColor = 'dot-info';
          if (n.type === 'system') dotColor = 'dot-secondary';

          return `
            <div class="timeline-item ${dotColor} fade-in">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <span class="timeline-title">${n.title}</span>
                <span class="timeline-desc">${n.message}</span>
                <span class="timeline-time">${n.time}</span>
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
        recentOrdersBody.innerHTML = latestOrders.map(o => `
          <tr class="fade-in">
            <td><strong>#${o.id}</strong></td>
            <td>${o.customerName}</td>
            <td>${formatDate(o.date)}</td>
            <td><strong>${formatCurrency(o.amount)}</strong></td>
            <td><span class="badge badge-${o.status.toLowerCase()}">${o.status}</span></td>
            <td>
              <div class="table-actions">
                <a href="order-details.html?id=${o.id}" class="action-btn" title="View Details">
                  <i class="fas fa-eye"></i>
                </a>
              </div>
            </td>
          </tr>
        `).join('');
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
