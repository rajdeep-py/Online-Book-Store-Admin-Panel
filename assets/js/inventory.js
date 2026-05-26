/**
 * inventory.js - Stock Inventory Management Controller
 * Filters stock status, warns low stocks, and manages restock counts
 * using dynamic UI prompt forms.
 */

(function () {
  let filteredBooks = [];
  let currentStockFilter = 'all';

  document.addEventListener('DOMContentLoaded', () => {
    const filename = window.location.pathname.split('/').pop();
    if (filename !== 'inventory.html') return;

    initializeInventoryListView();
  });

  async function initializeInventoryListView() {
    if (!window.BookstoreAPI) return;

    const books = await BookstoreAPI.getBooks();
    filteredBooks = [...books];

    const searchInput = document.getElementById('inventory-search');
    const prevBtn = document.getElementById('pag-prev');
    const nextBtn = document.getElementById('pag-next');

    // Renders initial list
    renderInventoryTable();
    await updateHeaderSummaries();

    // Bind Search input
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        applyFiltersAndSearch(searchInput.value, currentStockFilter);
      });
    }

    // Bind Horizontal tabs filters (All, Low Stock, Out of Stock, Healthy)
    const tabs = document.querySelectorAll('.inventory-filter-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentStockFilter = tab.dataset.filter;
        applyFiltersAndSearch(searchInput ? searchInput.value : '', currentStockFilter);
      });
    });

    // Report exporting trigger
    const exportBtn = document.getElementById('export-inventory-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        showToast('Exporting current stock spreadsheet... (XLS)', 'success');
      });
    }
  }

  async function updateHeaderSummaries() {
    const books = await BookstoreAPI.getBooks();
    const lowStockThreshold = BookstoreAPI.getSettings().lowStockThreshold;

    const totalCount = books.length;
    const outOfStockCount = books.filter(b => b.stock === 0).length;
    const lowStockCount = books.filter(b => b.stock > 0 && b.stock <= lowStockThreshold).length;
    const healthyCount = totalCount - outOfStockCount - lowStockCount;

    // Populate UI summary panels
    const totalBox = document.getElementById('summary-total-books');
    if (totalBox) totalBox.textContent = totalCount;

    const outBox = document.getElementById('summary-out-stock');
    if (outBox) outBox.textContent = outOfStockCount;

    const lowBox = document.getElementById('summary-low-stock');
    if (lowBox) lowBox.textContent = lowStockCount;

    const healthyBox = document.getElementById('summary-healthy-stock');
    if (healthyBox) healthyBox.textContent = healthyCount;
  }

  async function applyFiltersAndSearch(query, filter) {
    const books = await BookstoreAPI.getBooks(query);
    const lowStockThreshold = BookstoreAPI.getSettings().lowStockThreshold;
    const cleanQuery = query.toLowerCase().trim();

    filteredBooks = books.filter(b => {
      const matchesSearch = b.title.toLowerCase().includes(cleanQuery) || 
                            b.author.toLowerCase().includes(cleanQuery) || 
                            b.id.toLowerCase().includes(cleanQuery);
      
      let matchesFilter = true;
      if (filter === 'low') matchesFilter = b.stock > 0 && b.stock <= lowStockThreshold;
      else if (filter === 'out') matchesFilter = b.stock === 0;
      else if (filter === 'healthy') matchesFilter = b.stock > lowStockThreshold;

      return matchesSearch && matchesFilter;
    });

    renderInventoryTable();
  }

  function renderInventoryTable() {
    const tableBody = document.getElementById('inventory-table-body');
    if (!tableBody) return;

    const totalItems = filteredBooks.length;

    if (totalItems === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">
            <div class="empty-state p-4">
              <i class="fas fa-boxes empty-state-icon"></i>
              <h3>No Inventory Entries</h3>
              <p>No books matched your search/filter settings.</p>
            </div>
          </td>
        </tr>
      `;
    } else {
      const lowStockThreshold = BookstoreAPI.getSettings().lowStockThreshold;

      tableBody.innerHTML = filteredBooks.map(b => {
        let badgeType = 'badge-active';
        let stockLabel = b.stock;
        
        if (b.stock === 0) {
          badgeType = 'badge-cancelled';
          stockLabel = 'OUT OF STOCK';
        } else if (b.stock <= lowStockThreshold) {
          badgeType = 'badge-pending';
          stockLabel = `${b.stock} (LOW)`;
        }

        return `
          <tr class="fade-in">
            <td><strong>#${b.id}</strong></td>
            <td>
              <div class="table-book-cell">
                <img src="${b.cover}" alt="Cover" class="table-book-img">
                <div class="table-book-details">
                  <span class="table-user-name">${b.title}</span>
                  <div class="table-user-email">by ${b.author}</div>
                </div>
              </div>
            </td>
            <td>${b.category}</td>
            <td><strong>${formatCurrency(b.price)}</strong></td>
            <td><span class="badge ${badgeType}">${stockLabel}</span></td>
            <td>${b.isbn || 'N/A'}</td>
            <td>
              <div class="table-actions">
                <button class="btn btn-secondary btn-sm restock-quick-btn" data-id="${b.id}">
                  <i class="fas fa-plus"></i> Restock
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      // Bind restock quick buttons
      tableBody.querySelectorAll('.restock-quick-btn').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const id = btn.dataset.id;
          triggerRestockModal(id);
        };
      });
    }
  }

  async function triggerRestockModal(id) {
    if (!window.BookstoreAPI) return;
    const book = await BookstoreAPI.getBookById(id);
    if (!book) return;

    const modalHTML = `
      <div class="form-group">
        <p>Current stock levels: <strong>${book.stock}</strong> units.</p>
        <label class="form-label" for="restock-qty-input">Enter units to ADD to stock:</label>
        <input type="number" id="restock-qty-input" class="form-control" min="1" max="500" value="20" required>
      </div>
    `;

    createModal({
      title: `Restock "${book.title}"`,
      contentHTML: modalHTML,
      actions: [
        { id: 'close', label: 'Cancel', type: 'secondary' },
        {
          id: 'submit',
          label: 'Add Stock',
          type: 'success',
          callback: async (close) => {
            const qtyInput = document.getElementById('restock-qty-input');
            const qtyToAdd = parseInt(qtyInput.value);

            if (isNaN(qtyToAdd) || qtyToAdd < 1) {
              showToast('Please specify a positive integer value.', 'warning');
              return;
            }

            const newStock = book.stock + qtyToAdd;
            const result = await BookstoreAPI.updateBook(id, { stock: newStock });
            if (result) {
              BookstoreAPI.addNotification('stock', 'Inventory Restocked', `Book "${book.title}" stock increased by +${qtyToAdd} units.`);
              showToast(`Successfully added +${qtyToAdd} units to "${book.title}"!`, 'success');
              
              close();
              // Re-render
              initializeInventoryListView();
            } else {
              showToast('Failed to restock book.', 'danger');
            }
          }
        }
      ]
    });
  }

})();
