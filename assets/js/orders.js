/**
 * orders.js - Orders Management and Processing Workflow
 * Handles orders tables listings, search bounds, tab filters, and
 * administrative status transitions.
 */

(function () {
  const ITEMS_PER_PAGE = 8;
  let currentPage = 1;
  let filteredOrders = [];
  let currentActiveTab = 'all';

  document.addEventListener('DOMContentLoaded', () => {
    const filename = window.location.pathname.split('/').pop();

    if (filename === 'orders.html') {
      initializeOrdersListView();
    } else if (filename === 'order-details.html') {
      initializeOrderDetailsView();
    }
  });

  // ==========================================================================
  // ORDERS LISTINGS CONTROLLER (orders.html)
  // ==========================================================================
  function initializeOrdersListView() {
    if (!window.BookstoreAPI) return;

    const orders = BookstoreAPI.getOrders();
    filteredOrders = [...orders];

    const searchInput = document.getElementById('order-search');
    const prevBtn = document.getElementById('pag-prev');
    const nextBtn = document.getElementById('pag-next');

    // Renders initial table
    renderOrdersTable();

    // Bind Search Input
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        applyFiltersAndSearch(searchInput.value, currentActiveTab);
      });
    }

    // Bind Horizontal Filter Tabs (Pending, Confirmed, Dispatched, Delivered, Cancelled)
    const tabs = document.querySelectorAll('.order-filter-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentActiveTab = tab.dataset.status;
        applyFiltersAndSearch(searchInput ? searchInput.value : '', currentActiveTab);
      });
    });

    // Check if redirect query has a search filter
    const urlParams = new URLSearchParams(window.location.search);
    const filterQuery = urlParams.get('filter');
    if (filterQuery) {
      const matchedTab = Array.from(tabs).find(t => t.dataset.status.toLowerCase() === filterQuery.toLowerCase());
      if (matchedTab) matchedTab.click();
    }

    // Bind Pagination Buttons
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          renderOrdersTable();
        }
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
        if (currentPage < totalPages) {
          currentPage++;
          renderOrdersTable();
        }
      });
    }

    // Report exporting trigger
    const exportBtn = document.getElementById('export-orders-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        showToast('Exporting orders listing report... (PDF)', 'success');
      });
    }
  }

  function applyFiltersAndSearch(query, tabStatus) {
    const orders = BookstoreAPI.getOrders();
    const cleanQuery = query.toLowerCase().trim();

    filteredOrders = orders.filter(o => {
      const matchesSearch = o.id.toLowerCase().includes(cleanQuery) || 
                            o.customerName.toLowerCase().includes(cleanQuery) || 
                            o.customerEmail.toLowerCase().includes(cleanQuery);
      const matchesTab = tabStatus === 'all' || o.status.toLowerCase() === tabStatus.toLowerCase();
      return matchesSearch && matchesTab;
    });

    currentPage = 1; // Reset to page 1
    renderOrdersTable();
  }

  function renderOrdersTable() {
    const tableBody = document.getElementById('orders-table-body');
    if (!tableBody) return;

    const totalItems = filteredOrders.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

    if (currentPage > totalPages) currentPage = totalPages;

    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, totalItems);
    const visibleItems = filteredOrders.slice(startIdx, endIdx);

    // Update Label details
    const infoLabel = document.getElementById('pagination-info-label');
    if (infoLabel) {
      infoLabel.textContent = totalItems > 0 
        ? `Showing ${startIdx + 1} to ${endIdx} of ${totalItems} orders` 
        : 'Showing 0 of 0 orders';
    }

    // Toggle pagination button disables
    const prevBtn = document.getElementById('pag-prev');
    const nextBtn = document.getElementById('pag-next');
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;

    if (totalItems === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">
            <div class="empty-state p-4">
              <i class="fas fa-shopping-bag empty-state-icon"></i>
              <h3>No Orders Found</h3>
              <p>No transactions matched your filtering options.</p>
            </div>
          </td>
        </tr>
      `;
    } else {
      tableBody.innerHTML = visibleItems.map(o => `
        <tr class="fade-in">
          <td><strong>#${o.id}</strong></td>
          <td>
            <span class="table-user-name">${o.customerName}</span>
            <div class="table-user-email">${o.customerEmail}</div>
          </td>
          <td>${formatDate(o.date)}</td>
          <td><strong>${formatCurrency(o.amount)}</strong></td>
          <td><span class="badge badge-${o.status.toLowerCase()}">${o.status}</span></td>
          <td><i class="far fa-credit-card mr-1"></i> ${o.paymentMethod}</td>
          <td>
            <div class="table-actions">
              <a href="order-details.html?id=${o.id}" class="action-btn" title="Process Details">
                <i class="fas fa-cog"></i>
              </a>
            </div>
          </td>
        </tr>
      `).join('');
    }
  }

  // ==========================================================================
  // SINGLE ORDER DETAILS CONTROLLER (order-details.html)
  // ==========================================================================
  function initializeOrderDetailsView() {
    if (!window.BookstoreAPI) return;

    // Get order ID from parameters
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');

    if (!orderId) {
      showToast('No transaction ID found in query parameters!', 'danger');
      setTimeout(() => { window.location.href = 'orders.html'; }, 1000);
      return;
    }

    const order = BookstoreAPI.getOrderById(orderId);
    if (!order) {
      showToast('Requested transaction details not found!', 'danger');
      setTimeout(() => { window.location.href = 'orders.html'; }, 1000);
      return;
    }

    // 1. Populate Header info
    const oIdLabel = document.getElementById('details-order-id');
    if (oIdLabel) oIdLabel.textContent = order.id;

    const oDateLabel = document.getElementById('details-order-date');
    if (oDateLabel) oDateLabel.textContent = formatDate(order.date);

    const oStatusBadge = document.getElementById('details-order-status');
    if (oStatusBadge) {
      oStatusBadge.className = `badge badge-${order.status.toLowerCase()}`;
      oStatusBadge.textContent = order.status;
    }

    // 2. Populate Customer Card Info
    const c = BookstoreAPI.getCustomers().find(cust => cust.id === order.customerId);
    const cName = document.getElementById('customer-details-name');
    if (cName) cName.textContent = order.customerName;

    const cEmail = document.getElementById('customer-details-email');
    if (cEmail) cEmail.textContent = order.customerEmail;

    const cPhone = document.getElementById('customer-details-phone');
    if (cPhone) cPhone.textContent = c ? c.phone : 'N/A';

    const cLink = document.getElementById('customer-details-profile-link');
    if (cLink && c) cLink.href = `customer-details.html?id=${c.id}`;

    // Shipping summaries
    const sAddr = document.getElementById('shipping-address-text');
    if (sAddr) sAddr.textContent = order.shippingAddress;

    const sTrk = document.getElementById('shipping-tracking-text');
    if (sTrk) sTrk.textContent = order.trackingNumber || 'Not shipped yet';

    // Payment Info
    const pMethod = document.getElementById('payment-method-text');
    if (pMethod) pMethod.textContent = order.paymentMethod;

    // 3. Render Invoice Items list
    const itemsTable = document.getElementById('order-items-table-body');
    if (itemsTable) {
      itemsTable.innerHTML = order.items.map(item => `
        <tr class="fade-in">
          <td>
            <div class="table-book-cell">
              <div class="table-book-details">
                <span class="table-user-name">${item.title}</span>
                <span class="table-user-email">ID: ${item.bookId}</span>
              </div>
            </div>
          </td>
          <td>${formatCurrency(item.price)}</td>
          <td>${item.quantity}</td>
          <td class="text-right"><strong>${formatCurrency(item.price * item.quantity)}</strong></td>
        </tr>
      `).join('');
    }

    // Totals summaries
    const oSubtotal = document.getElementById('order-summary-subtotal');
    if (oSubtotal) oSubtotal.textContent = formatCurrency(order.amount);

    const oTotal = document.getElementById('order-summary-total');
    if (oTotal) oTotal.textContent = formatCurrency(order.amount);

    // 4. Render Action Workflow State Buttons
    renderWorkflowActionButtons(order);
  }

  function renderWorkflowActionButtons(order) {
    const actionContainer = document.getElementById('order-workflow-actions');
    if (!actionContainer) return;

    let buttonsHTML = '';
    const status = order.status;

    if (status === 'Pending') {
      buttonsHTML = `
        <button class="btn btn-primary" id="btn-wf-confirm"><i class="fas fa-check"></i> Confirm Order</button>
        <button class="btn btn-danger" id="btn-wf-cancel"><i class="fas fa-times"></i> Cancel Order</button>
      `;
    } else if (status === 'Confirmed') {
      buttonsHTML = `
        <button class="btn btn-primary" id="btn-wf-dispatch"><i class="fas fa-shipping-fast"></i> Ship / Dispatch Order</button>
        <button class="btn btn-danger" id="btn-wf-cancel"><i class="fas fa-times"></i> Cancel Order</button>
      `;
    } else if (status === 'Dispatched') {
      buttonsHTML = `
        <button class="btn btn-success" id="btn-wf-deliver"><i class="fas fa-box-open"></i> Mark as Delivered</button>
      `;
    } else {
      // Delivered or Cancelled
      buttonsHTML = `
        <div class="text-muted" style="font-weight:600;"><i class="fas fa-info-circle text-info"></i> No further actions required. Order process completed.</div>
      `;
    }

    actionContainer.innerHTML = buttonsHTML;

    // Bind triggers
    const confirmBtn = document.getElementById('btn-wf-confirm');
    const cancelBtn = document.getElementById('btn-wf-cancel');
    const dispatchBtn = document.getElementById('btn-wf-dispatch');
    const deliverBtn = document.getElementById('btn-wf-deliver');

    if (confirmBtn) {
      confirmBtn.onclick = () => updateStatusWorkflow(order.id, 'Confirmed');
    }
    if (cancelBtn) {
      cancelBtn.onclick = () => updateStatusWorkflow(order.id, 'Cancelled');
    }
    if (dispatchBtn) {
      dispatchBtn.onclick = () => updateStatusWorkflow(order.id, 'Dispatched');
    }
    if (deliverBtn) {
      deliverBtn.onclick = () => updateStatusWorkflow(order.id, 'Delivered');
    }
  }

  function updateStatusWorkflow(id, nextStatus) {
    if (!window.BookstoreAPI) return;

    let modalTitle = 'Update Status';
    let btnType = 'primary';
    if (nextStatus === 'Cancelled') { modalTitle = 'Cancel Transaction'; btnType = 'danger'; }
    if (nextStatus === 'Delivered') { btnType = 'success'; }

    createModal({
      title: modalTitle,
      contentHTML: `<p>Are you sure you want to transition Order <strong>#${id}</strong> status to <strong>${nextStatus}</strong>?</p>`,
      actions: [
        { id: 'close', label: 'Dismiss', type: 'secondary' },
        {
          id: 'confirm',
          label: 'Proceed',
          type: btnType,
          callback: (close) => {
            BookstoreAPI.updateOrderStatus(id, nextStatus);
            
            // Log notify
            BookstoreAPI.addNotification(
              nextStatus === 'Cancelled' ? 'system' : 'order', 
              `Order status changed`, 
              `Order #${id} was marked ${nextStatus}.`
            );

            showToast(`Order #${id} has been transitioned to ${nextStatus}!`, nextStatus === 'Cancelled' ? 'warning' : 'success');
            close();
            initializeOrderDetailsView(); // Re-render single view
          }
        }
      ]
    });
  }

})();
