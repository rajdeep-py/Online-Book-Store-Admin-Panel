/**
 * analytics.js - Sales Analytics Page Controller
 * Aggregates database numbers, draws main visual reports charts,
 * and lists performance dashboards.
 */

(function () {
  document.addEventListener('DOMContentLoaded', () => {
    // Only run if on analytics.html
    const filename = window.location.pathname.split('/').pop();
    if (filename !== 'analytics.html') return;

    showLoader();
    setTimeout(() => {
      initializeAnalyticsView();
      hideLoader();
    }, 450);
  });

  function initializeAnalyticsView() {
    if (!window.BookstoreAPI) return;

    // 1. Gather aggregates
    const analytics = BookstoreAPI.getAnalytics();
    const orders = BookstoreAPI.getOrders();
    const books = BookstoreAPI.getBooks();

    // 2. Populate Metrics boxes
    const revenueVal = document.getElementById('analytic-revenue');
    if (revenueVal) revenueVal.textContent = formatCurrency(analytics.totalRevenue);

    const totalOrders = orders.filter(o => o.status !== 'Cancelled');
    const orderAvg = document.getElementById('analytic-average-order');
    if (orderAvg) {
      const avg = totalOrders.length > 0 ? (analytics.totalRevenue / totalOrders.length) : 0;
      orderAvg.textContent = formatCurrency(avg);
    }

    const deliveredVal = document.getElementById('analytic-delivered-count');
    if (deliveredVal) {
      deliveredVal.textContent = analytics.orderStatusDistribution.Delivered;
    }

    const activeBooksVal = document.getElementById('analytic-active-books');
    if (activeBooksVal) {
      activeBooksVal.textContent = books.filter(b => b.status === 'Active').length;
    }

    // 3. Render Sales Category Progression bars
    const categoryBarContainer = document.getElementById('analytics-categories-bar-list');
    if (categoryBarContainer && analytics.categoriesChartData.length > 0) {
      // Find max sales for percentage widths
      const maxSales = Math.max(...analytics.categoriesChartData.map(c => c.sales));
      categoryBarContainer.innerHTML = analytics.categoriesChartData
        .sort((a, b) => b.sales - a.sales)
        .map(c => {
          const percentage = maxSales > 0 ? Math.round((c.sales / maxSales) * 100) : 0;
          return `
            <div class="category-progress-item fade-in">
              <div class="category-progress-header">
                <span class="category-progress-name">${c.category}</span>
                <span class="category-progress-val">${formatCurrency(c.sales)}</span>
              </div>
              <div class="category-progress-bar-bg">
                <div class="category-progress-bar-fill" style="width: ${percentage}%"></div>
              </div>
            </div>
          `;
        }).join('');
    }

    // 4. Render Bestsellers
    const bestSellersList = document.getElementById('analytics-bestsellers-list');
    if (bestSellersList) {
      if (analytics.bestSellers.length === 0) {
        bestSellersList.innerHTML = '<div class="text-center text-muted p-3">No sales registers found</div>';
      } else {
        bestSellersList.innerHTML = analytics.bestSellers.map((b, idx) => `
          <tr class="fade-in">
            <td><strong>#${idx + 1}</strong></td>
            <td>
              <div class="table-book-cell">
                <img src="${b.cover}" alt="Book Cover" class="table-book-img">
                <div class="table-book-details">
                  <span class="table-user-name">${b.title}</span>
                  <div class="table-user-email">by ${b.author}</div>
                </div>
              </div>
            </td>
            <td>${b.category}</td>
            <td>${formatCurrency(b.price)}</td>
            <td><strong>${b.salesCount} sold</strong></td>
            <td><strong>${formatCurrency(b.totalRevenue)}</strong></td>
          </tr>
        `).join('');
      }
    }

    // 5. Draw visual charts (Line, Bar, Doughnut)
    if (window.Charts) {
      Charts.renderRevenueChart('analytics-sales-line-chart', analytics.salesByMonth);
      Charts.renderCategorySalesChart('analytics-categories-bar-chart', analytics.categoriesChartData);
      Charts.renderOrderStatusChart('analytics-statuses-pie-chart', analytics.orderStatusDistribution);
    }

    // Bind Export buttons UI
    const pdfExport = document.getElementById('export-pdf-analytics-btn');
    if (pdfExport) {
      pdfExport.addEventListener('click', () => {
        showToast('Exporting sales analytics overview report... (PDF)', 'success');
      });
    }
  }

})();
