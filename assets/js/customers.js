/**
 * customers.js - Customers Management and Profile Details
 * Manages the Customer table, searches, filters, page numbering,
 * and single customer profile renderings.
 */

(function () {
  const ITEMS_PER_PAGE = 8;
  let currentPage = 1;
  let filteredCustomers = [];

  document.addEventListener('DOMContentLoaded', () => {
    const filename = window.location.pathname.split('/').pop();

    if (filename === 'customers.html') {
      initializeCustomersListView();
    } else if (filename === 'customer-details.html') {
      initializeCustomerDetailsView();
    }
  });

  // ==========================================================================
  // CUSTOMER LISTINGS PAGE CONTROLLERS (customers.html)
  // ==========================================================================
  async function initializeCustomersListView() {
    if (!window.BookstoreAPI) return;

    const customers = await BookstoreAPI.getCustomers();
    filteredCustomers = [...customers];

    const searchInput = document.getElementById('customer-search');
    const filterSelect = document.getElementById('customer-filter-status');
    const prevBtn = document.getElementById('pag-prev');
    const nextBtn = document.getElementById('pag-next');

    // Render initial page
    renderCustomersTable();

    // Bind Search Input
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        applyFiltersAndSearch(searchInput.value, filterSelect ? filterSelect.value : 'all');
      });
    }

    // Bind Status Selector Filter
    if (filterSelect) {
      filterSelect.addEventListener('change', () => {
        applyFiltersAndSearch(searchInput ? searchInput.value : '', filterSelect.value);
      });
    }

    // Bind Paginations
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          renderCustomersTable();
        }
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
        if (currentPage < totalPages) {
          currentPage++;
          renderCustomersTable();
        }
      });
    }

    // Export report trigger
    const exportBtn = document.getElementById('export-customers-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        showToast('Exporting customers roster report... (CSV)', 'success');
      });
    }
  }

  async function applyFiltersAndSearch(query, status) {
    const customers = await BookstoreAPI.getCustomers();
    const cleanQuery = query.toLowerCase().trim();

    filteredCustomers = customers.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(cleanQuery) || c.email.toLowerCase().includes(cleanQuery);
      const matchesStatus = status === 'all' || c.status.toLowerCase() === status.toLowerCase();
      return matchesSearch && matchesStatus;
    });

    currentPage = 1; // Reset to page 1
    renderCustomersTable();
  }

  function renderCustomersTable() {
    const tableBody = document.getElementById('customers-table-body');
    if (!tableBody) return;

    const totalItems = filteredCustomers.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

    // Boundary check
    if (currentPage > totalPages) currentPage = totalPages;

    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, totalItems);
    const visibleItems = filteredCustomers.slice(startIdx, endIdx);

    // Update Pagination Label Count
    const infoLabel = document.getElementById('pagination-info-label');
    if (infoLabel) {
      infoLabel.textContent = totalItems > 0 
        ? `Showing ${startIdx + 1} to ${endIdx} of ${totalItems} customers` 
        : 'Showing 0 of 0 customers';
    }

    // Update buttons status
    const prevBtn = document.getElementById('pag-prev');
    const nextBtn = document.getElementById('pag-next');
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;

    // Render table rows
    if (totalItems === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">
            <div class="empty-state p-4">
              <i class="fas fa-users empty-state-icon"></i>
              <h3>No Customers Found</h3>
              <p>We couldn't find any customers matching your search query or filters.</p>
            </div>
          </td>
        </tr>
      `;
    } else {
      tableBody.innerHTML = visibleItems.map(c => `
        <tr class="fade-in">
          <td><strong>#${c.id}</strong></td>
          <td>
            <div class="table-user-cell">
              <img src="${c.avatar}" alt="Avatar" class="table-user-img">
              <div class="table-user-details">
                <span class="table-user-name">${c.name}</span>
                <div class="table-user-email">${c.email}</div>
              </div>
            </div>
          </td>
          <td>${c.phone || 'N/A'}</td>
          <td><strong>${c.ordersCount}</strong></td>
          <td><strong>${formatCurrency(c.totalSpent)}</strong></td>
          <td><span class="badge badge-${c.status.toLowerCase()}">${c.status}</span></td>
          <td>
            <div class="table-actions">
              <a href="customer-details.html?id=${c.id}" class="action-btn" title="View Profile Details">
                <i class="fas fa-eye"></i>
              </a>
              <button class="action-btn btn-delete toggle-suspend-btn" data-id="${c.id}" title="${c.status === 'Active' ? 'Suspend' : 'Activate'} Customer">
                <i class="fas ${c.status === 'Active' ? 'fa-user-slash' : 'fa-user-check'}"></i>
              </button>
            </div>
          </td>
        </tr>
      `).join('');

      // Add listeners for suspend toggles
      tableBody.querySelectorAll('.toggle-suspend-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.dataset.id;
          toggleCustomerStatus(id);
        });
      });
    }
  }

  async function toggleCustomerStatus(id) {
    if (!window.BookstoreAPI) return;
    const customer = await BookstoreAPI.getCustomerById(id);
    if (!customer) return;

    const newStatus = customer.status === 'Active' ? 'Suspended' : 'Active';
    
    createModal({
      title: `${newStatus === 'Active' ? 'Reactivate' : 'Suspend'} Customer`,
      contentHTML: `<p>Are you sure you want to change customer <strong>${customer.name}</strong>'s status to <strong>${newStatus}</strong>?</p>`,
      actions: [
        { id: 'cancel', label: 'Cancel', type: 'secondary' },
        { 
          id: 'confirm', 
          label: 'Confirm', 
          type: newStatus === 'Active' ? 'primary' : 'danger',
          callback: (close) => {
            BookstoreAPI.updateCustomer(id, { status: newStatus });
            BookstoreAPI.addNotification('customer', 'Customer Status Altered', `Customer ${customer.name} was marked ${newStatus}.`);
            showToast(`Customer ${customer.name} has been ${newStatus === 'Active' ? 'activated' : 'suspended'}.`, 'info');
            close();
            // Re-render
            const filename = window.location.pathname.split('/').pop();
            if (filename === 'customers.html') {
              applyFiltersAndSearch(
                document.getElementById('customer-search')?.value || '', 
                document.getElementById('customer-filter-status')?.value || 'all'
              );
            } else {
              initializeCustomerDetailsView();
            }
          }
        }
      ]
    });
  }

  // ==========================================================================
  // CUSTOMER PROFILE VIEW CONTROLLERS (customer-details.html)
  // ==========================================================================
  async function initializeCustomerDetailsView() {
    if (!window.BookstoreAPI) return;

    // Get customer ID from url query
    const urlParams = new URLSearchParams(window.location.search);
    const custId = urlParams.get('id');

    if (!custId) {
      showToast('No customer ID found in query parameters!', 'danger');
      setTimeout(() => { window.location.href = 'customers.html'; }, 1000);
      return;
    }

    const customer = await BookstoreAPI.getCustomerById(custId);
    if (!customer) {
      showToast('Requested customer was not found in systems!', 'danger');
      setTimeout(() => { window.location.href = 'customers.html'; }, 1000);
      return;
    }

    // 1. Populate Profile Information
    const cAvatar = document.getElementById('details-avatar');
    if (cAvatar) cAvatar.src = customer.avatar;

    const cName = document.getElementById('details-name');
    if (cName) cName.textContent = customer.name;

    const cEmail = document.getElementById('details-email');
    if (cEmail) cEmail.textContent = customer.email;

    const cPhone = document.getElementById('details-phone');
    if (cPhone) cPhone.textContent = customer.phone || 'N/A';

    const cAddress = document.getElementById('details-address');
    if (cAddress) cAddress.textContent = customer.address || 'N/A';

    const cDate = document.getElementById('details-join-date');
    if (cDate) cDate.textContent = formatDate(customer.joinDate);

    const cStatus = document.getElementById('details-status-badge');
    if (cStatus) {
      cStatus.className = `badge badge-${customer.status.toLowerCase()}`;
      cStatus.textContent = customer.status;
    }

    // Quick metric tags
    const custOrders = (await BookstoreAPI.getOrders()).filter(o => o.customerId === customer.id);
    const totalSpent = custOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
    
    const cSpent = document.getElementById('details-spent');
    if (cSpent) cSpent.textContent = formatCurrency(totalSpent);

    const cCount = document.getElementById('details-orders-count');
    if (cCount) cCount.textContent = custOrders.length;

    // 2. Fetch Customer historical orders
    const ordersBody = document.getElementById('customer-orders-table-body');
    if (ordersBody) {
      if (custOrders.length === 0) {
        ordersBody.innerHTML = '<tr><td colspan="5" class="text-center text-muted p-4">No order histories found for this customer</td></tr>';
      } else {
        ordersBody.innerHTML = custOrders.map(o => `
          <tr class="fade-in">
            <td><strong>#${o.id}</strong></td>
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

    // 3. Bind Suspend button details
    const actionBtn = document.getElementById('customer-details-action-btn');
    if (actionBtn) {
      actionBtn.innerHTML = customer.status === 'Active' 
        ? '<i class="fas fa-user-slash"></i> Suspend Customer' 
        : '<i class="fas fa-user-check"></i> Activate Customer';
      actionBtn.className = customer.status === 'Active' ? 'btn btn-danger' : 'btn btn-success';

      actionBtn.onclick = () => {
        toggleCustomerStatus(customer.id);
      };
    }
  }

})();
