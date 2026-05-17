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
  function initializeBooksListView() {
    if (!window.BookstoreAPI) return;

    const books = BookstoreAPI.getBooks();
    filteredBooks = [...books];

    // Load category filter select options
    const categorySelect = document.getElementById('book-filter-category');
    if (categorySelect) {
      const cats = BookstoreAPI.getCategories();
      categorySelect.innerHTML = '<option value="all">All Categories</option>' + 
        cats.map(c => `<option value="${c}">${c}</option>`).join('');
    }

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

  function applyFiltersAndSearch(query, category) {
    const books = BookstoreAPI.getBooks();
    const cleanQuery = query.toLowerCase().trim();

    filteredBooks = books.filter(b => {
      const matchesSearch = b.title.toLowerCase().includes(cleanQuery) || 
                            b.author.toLowerCase().includes(cleanQuery) || 
                            b.isbn.toLowerCase().includes(cleanQuery);
      const matchesCategory = category === 'all' || b.category.toLowerCase() === category.toLowerCase();
      return matchesSearch && matchesCategory;
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

  function promptDeleteBook(id) {
    if (!window.BookstoreAPI) return;
    const book = BookstoreAPI.getBookById(id);
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
          callback: (close) => {
            BookstoreAPI.deleteBook(id);
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

    // Load category options into dropdown select
    const categorySelect = document.getElementById('book-category');
    if (categorySelect) {
      const cats = BookstoreAPI.getCategories();
      categorySelect.innerHTML = '<option value="">Select Category</option>' + 
        cats.map(c => `<option value="${c}">${c}</option>`).join('');
    }

    const form = document.getElementById('add-book-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validate
        if (window.Validation && !Validation.validateForm(form)) {
          showToast('Please correct validation errors on form fields!', 'danger');
          return;
        }

        const newBookData = {
          title: document.getElementById('book-title').value.trim(),
          author: document.getElementById('book-author').value.trim(),
          category: categorySelect.value,
          price: document.getElementById('book-price').value,
          stock: document.getElementById('book-stock').value,
          isbn: document.getElementById('book-isbn').value.trim(),
          publisher: document.getElementById('book-publisher').value.trim(),
          publishDate: document.getElementById('book-publish-date').value,
          cover: document.getElementById('book-cover-url').value.trim(),
          description: document.getElementById('book-desc').value.trim()
        };

        const result = BookstoreAPI.addBook(newBookData);
        BookstoreAPI.addNotification('stock', 'New Book Cataloged', `"${result.title}" added to inventory with ${result.stock} copies.`);
        showToast(`"${result.title}" has been successfully added to books catalog!`, 'success');
        
        setTimeout(() => { window.location.href = 'books.html'; }, 1000);
      });
    }

    // Dynamic Image Cover preview binding
    const coverUrlInput = document.getElementById('book-cover-url');
    const coverPreview = document.getElementById('cover-preview-img');
    if (coverUrlInput && coverPreview) {
      coverUrlInput.addEventListener('input', () => {
        const val = coverUrlInput.value.trim();
        if (val) coverPreview.src = val;
        else coverPreview.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&q=80';
      });
    }
  }

  // ==========================================================================
  // EDIT EXISTING BOOK CONTROLLER (edit-book.html)
  // ==========================================================================
  function initializeEditBookView() {
    if (!window.BookstoreAPI) return;

    // Load category choices
    const categorySelect = document.getElementById('book-category');
    if (categorySelect) {
      const cats = BookstoreAPI.getCategories();
      categorySelect.innerHTML = '<option value="">Select Category</option>' + 
        cats.map(c => `<option value="${c}">${c}</option>`).join('');
    }

    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');

    if (!bookId) {
      showToast('No book ID specified for editing!', 'danger');
      setTimeout(() => { window.location.href = 'books.html'; }, 1000);
      return;
    }

    const book = BookstoreAPI.getBookById(bookId);
    if (!book) {
      showToast('Requested book title not found!', 'danger');
      setTimeout(() => { window.location.href = 'books.html'; }, 1000);
      return;
    }

    // 1. Populate form fields
    const fTitle = document.getElementById('book-title'); if (fTitle) fTitle.value = book.title;
    const fAuthor = document.getElementById('book-author'); if (fAuthor) fAuthor.value = book.author;
    if (categorySelect) categorySelect.value = book.category;
    const fPrice = document.getElementById('book-price'); if (fPrice) fPrice.value = book.price;
    const fStock = document.getElementById('book-stock'); if (fStock) fStock.value = book.stock;
    const fIsbn = document.getElementById('book-isbn'); if (fIsbn) fIsbn.value = book.isbn || '';
    const fPublisher = document.getElementById('book-publisher'); if (fPublisher) fPublisher.value = book.publisher || '';
    const fPubDate = document.getElementById('book-publish-date'); if (fPubDate) fPubDate.value = book.publishDate || '';
    const fCover = document.getElementById('book-cover-url'); if (fCover) fCover.value = book.cover || '';
    const fDesc = document.getElementById('book-desc'); if (fDesc) fDesc.value = book.description || '';

    const coverPreview = document.getElementById('cover-preview-img');
    if (coverPreview && book.cover) coverPreview.src = book.cover;

    // Dynamic Preview binding
    if (fCover && coverPreview) {
      fCover.addEventListener('input', () => {
        const val = fCover.value.trim();
        if (val) coverPreview.src = val;
        else coverPreview.src = 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&q=80';
      });
    }

    // 2. Form submission trigger
    const form = document.getElementById('edit-book-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (window.Validation && !Validation.validateForm(form)) {
          showToast('Please fix validation errors on form fields!', 'danger');
          return;
        }

        const updatedFields = {
          title: fTitle.value.trim(),
          author: fAuthor.value.trim(),
          category: categorySelect.value,
          price: fPrice.value,
          stock: fStock.value,
          isbn: fIsbn.value.trim(),
          publisher: fPublisher.value.trim(),
          publishDate: fPubDate.value,
          cover: fCover.value.trim(),
          description: fDesc.value.trim()
        };

        const result = BookstoreAPI.updateBook(bookId, updatedFields);
        BookstoreAPI.addNotification('stock', 'Book Details Modified', `"${result.title}" (ID: ${result.id}) stock or price was updated.`);
        showToast(`"${result.title}" has been successfully updated in inventory catalog!`, 'success');
        
        setTimeout(() => { window.location.href = 'books.html'; }, 1000);
      });
    }
  }

})();
