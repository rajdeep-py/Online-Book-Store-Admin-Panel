/**
 * charts.js - Chart.js Integration and Styling Wrapper
 * Configures global typography, scales, color charts palettes,
 * and handles rendering routines.
 */

(function () {
  window.Charts = {
    // 1. Line/Area Chart: Monthly Revenue
    renderRevenueChart: function (canvasId, salesByMonth) {
      const ctx = document.getElementById(canvasId);
      if (!ctx) return null;

      // Extract labels and revenues
      const labels = salesByMonth.map(s => s.month);
      const data = salesByMonth.map(s => s.revenue);

      // Create primary color gradient
      const primaryGradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
      primaryGradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)');
      primaryGradient.addColorStop(1, 'rgba(99, 102, 241, 0.01)');

      return new Chart(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: 'Monthly Revenue ($)',
            data: data,
            borderColor: '#6366f1',
            borderWidth: 3,
            backgroundColor: primaryGradient,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#6366f1',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              padding: 12,
              fontFamily: "'Outfit', sans-serif",
              backgroundColor: '#1e293b',
              titleColor: '#ffffff',
              bodyColor: '#e2e8f0',
              borderColor: '#334155',
              borderWidth: 1
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                font: { family: "'Outfit', sans-serif", size: 12, weight: '500' },
                color: '#64748b'
              }
            },
            y: {
              grid: { color: 'rgba(100, 116, 139, 0.08)' },
              ticks: {
                font: { family: "'Outfit', sans-serif", size: 12, weight: '500' },
                color: '#64748b',
                callback: function (val) { return '$' + val; }
              }
            }
          }
        }
      });
    },

    // 2. Doughnut Chart: Order Statuses Distribution
    renderOrderStatusChart: function (canvasId, distribution) {
      const ctx = document.getElementById(canvasId);
      if (!ctx) return null;

      const labels = Object.keys(distribution);
      const data = Object.values(distribution);

      // Clean, elegant HSL matching colors
      const colors = [
        '#f59e0b', // Pending (Amber)
        '#06b6d4', // Confirmed (Cyan)
        '#6366f1', // Dispatched (Indigo)
        '#10b981', // Delivered (Emerald)
        '#ef4444'  // Cancelled (Rose)
      ];

      return new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: colors,
            borderWidth: 2,
            borderColor: '#ffffff',
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: { family: "'Outfit', sans-serif", size: 12, weight: '500' },
                color: '#64748b',
                padding: 15
              }
            },
            tooltip: {
              padding: 12,
              fontFamily: "'Outfit', sans-serif",
              backgroundColor: '#1e293b'
            }
          },
          cutout: '65%'
        }
      });
    },

    // 3. Bar Chart: Sales Category Breakdown
    renderCategorySalesChart: function (canvasId, categorySales) {
      const ctx = document.getElementById(canvasId);
      if (!ctx) return null;

      const labels = categorySales.map(c => c.category);
      const data = categorySales.map(c => c.sales);

      return new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Sales Revenue ($)',
            data: data,
            backgroundColor: 'rgba(99, 102, 241, 0.85)',
            hoverBackgroundColor: '#4f46e5',
            borderRadius: 6,
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              padding: 12,
              fontFamily: "'Outfit', sans-serif",
              backgroundColor: '#1e293b'
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                font: { family: "'Outfit', sans-serif", size: 11, weight: '500' },
                color: '#64748b'
              }
            },
            y: {
              grid: { color: 'rgba(100, 116, 139, 0.08)' },
              ticks: {
                font: { family: "'Outfit', sans-serif", size: 11, weight: '500' },
                color: '#64748b',
                callback: function (val) { return '$' + val; }
              }
            }
          }
        }
      });
    }
  };
})();
