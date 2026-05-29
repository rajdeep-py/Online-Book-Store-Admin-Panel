/**
 * portfolio.js - Company Portfolio Management
 * Handles fetching, updating, and UI interactions for the AboutUs API
 */

(function () {
  let partnersData = [];

  document.addEventListener('DOMContentLoaded', () => {
    const filename = window.location.pathname.split('/').pop();
    if (filename === 'portfolio.html') {
      initializePortfolioView();
    }
  });

  async function initializePortfolioView() {
    if (!window.BookstoreAPI) return;

    // Fetch existing portfolio data
    const portfolio = await BookstoreAPI.getPortfolio();
    if (portfolio) {
      populateForm(portfolio);
    } else {
      showToast('No existing portfolio found. Creating a new one.', 'info');
    }

    // Bind logo upload simulation
    const logoWrapper = document.getElementById('logo-upload-wrapper');
    const logoInput = document.getElementById('logo-input');
    const logoPreview = document.getElementById('logo-preview');

    if (logoWrapper && logoInput) {
      logoWrapper.addEventListener('click', () => {
        logoInput.click();
      });

      logoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function(evt) {
            const dataUrl = evt.target.result;
            if (logoPreview) {
              logoPreview.src = dataUrl;
              logoPreview.style.display = 'inline-block';
            }
            
            // Also update the sidebar logo immediately to simulate a real-time update
            const sidebarLogo = document.querySelector('.sidebar-brand img');
            if (sidebarLogo) {
              sidebarLogo.src = dataUrl;
            }
            
            showToast('Logo updated successfully!', 'success');
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Bind partner addition
    const addPartnerBtn = document.getElementById('add-partner-btn');
    if (addPartnerBtn) {
      addPartnerBtn.addEventListener('click', () => {
        partnersData.push({ name: '', logo: '', role: '' });
        renderPartners();
      });
    }

    // Bind save button
    const saveBtn = document.getElementById('save-portfolio-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', savePortfolio);
    }
  }

  function populateForm(data) {
    document.getElementById('about-id').value = data.about_id || '';
    document.getElementById('company-name').value = data.company_name || '';
    document.getElementById('company-tagline').value = data.company_tagline || '';
    document.getElementById('company-description').value = data.company_description || '';
    document.getElementById('company-mission').value = data.mission || '';
    document.getElementById('company-vision').value = data.vision || '';
    document.getElementById('company-phone').value = data.phone_no || '';
    document.getElementById('company-email').value = data.email_id || '';
    document.getElementById('company-address').value = data.address || '';
    
    // Parse partners
    if (data.partners && Array.isArray(data.partners)) {
      partnersData = data.partners;
    } else {
      partnersData = [];
    }
    renderPartners();
  }

  function renderPartners() {
    const container = document.getElementById('partners-container');
    if (!container) return;

    if (partnersData.length === 0) {
      container.innerHTML = `
        <div class="empty-state p-4 text-center">
          <i class="fas fa-handshake empty-state-icon"></i>
          <p>No partners added yet.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = partnersData.map((partner, index) => `
      <div class="partner-card fade-in" data-index="${index}">
        <div class="partner-fields">
          <div>
            <label class="form-label" style="font-size: 0.8rem;">Partner Name</label>
            <input type="text" class="form-control partner-name" value="${partner.name || ''}" placeholder="e.g. Acme Corp">
          </div>
          <div>
            <label class="form-label" style="font-size: 0.8rem;">Role/Type</label>
            <input type="text" class="form-control partner-role" value="${partner.role || ''}" placeholder="e.g. Supplier">
          </div>
          <div>
            <label class="form-label" style="font-size: 0.8rem;">Logo URL</label>
            <input type="text" class="form-control partner-logo" value="${partner.logo || ''}" placeholder="https://...">
          </div>
        </div>
        <button class="btn btn-danger remove-partner-btn" style="padding: 0.5rem 1rem;" data-index="${index}">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `).join('');

    // Bind remove buttons
    container.querySelectorAll('.remove-partner-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.dataset.index, 10);
        partnersData.splice(idx, 1);
        renderPartners();
      });
    });
    
    // Bind input changes so they persist when re-rendering
    container.querySelectorAll('.partner-card').forEach(card => {
      const idx = parseInt(card.dataset.index, 10);
      const nameInput = card.querySelector('.partner-name');
      const roleInput = card.querySelector('.partner-role');
      const logoInput = card.querySelector('.partner-logo');
      
      nameInput.addEventListener('input', (e) => partnersData[idx].name = e.target.value);
      roleInput.addEventListener('input', (e) => partnersData[idx].role = e.target.value);
      logoInput.addEventListener('input', (e) => partnersData[idx].logo = e.target.value);
    });
  }

  async function savePortfolio() {
    const saveBtn = document.getElementById('save-portfolio-btn');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    saveBtn.disabled = true;

    const id = document.getElementById('about-id').value;
    
    const payload = {
      company_name: document.getElementById('company-name').value,
      company_tagline: document.getElementById('company-tagline').value,
      company_description: document.getElementById('company-description').value,
      mission: document.getElementById('company-mission').value,
      vision: document.getElementById('company-vision').value,
      phone_no: document.getElementById('company-phone').value,
      email_id: document.getElementById('company-email').value,
      address: document.getElementById('company-address').value,
      partners: partnersData
    };

    try {
      const success = await BookstoreAPI.updatePortfolio(id, payload);
      if (success) {
        showToast('Company Portfolio saved successfully!', 'success');
        
        // Ensure the sidebar text updates immediately
        const brandName = document.querySelector('.sidebar-brand .brand-name');
        const brandTagline = document.querySelector('.sidebar-brand .brand-tagline');
        if (brandName) brandName.textContent = payload.company_name || 'Book Heaven';
        if (brandTagline) brandTagline.textContent = payload.company_tagline || 'Your Ultimate Book Store';
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to save portfolio.', 'danger');
    } finally {
      saveBtn.innerHTML = originalText;
      saveBtn.disabled = false;
    }
  }

})();
