/**
 * validation.js - Form Validations and Dynamic Highlights
 * Integrates comprehensive input fields audits, currency matching,
 * and error indicators for form pages.
 */

(function () {
  window.Validation = {
    // Basic format checkers
    isValidEmail: function (email) {
      const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return re.test(String(email).toLowerCase());
    },

    isValidPrice: function (price) {
      const val = parseFloat(price);
      return !isNaN(val) && val >= 0.01;
    },

    isValidStock: function (stock) {
      const val = parseInt(stock);
      return !isNaN(val) && val >= 0;
    },

    // UI Feedback Helpers
    showError: function (inputElement, message) {
      this.clearError(inputElement);
      
      inputElement.classList.add('input-error');
      
      const parent = inputElement.parentElement;
      const errorMsg = document.createElement('span');
      errorMsg.className = 'error-feedback';
      errorMsg.textContent = message;
      parent.appendChild(errorMsg);
    },

    clearError: function (inputElement) {
      inputElement.classList.remove('input-error');
      const parent = inputElement.parentElement;
      const existing = parent.querySelector('.error-feedback');
      if (existing) existing.remove();
    },

    // Whole Form Audits
    validateForm: function (formElement) {
      let isValid = true;
      const requiredInputs = formElement.querySelectorAll('[required]');
      
      requiredInputs.forEach(input => {
        this.clearError(input);

        // 1. Check Empty
        if (!input.value.trim()) {
          this.showError(input, `${input.placeholder || 'This field'} is required.`);
          isValid = false;
          return;
        }

        // 2. Check Emails
        if (input.type === 'email' && !this.isValidEmail(input.value)) {
          this.showError(input, 'Please enter a valid email address.');
          isValid = false;
          return;
        }

        // 3. Price Auditing
        if (input.dataset.validation === 'price' && !this.isValidPrice(input.value)) {
          this.showError(input, 'Price must be a valid number greater than $0.00.');
          isValid = false;
          return;
        }

        // 4. Stock Auditing
        if (input.dataset.validation === 'stock' && !this.isValidStock(input.value)) {
          this.showError(input, 'Stock must be a non-negative integer.');
          isValid = false;
          return;
        }
      });

      return isValid;
    }
  };
})();
