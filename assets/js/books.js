/**
 * books.js - Books inventory CRUD controller
 * Coordinates standard listings, additions form audits, edits inputs,
 * and deleting actions from database.
 */

(function () {
  const ITEMS_PER_PAGE = 8;
  let currentPage = 1;
  let filteredBooks = [];

  document.addEventListener('DOMContentLoaded', () => {
    const filename = window.location.pathname.split('/').pop();

    if (filename === 'books.html') {
      initializeBooksListView();
    } else if (filename === 'add-book.html') {
      initializeAddBookView();
    } else if (filename === 'edit-book.html') {
      initializeEditBookView();
    }
  });

  // ==========================================================================
  // BOOKS LISTINGS CONTROLLER (books.html)
  // ==========================================================================
  async function initializeBooksListView() {
    if (!window.BookstoreAPI) return;

    const books = await BookstoreAPI.getBooks();
    filteredBooks = [...books];

    const categorySelect = document.getElementById('book-filter-category');
    // Removed dynamic category population since it is now free text

    const searchInput = document.getElementById('book-search');
    const prevBtn = document.getElementById('pag-prev');
    const nextBtn = document.getElementById('pag-next');

    // Renders initial table
    renderBooksTable();

    // Bind Search Input
    if (searchInput) {
      searchInput.addEventListener('input', () => {
        applyFiltersAndSearch(searchInput.value, categorySelect ? categorySelect.value : 'all');
      });
    }

    // Bind Category Filter
    if (categorySelect) {
      categorySelect.addEventListener('change', () => {
        applyFiltersAndSearch(searchInput ? searchInput.value : '', categorySelect.value);
      });
    }

    // Bind Pagination controls
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          renderBooksTable();
        }
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(filteredBooks.length / ITEMS_PER_PAGE);
        if (currentPage < totalPages) {
          currentPage++;
          renderBooksTable();
        }
      });
    }

    // Check if query redirect search exists
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    if (searchParam && searchInput) {
      searchInput.value = decodeURIComponent(searchParam);
      applyFiltersAndSearch(searchInput.value, 'all');
    }
  }

  async function applyFiltersAndSearch(query, category) {
    const books = await BookstoreAPI.getBooks(query); // Backend filters by title/author
    
    // Client-side filter for the category dropdown if still present
    filteredBooks = books.filter(b => {
      const matchesCategory = category === 'all' || b.category.toLowerCase() === category.toLowerCase();
      return matchesCategory;
    });

    currentPage = 1; // Reset to page 1
    renderBooksTable();
  }

  function renderBooksTable() {
    const tableBody = document.getElementById('books-table-body');
    if (!tableBody) return;

    const totalItems = filteredBooks.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;

    if (currentPage > totalPages) currentPage = totalPages;

    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, totalItems);
    const visibleItems = filteredBooks.slice(startIdx, endIdx);

    // Update Pagination Info
    const infoLabel = document.getElementById('pagination-info-label');
    if (infoLabel) {
      infoLabel.textContent = totalItems > 0 
        ? `Showing ${startIdx + 1} to ${endIdx} of ${totalItems} books` 
        : 'Showing 0 of 0 books';
    }

    const prevBtn = document.getElementById('pag-prev');
    const nextBtn = document.getElementById('pag-next');
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;

    if (totalItems === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">
            <div class="empty-state p-4">
              <i class="fas fa-book empty-state-icon"></i>
              <h3>No Books Found</h3>
              <p>We couldn't find any book catalog matches.</p>
            </div>
          </td>
        </tr>
      `;
    } else {
      tableBody.innerHTML = visibleItems.map(b => `
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
          <td>
            <strong>${b.stock}</strong>
            ${b.stock <= BookstoreAPI.getSettings().lowStockThreshold ? '<span class="text-warning font-weight-bold ml-1" title="Low stock alert!"><i class="fas fa-exclamation-triangle"></i></span>' : ''}
          </td>
          <td><span class="badge badge-${b.status.toLowerCase()}">${b.status}</span></td>
          <td>
            <div class="table-actions">
              <a href="edit-book.html?id=${b.id}" class="action-btn" title="Edit Book">
                <i class="fas fa-pencil-alt"></i>
              </a>
              <button class="action-btn btn-delete delete-book-btn" data-id="${b.id}" title="Delete Book">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </td>
        </tr>
      `).join('');

      // Bind deletes
      tableBody.querySelectorAll('.delete-book-btn').forEach(btn => {
        btn.onclick = (e) => {
          e.stopPropagation();
          const id = btn.dataset.id;
          promptDeleteBook(id);
        };
      });
    }
  }

  async function promptDeleteBook(id) {
    if (!window.BookstoreAPI) return;
    const book = await BookstoreAPI.getBookById(id);
    if (!book) return;

    createModal({
      title: 'Delete Book Title',
      contentHTML: `<p>Are you sure you want to permanently delete <strong>"${book.title}"</strong> from inventory catalogs?</p><p class="text-danger"><small><i class="fas fa-exclamation-circle"></i> Warning: This action cannot be undone.</small></p>`,
      actions: [
        { id: 'cancel', label: 'Cancel', type: 'secondary' },
        {
          id: 'confirm',
          label: 'Delete',
          type: 'danger',
          callback: async (close) => {
            await BookstoreAPI.deleteBook(id);
            BookstoreAPI.addNotification('stock', 'Book Deleted', `Book "${book.title}" was deleted by administrator.`);
            showToast(`"${book.title}" was successfully deleted from inventory!`, 'success');
            close();
            // Re-render list
            const categorySelect = document.getElementById('book-filter-category');
            applyFiltersAndSearch(
              document.getElementById('book-search')?.value || '',
              categorySelect ? categorySelect.value : 'all'
            );
          }
        }
      ]
    });
  }

  // ==========================================================================
  // ADD NEW BOOK CONTROLLER (add-book.html)
  // ==========================================================================
  function initializeAddBookView() {
    if (!window.BookstoreAPI) return;

    const form = document.getElementById('add-book-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Validate
        if (window.Validation && !Validation.validateForm(form)) {
          showToast('Please correct validation errors on form fields!', 'danger');
          return;
        }

        const newBookData = {
          title: document.getElementById('book-title').value.trim(),
          author: document.getElementById('book-author').value.trim(),
          authorDesc: document.getElementById('book-author-desc').value.trim(),
          category: document.getElementById('book-category').value.trim(),
          price: document.getElementById('book-price').value,
          discount: document.getElementById('book-discount').value,
          stock: document.getElementById('book-stock').value,
          coverFile: document.getElementById('book-cover-file').files[0],
          description: document.getElementById('book-desc').value.trim()
        };

        const result = await BookstoreAPI.addBook(newBookData);
        if (result) {
          BookstoreAPI.addNotification('stock', 'New Book Cataloged', `"${result.title}" added to inventory with ${result.stock} copies.`);
          showToast(`"${result.title}" has been successfully added to books catalog!`, 'success');
          
          setTimeout(() => { window.location.href = 'books.html'; }, 1000);
        } else {
          showToast('Failed to add book.', 'danger');
        }
      });
    }

    // Dynamic Image Cover preview binding
    const coverFileInput = document.getElementById('book-cover-file');
    const coverPreview = document.getElementById('cover-preview-img');
    if (coverFileInput && coverPreview) {
      coverFileInput.addEventListener('change', () => {
        const file = coverFileInput.files[0];
        if (file) {
          coverPreview.src = URL.createObjectURL(file);
        } else {
          coverPreview.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&q=80';
        }
      });
    }
  }

  // ==========================================================================
  // EDIT EXISTING BOOK CONTROLLER (edit-book.html)
  // ==========================================================================
  async function initializeEditBookView() {
    if (!window.BookstoreAPI) return;

    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');

    if (!bookId) {
      showToast('No book ID specified for editing!', 'danger');
      setTimeout(() => { window.location.href = 'books.html'; }, 1000);
      return;
    }

    const book = await BookstoreAPI.getBookById(bookId);
    if (!book) {
      showToast('Requested book title not found!', 'danger');
      setTimeout(() => { window.location.href = 'books.html'; }, 1000);
      return;
    }

    // 1. Populate form fields
    const fTitle = document.getElementById('book-title'); if (fTitle) fTitle.value = book.title;
    const fAuthor = document.getElementById('book-author'); if (fAuthor) fAuthor.value = book.author;
    const fAuthorDesc = document.getElementById('book-author-desc'); if (fAuthorDesc) fAuthorDesc.value = book.authorDescription || '';
    const fCategory = document.getElementById('book-category'); if (fCategory) fCategory.value = book.category;
    const fPrice = document.getElementById('book-price'); if (fPrice) fPrice.value = book.originalPrice || book.price;
    const fDiscount = document.getElementById('book-discount'); if (fDiscount) fDiscount.value = book.discountPercent || '';
    const fStock = document.getElementById('book-stock'); if (fStock) fStock.value = book.stock;
    const fCoverFile = document.getElementById('book-cover-file'); // File input, so no value to set
    const fDesc = document.getElementById('book-desc'); if (fDesc) fDesc.value = book.description || '';

    const coverPreview = document.getElementById('cover-preview-img');
    if (coverPreview && book.cover) coverPreview.src = book.cover;

    // Dynamic Preview binding
    if (fCoverFile && coverPreview) {
      fCoverFile.addEventListener('change', () => {
        const file = fCoverFile.files[0];
        if (file) {
          coverPreview.src = URL.createObjectURL(file);
        } else {
          coverPreview.src = book.cover || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&q=80';
        }
      });
    }

    // 2. Form submission trigger
    const form = document.getElementById('edit-book-form');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (window.Validation && !Validation.validateForm(form)) {
          showToast('Please fix validation errors on form fields!', 'danger');
          return;
        }

        const updatedFields = {
          title: fTitle.value.trim(),
          author: fAuthor.value.trim(),
          authorDesc: fAuthorDesc ? fAuthorDesc.value.trim() : '',
          category: fCategory ? fCategory.value.trim() : '',
          price: fPrice.value,
          discount: fDiscount ? fDiscount.value : '',
          stock: fStock.value,
          coverFile: fCoverFile ? fCoverFile.files[0] : null,
          description: fDesc.value.trim()
        };

        const result = await BookstoreAPI.updateBook(bookId, updatedFields);
        if (result) {
          BookstoreAPI.addNotification('stock', 'Book Details Modified', `"${result.title}" (ID: ${result.id}) stock or price was updated.`);
          showToast(`"${result.title}" has been successfully updated in inventory catalog!`, 'success');
          
          setTimeout(() => { window.location.href = 'books.html'; }, 1000);
        } else {
          showToast('Failed to update book details.', 'danger');
        }
      });
    }
  }

})();
