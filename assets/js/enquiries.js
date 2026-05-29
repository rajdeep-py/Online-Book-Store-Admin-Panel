/**
 * enquiries.js - Website Enquiries Management
 * Manages the Enquiries table, searches, filters, and status toggling.
 */

(function () {
  const ITEMS_PER_PAGE = 8;
  let currentPage = 1;
  let filteredEnquiries = [];

  document.addEventListener('DOMContentLoaded', () => {
    const filename = window.location.pathname.split('/').pop();
    if (filename === 'enquiries.html') {
      initializeEnquiriesListView();
    }
  });

  async function initializeEnquiriesListView() {
    if (!window.BookstoreAPI) return;

    const enquiries = await BookstoreAPI.getEnquiries();
    filteredEnquiries = [...enquiries];

    const searchInput = document.getElementById('enquiry-search');
    const filterSelect = document.getElementById('enquiry-filter-status');
    const prevBtn = document.getElementById('pag-prev');
    const nextBtn = document.getElementById('pag-next');
    const refreshBtn = document.getElementById('refresh-enquiries-btn');

    // Render initial page
    renderEnquiriesTable();

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
          renderEnquiriesTable();
        }
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredEnquiries.length / ITEMS_PER_PAGE);
        if (currentPage < totalPages) {
          currentPage++;
          renderEnquiriesTable();
        }
      });
    }

    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        const freshEnquiries = await BookstoreAPI.getEnquiries();
        filteredEnquiries = [...freshEnquiries];
        applyFiltersAndSearch(searchInput ? searchInput.value : '', filterSelect ? filterSelect.value : 'all');
        showToast('Enquiries refreshed successfully', 'success');
      });
    }
  }

  async function applyFiltersAndSearch(query, status) {
    const enquiries = await BookstoreAPI.getEnquiries();
    const cleanQuery = query.toLowerCase().trim();

    filteredEnquiries = enquiries.filter(e => {
      const name = (e.name || '').toLowerCase();
      const email = (e.email || '').toLowerCase();
      const subject = (e.subject || '').toLowerCase();
      const matchesSearch = name.includes(cleanQuery) || email.includes(cleanQuery) || subject.includes(cleanQuery);
      
      const matchesStatus = status === 'all' || (e.status || '').toUpperCase() === status.toUpperCase();
      return matchesSearch && matchesStatus;
    });

    currentPage = 1; // Reset to page 1
    renderEnquiriesTable();
  }

  function renderEnquiriesTable() {
    const tableBody = document.getElementById('enquiries-table-body');
    if (!tableBody) return;

    const totalItems = filteredEnquiries.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

    // Boundary check
    if (currentPage > totalPages) currentPage = totalPages;

    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, totalItems);
    const visibleItems = filteredEnquiries.slice(startIdx, endIdx);

    // Update Pagination Label Count
    const infoLabel = document.getElementById('pagination-info-label');
    if (infoLabel) {
      infoLabel.textContent = totalItems > 0 
        ? `Showing ${startIdx + 1} to ${endIdx} of ${totalItems} enquiries` 
        : 'Showing 0 of 0 enquiries';
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
              <i class="fas fa-inbox empty-state-icon"></i>
              <h3>No Enquiries Found</h3>
              <p>We couldn't find any enquiries matching your search query or filters.</p>
            </div>
          </td>
        </tr>
      `;
    } else {
      tableBody.innerHTML = visibleItems.map(e => {
        const badgeClass = e.status === 'RESOLVED' ? 'success' : 'primary';
        return `
        <tr class="fade-in">
          <td><strong>${e.name || 'N/A'}</strong></td>
          <td><a href="mailto:${e.email}">${e.email || 'N/A'}</a></td>
          <td>${e.phone_no || 'N/A'}</td>
          <td>${e.subject || 'N/A'}</td>
          <td><span title="${e.message}">${(e.message || '').substring(0, 40)}${(e.message || '').length > 40 ? '...' : ''}</span></td>
          <td><span class="badge badge-${badgeClass}">${e.status || 'NEW'}</span></td>
          <td>
            <div class="table-actions">
              <button class="action-btn toggle-resolve-btn" data-id="${e.message_id}" title="${e.status === 'RESOLVED' ? 'Mark as New' : 'Mark as Resolved'}">
                <i class="fas ${e.status === 'RESOLVED' ? 'fa-times-circle' : 'fa-check-circle'}"></i>
              </button>
            </div>
          </td>
        </tr>
      `}).join('');

      // Add listeners for status toggles
      tableBody.querySelectorAll('.toggle-resolve-btn').forEach(btn => {
        btn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          const id = btn.dataset.id;
          const enquiry = filteredEnquiries.find(enq => String(enq.message_id) === String(id));
          if (enquiry) {
            toggleEnquiryStatus(id, enquiry.status, enquiry.name);
          }
        });
      });
    }
  }

  async function toggleEnquiryStatus(id, currentStatus, name) {
    if (!window.BookstoreAPI) return;
    
    const newStatus = currentStatus === 'RESOLVED' ? 'NEW' : 'RESOLVED';
    
    createModal({
      title: `${newStatus === 'RESOLVED' ? 'Resolve' : 'Reopen'} Enquiry`,
      contentHTML: `<p>Are you sure you want to mark the enquiry from <strong>${name || 'this user'}</strong> as <strong>${newStatus}</strong>?</p>`,
      actions: [
        { id: 'cancel', label: 'Cancel', type: 'secondary' },
        { 
          id: 'confirm', 
          label: 'Confirm', 
          type: 'primary',
          callback: async (close) => {
            const success = await BookstoreAPI.updateEnquiryStatus(id, newStatus);
            if (success) {
                showToast(`Enquiry has been marked as ${newStatus}.`, 'success');
                
                // Re-fetch and re-render
                const freshEnquiries = await BookstoreAPI.getEnquiries();
                filteredEnquiries = [...freshEnquiries];
                applyFiltersAndSearch(
                    document.getElementById('enquiry-search')?.value || '', 
                    document.getElementById('enquiry-filter-status')?.value || 'all'
                );
            }
            close();
          }
        }
      ]
    });
  }

})();
