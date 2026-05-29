/**
 * charges.js - Earning Charges CRUD controller
 */

(function () {
  let chargesList = [];

  document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.endsWith('charges.html')) {
      initializeChargesView();
    }
  });

  async function initializeChargesView() {
    if (!window.BookstoreAPI) return;

    await loadCharges();

    const addBtn = document.getElementById('add-charge-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        openChargeFormModal();
      });
    }
  }

  async function loadCharges() {
    chargesList = await BookstoreAPI.getCharges();
    renderChargesTable();
  }

  function renderChargesTable() {
    const tableBody = document.getElementById('charges-table-body');
    if (!tableBody) return;

    if (chargesList.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center">
            <div class="empty-state p-4">
              <i class="fas fa-money-bill-wave empty-state-icon"></i>
              <h3>No Charge Profiles</h3>
              <p>Create a new earning charge profile to apply fees and taxes.</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = chargesList.map(c => `
      <tr class="fade-in">
        <td><strong>#${c.charges_id}</strong></td>
        <td>${formatCurrency(c.platform_fee)}</td>
        <td>${formatCurrency(c.delivery_fee)}</td>
        <td>${c.taxes_percent}%</td>
        <td>
          <div class="table-actions">
            <button class="action-btn edit-charge-btn" data-id="${c.charges_id}" title="Edit Profile">
              <i class="fas fa-pencil-alt"></i>
            </button>
            <button class="action-btn btn-delete delete-charge-btn" data-id="${c.charges_id}" title="Delete Profile">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    // Bind edit
    tableBody.querySelectorAll('.edit-charge-btn').forEach(btn => {
      btn.onclick = (e) => {
        const id = btn.dataset.id;
        const charge = chargesList.find(c => c.charges_id == id);
        if (charge) openChargeFormModal(charge);
      };
    });

    // Bind delete
    tableBody.querySelectorAll('.delete-charge-btn').forEach(btn => {
      btn.onclick = (e) => {
        const id = btn.dataset.id;
        promptDeleteCharge(id);
      };
    });
  }

  function openChargeFormModal(existingCharge = null) {
    const isEdit = !!existingCharge;
    const title = isEdit ? 'Edit Charge Profile' : 'Create New Charge Profile';
    
    const formHtml = `
      <form id="charge-modal-form" class="standard-form">
        <div class="form-group mb-3">
          <label class="form-label required">Platform Fee (₹)</label>
          <input type="number" step="0.01" class="form-control" id="form-platform-fee" value="${isEdit ? existingCharge.platform_fee : ''}" required>
        </div>
        <div class="form-group mb-3">
          <label class="form-label required">Delivery Fee (₹)</label>
          <input type="number" step="0.01" class="form-control" id="form-delivery-fee" value="${isEdit ? existingCharge.delivery_fee : ''}" required>
        </div>
        <div class="form-group mb-3">
          <label class="form-label required">Taxes Percent (%)</label>
          <input type="number" step="0.01" class="form-control" id="form-taxes" value="${isEdit ? existingCharge.taxes_percent : ''}" required>
        </div>
      </form>
    `;

    createModal({
      title: title,
      contentHTML: formHtml,
      actions: [
        { id: 'cancel', label: 'Cancel', type: 'secondary' },
        { 
          id: 'save', 
          label: isEdit ? 'Update Changes' : 'Create Profile', 
          type: 'primary',
          callback: async (close) => {
            const form = document.getElementById('charge-modal-form');
            if (!form.checkValidity()) {
              form.reportValidity();
              return;
            }

            const payload = {
              platform_fee: parseFloat(document.getElementById('form-platform-fee').value),
              delivery_fee: parseFloat(document.getElementById('form-delivery-fee').value),
              taxes_percent: parseFloat(document.getElementById('form-taxes').value)
            };

            const btn = document.getElementById('modal-btn-save');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            btn.disabled = true;

            let success = false;
            if (isEdit) {
              success = await BookstoreAPI.updateCharge(existingCharge.charges_id, payload);
            } else {
              const created = await BookstoreAPI.createCharge(payload);
              success = !!created;
            }

            if (success) {
              showToast(`Charge profile ${isEdit ? 'updated' : 'created'} successfully!`, 'success');
              await loadCharges();
              close();
            } else {
              showToast(`Failed to ${isEdit ? 'update' : 'create'} charge profile.`, 'danger');
              btn.innerHTML = isEdit ? 'Update Changes' : 'Create Profile';
              btn.disabled = false;
            }
          }
        }
      ]
    });
  }

  function promptDeleteCharge(id) {
    createModal({
      title: 'Delete Charge Profile',
      contentHTML: `<p>Are you sure you want to delete this charge profile?</p><p class="text-danger"><small><i class="fas fa-exclamation-triangle"></i> This action cannot be undone.</small></p>`,
      actions: [
        { id: 'cancel', label: 'Cancel', type: 'secondary' },
        {
          id: 'confirm',
          label: 'Delete',
          type: 'danger',
          callback: async (close) => {
            const success = await BookstoreAPI.deleteCharge(id);
            if (success) {
              showToast('Charge profile deleted successfully.', 'success');
              await loadCharges();
            } else {
              showToast('Failed to delete profile.', 'danger');
            }
            close();
          }
        }
      ]
    });
  }

})();
