/**
 * api.js - LocalStorage Mock Database Access Layer
 * Provides high-performance, robust CRUD operations and simulated API endpoints
 * designed to run seamlessly in both served (http/https) and local (file://) environments.
 */

(function () {
  const DB_PREFIX = 'bookstore_admin_';

  // Seed functions for programmatic DB initialization
  function getPastDate(daysAgo) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  }

  function initializeDatabase() {
    console.log('Initializing Mock Database in localStorage...');

    // 1. Seed Books (30 Books)
    const categories = ['Fiction', 'Non-Fiction', 'Sci-Fi', 'Biography', 'Self-Help', 'Business', 'Technology', 'Mystery'];
    const bookTemplates = [
      { title: 'The Midnight Library', author: 'Matt Haig', category: 'Fiction', price: 14.99 },
      { title: 'Atomic Habits', author: 'James Clear', category: 'Self-Help', price: 18.20 },
      { title: 'Educated', author: 'Tara Westover', category: 'Biography', price: 16.50 },
      { title: 'Dune', author: 'Frank Herbert', category: 'Sci-Fi', price: 22.00 },
      { title: 'Zero to One', author: 'Peter Thiel', category: 'Business', price: 19.99 },
      { title: 'Clean Code', author: 'Robert C. Martin', category: 'Technology', price: 42.50 },
      { title: 'Where the Crawdads Sing', author: 'Delia Owens', category: 'Fiction', price: 15.00 },
      { title: 'Sapiens', author: 'Yuval Noah Harari', category: 'Non-Fiction', price: 24.99 },
      { title: 'Deep Work', author: 'Cal Newport', category: 'Self-Help', price: 17.50 },
      { title: 'Steve Jobs', author: 'Walter Isaacson', category: 'Biography', price: 21.00 },
      { title: 'Project Hail Mary', author: 'Andy Weir', category: 'Sci-Fi', price: 20.00 },
      { title: 'The Lean Startup', author: 'Eric Ries', category: 'Business', price: 22.99 },
      { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', category: 'Technology', price: 49.99 },
      { title: 'The Silent Patient', author: 'Alex Michaelides', category: 'Mystery', price: 13.99 },
      { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', category: 'Fiction', price: 9.99 },
      { title: 'Thinking, Fast and Slow', author: 'Daniel Kahneman', category: 'Non-Fiction', price: 18.99 },
      { title: 'Shoe Dog', author: 'Phil Knight', category: 'Biography', price: 16.99 },
      { title: 'Neuromancer', author: 'William Gibson', category: 'Sci-Fi', price: 12.50 },
      { title: 'The Intelligent Investor', author: 'Benjamin Graham', category: 'Business', price: 24.00 },
      { title: 'You Don\'t Know JS Yet', author: 'Kyle Simpson', category: 'Technology', price: 29.99 },
      { title: 'Gone Girl', author: 'Gillian Flynn', category: 'Mystery', price: 14.50 },
      { title: 'Normal People', author: 'Sally Rooney', category: 'Fiction', price: 16.00 },
      { title: 'Quiet', author: 'Susan Cain', category: 'Non-Fiction', price: 15.99 },
      { title: 'Elon Musk', author: 'Walter Isaacson', category: 'Biography', price: 25.00 },
      { title: 'Foundation', author: 'Isaac Asimov', category: 'Sci-Fi', price: 13.99 },
      { title: 'Good to Great', author: 'Jim Collins', category: 'Business', price: 23.50 },
      { title: 'Refactoring', author: 'Martin Fowler', category: 'Technology', price: 44.99 },
      { title: 'The Da Vinci Code', author: 'Dan Brown', category: 'Mystery', price: 15.99 },
      { title: 'Can\'t Hurt Me', author: 'David Goggins', category: 'Self-Help', price: 19.95 },
      { title: 'The Subtle Art of Not Giving a F*ck', author: 'Mark Manson', category: 'Self-Help', price: 16.99 }
    ];

    const covers = [
      'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&q=80',
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&q=80',
      'https://images.unsplash.com/photo-1495640388908-05fa85288e61?w=300&q=80',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&q=80'
    ];

    const books = bookTemplates.map((template, idx) => {
      const idNum = idx + 1;
      const id = `BOK-${String(idNum).padStart(3, '0')}`;
      let stock = Math.floor(Math.random() * 80) + 15;
      if (idNum === 5) stock = 3;  // Low stock
      if (idNum === 12) stock = 0; // Out of stock
      if (idNum === 25) stock = 5; // Low stock

      return {
        id,
        title: template.title,
        author: template.author,
        category: template.category,
        price: template.price,
        stock,
        status: stock === 0 ? 'Inactive' : 'Active',
        cover: covers[idx % covers.length],
        description: `A masterfully written piece by ${template.author} exploring the concepts of ${template.category.toLowerCase()}. A must-read book that has captivated millions of readers worldwide.`,
        publisher: 'Book Heaven Press',
        publishDate: getPastDate(Math.floor(Math.random() * 1000) + 200),
        isbn: `978-3-16-14841${idNum}`
      };
    });

    // 2. Seed Customers (20 Customers)
    const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

    const customers = [];
    for (let i = 0; i < 20; i++) {
      const id = `CUST-${String(i + 1).padStart(3, '0')}`;
      const firstName = firstNames[i];
      const lastName = lastNames[i % lastNames.length];
      const name = `${firstName} ${lastName}`;
      customers.push({
        id,
        name,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`,
        phone: `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        address: `${Math.floor(Math.random() * 900) + 100} Main Street, Apt ${Math.floor(Math.random() * 30) + 1}, New York, NY 10001`,
        ordersCount: 0,
        totalSpent: 0,
        status: i === 15 ? 'Suspended' : 'Active',
        joinDate: getPastDate(Math.floor(Math.random() * 145) + 5)
      });
    }

    // 3. Seed Orders (50 Orders)
    const orderStatuses = ['Pending', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled'];
    const paymentMethods = ['Credit Card', 'PayPal', 'Stripe', 'Cash on Delivery'];
    const orders = [];

    for (let i = 0; i < 50; i++) {
      const id = `ORD-${String(i + 1).padStart(3, '0')}`;
      const custIdx = Math.floor(Math.random() * customers.length);
      const customer = customers[custIdx];
      const itemsCount = Math.floor(Math.random() * 3) + 1;
      const items = [];
      let amount = 0;

      const selectedBookIndices = [];
      while (selectedBookIndices.length < itemsCount) {
        const rIdx = Math.floor(Math.random() * books.length);
        if (!selectedBookIndices.includes(rIdx)) selectedBookIndices.push(rIdx);
      }

      selectedBookIndices.forEach(idx => {
        const book = books[idx];
        const qty = Math.floor(Math.random() * 2) + 1;
        items.push({
          bookId: book.id,
          title: book.title,
          price: book.price,
          quantity: qty
        });
        amount += book.price * qty;
      });

      amount = Math.round(amount * 100) / 100;
      customer.ordersCount += 1;
      customer.totalSpent += amount;

      let status = 'Delivered';
      const rand = Math.random();
      if (rand < 0.08) status = 'Pending';
      else if (rand < 0.16) status = 'Confirmed';
      else if (rand < 0.25) status = 'Dispatched';
      else if (rand < 0.32) status = 'Cancelled';

      const date = getPastDate(Math.floor((50 - i) * 0.9));

      orders.push({
        id,
        customerId: customer.id,
        customerName: customer.name,
        customerEmail: customer.email,
        date,
        amount,
        status,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        items,
        shippingAddress: customer.address,
        trackingNumber: status === 'Dispatched' || status === 'Delivered' ? `TRK${Math.floor(100000000 + Math.random() * 900000000)}` : null
      });
    }

    customers.forEach(c => {
      c.totalSpent = Math.round(c.totalSpent * 100) / 100;
    });

    // 4. Seed Notifications (10 Notifications)
    const notifications = [
      { id: 'NTF-001', type: 'order', title: 'New Order Received', message: 'Order #ORD-050 placed by James Smith ($84.50)', time: '2 mins ago', read: false },
      { id: 'NTF-002', type: 'stock', title: 'Low Stock Warning', message: 'Book "Zero to One" has only 3 copies left in stock!', time: '1 hour ago', read: false },
      { id: 'NTF-003', type: 'customer', title: 'New Customer Registered', message: 'Elizabeth Martinez joined the platform.', time: '3 hours ago', read: false },
      { id: 'NTF-004', type: 'order', title: 'Order Cancelled', message: 'Order #ORD-045 has been cancelled by the customer.', time: '5 hours ago', read: true },
      { id: 'NTF-005', type: 'stock', title: 'Out of Stock Alert', message: 'Book "The Lean Startup" is completely out of stock!', time: '1 day ago', read: true },
      { id: 'NTF-006', type: 'system', title: 'System Backup Completed', message: 'Database was backed up successfully to the secure vault.', time: '1 day ago', read: true },
      { id: 'NTF-007', type: 'order', title: 'Order Dispatched', message: 'Order #ORD-048 has been shipped with Tracking ID TRK849204859.', time: '2 days ago', read: true },
      { id: 'NTF-008', type: 'customer', title: 'Profile Updated', message: 'Admin profile information was modified.', time: '2 days ago', read: true },
      { id: 'NTF-009', type: 'order', title: 'Bulk Order Delivered', message: 'Order #ORD-032 consisting of 12 items was successfully delivered.', time: '3 days ago', read: true },
      { id: 'NTF-010', type: 'system', title: 'Security Alert', message: 'Successful login detected from a new IP Address (192.168.1.45).', time: '4 days ago', read: true }
    ];

    // 5. Seed Admin Profile
    const profile = {
      name: 'Sophia Vance',
      email: 'admin@bookheaven.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
      role: 'Super Administrator',
      phone: '+1 (555) 019-2834',
      lastLogin: new Date().toLocaleString(),
      bio: 'Managing and designing visual systems for the Book Heaven ecommerce brand.'
    };

    // 6. Seed Settings
    const settings = {
      siteName: 'Book Heaven Admin',
      emailNotifications: true,
      lowStockThreshold: 10,
      currency: 'USD',
      theme: 'light',
      maintenanceMode: false
    };

    // Write all to localStorage
    localStorage.setItem(DB_PREFIX + 'books', JSON.stringify(books));
    localStorage.setItem(DB_PREFIX + 'customers', JSON.stringify(customers));
    localStorage.setItem(DB_PREFIX + 'orders', JSON.stringify(orders));
    localStorage.setItem(DB_PREFIX + 'categories', JSON.stringify(categories));
    localStorage.setItem(DB_PREFIX + 'notifications', JSON.stringify(notifications));
    localStorage.setItem(DB_PREFIX + 'profile', JSON.stringify(profile));
    localStorage.setItem(DB_PREFIX + 'settings', JSON.stringify(settings));
    localStorage.setItem(DB_PREFIX + 'initialized', 'true');
  }

  // Ensure DB exists
  if (!localStorage.getItem(DB_PREFIX + 'initialized')) {
    initializeDatabase();
  }

  // Helpers to get/set data
  function getDBItem(key) {
    return JSON.parse(localStorage.getItem(DB_PREFIX + key));
  }

  function setDBItem(key, data) {
    localStorage.setItem(DB_PREFIX + key, JSON.stringify(data));
  }

  // PUBLIC API INTERFACE
  window.BookstoreAPI = {
    // BOOKS CRUD
    getBooks: function () {
      return getDBItem('books') || [];
    },
    getBookById: function (id) {
      return this.getBooks().find(b => b.id === id);
    },
    addBook: function (book) {
      const books = this.getBooks();
      const nextIdNum = books.length > 0 ? Math.max(...books.map(b => parseInt(b.id.split('-')[1]))) + 1 : 1;
      const nextId = `BOK-${String(nextIdNum).padStart(3, '0')}`;
      
      const newBook = {
        id: nextId,
        cover: book.cover || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&q=80',
        title: book.title,
        author: book.author,
        category: book.category,
        price: parseFloat(book.price) || 0,
        stock: parseInt(book.stock) || 0,
        status: parseInt(book.stock) > 0 ? 'Active' : 'Inactive',
        description: book.description || 'No description provided.',
        publisher: book.publisher || 'Book Heaven Press',
        publishDate: book.publishDate || new Date().toISOString().split('T')[0],
        isbn: book.isbn || `978-3-16-148-${nextIdNum}`
      };
      
      books.unshift(newBook); // Prepend to show first in list
      setDBItem('books', books);
      return newBook;
    },
    updateBook: function (id, updatedFields) {
      const books = this.getBooks();
      const idx = books.findIndex(b => b.id === id);
      if (idx === -1) return null;
      
      const updatedBook = {
        ...books[idx],
        ...updatedFields,
        price: updatedFields.price !== undefined ? parseFloat(updatedFields.price) : books[idx].price,
        stock: updatedFields.stock !== undefined ? parseInt(updatedFields.stock) : books[idx].stock
      };
      
      updatedBook.status = updatedBook.stock > 0 ? 'Active' : 'Inactive';
      books[idx] = updatedBook;
      setDBItem('books', books);
      return updatedBook;
    },
    deleteBook: function (id) {
      const books = this.getBooks();
      const filtered = books.filter(b => b.id !== id);
      setDBItem('books', filtered);
      return true;
    },

    // CUSTOMERS
    getCustomers: function () {
      return getDBItem('customers') || [];
    },
    getCustomerById: function (id) {
      return this.getCustomers().find(c => c.id === id);
    },
    updateCustomer: function (id, updatedFields) {
      const customers = this.getCustomers();
      const idx = customers.findIndex(c => c.id === id);
      if (idx === -1) return null;

      const updated = { ...customers[idx], ...updatedFields };
      customers[idx] = updated;
      setDBItem('customers', customers);
      return updated;
    },

    // ORDERS
    getOrders: function () {
      return getDBItem('orders') || [];
    },
    getOrderById: function (id) {
      return this.getOrders().find(o => o.id === id);
    },
    addOrder: function (orderData) {
      const orders = this.getOrders();
      const nextIdNum = orders.length > 0 ? Math.max(...orders.map(o => parseInt(o.id.split('-')[1]))) + 1 : 1;
      const nextId = `ORD-${String(nextIdNum).padStart(3, '0')}`;
      
      const newOrder = {
        id: nextId,
        customerId: orderData.customerId,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        date: new Date().toISOString().split('T')[0],
        amount: parseFloat(orderData.amount) || 0,
        status: orderData.status || 'Pending',
        paymentMethod: orderData.paymentMethod || 'Credit Card',
        items: orderData.items || [],
        shippingAddress: orderData.shippingAddress || 'No Address Provided',
        trackingNumber: null
      };

      orders.unshift(newOrder);
      setDBItem('orders', orders);
      
      // Update customer stats
      const customers = this.getCustomers();
      const customer = customers.find(c => c.id === orderData.customerId);
      if (customer) {
        customer.ordersCount += 1;
        customer.totalSpent = Math.round((customer.totalSpent + newOrder.amount) * 100) / 100;
        setDBItem('customers', customers);
      }

      return newOrder;
    },
    updateOrderStatus: function (id, status) {
      const orders = this.getOrders();
      const idx = orders.findIndex(o => o.id === id);
      if (idx === -1) return null;

      orders[idx].status = status;
      if (status === 'Dispatched' && !orders[idx].trackingNumber) {
        orders[idx].trackingNumber = `TRK${Math.floor(100000000 + Math.random() * 900000000)}`;
      }
      setDBItem('orders', orders);
      return orders[idx];
    },

    // CATEGORIES
    getCategories: function () {
      return getDBItem('categories') || [];
    },
    addCategory: function (cat) {
      const categories = this.getCategories();
      if (categories.includes(cat)) return false;
      categories.push(cat);
      setDBItem('categories', categories);
      return true;
    },
    deleteCategory: function (cat) {
      const categories = this.getCategories();
      const filtered = categories.filter(c => c !== cat);
      setDBItem('categories', filtered);
      return true;
    },

    // NOTIFICATIONS
    getNotifications: function () {
      return getDBItem('notifications') || [];
    },
    markNotificationRead: function (id) {
      const notifications = this.getNotifications();
      const idx = notifications.findIndex(n => n.id === id);
      if (idx !== -1) {
        notifications[idx].read = true;
        setDBItem('notifications', notifications);
      }
      return notifications;
    },
    addNotification: function (type, title, message) {
      const notifications = this.getNotifications();
      const nextId = `NTF-${String(notifications.length + 1).padStart(3, '0')}`;
      const newNotif = {
        id: nextId,
        type,
        title,
        message,
        time: 'Just now',
        read: false
      };
      notifications.unshift(newNotif);
      setDBItem('notifications', notifications);
      return newNotif;
    },

    // PROFILE
    getAdminProfile: function () {
      return getDBItem('profile');
    },
    updateAdminProfile: function (profileData) {
      const profile = this.getAdminProfile();
      const updated = { ...profile, ...profileData };
      setDBItem('profile', updated);
      return updated;
    },

    // SETTINGS
    getSettings: function () {
      return getDBItem('settings');
    },
    updateSettings: function (settingsData) {
      const settings = this.getSettings();
      const updated = { ...settings, ...settingsData };
      setDBItem('settings', updated);
      return updated;
    },

    // CALCULATED ANALYTICS FOR DASHBOARD & GRAPHING
    getAnalytics: function () {
      const books = this.getBooks();
      const orders = this.getOrders().filter(o => o.status !== 'Cancelled');
      const allOrders = this.getOrders();
      const customers = this.getCustomers();

      // Total Revenues
      const totalRevenue = Math.round(orders.reduce((sum, o) => sum + o.amount, 0) * 100) / 100;
      
      // Monthly Sales Distribution (last 6 months)
      // Grouping orders in JS dynamically
      const months = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
      const monthlySalesMap = {};
      months.forEach(m => { monthlySalesMap[m] = { revenue: 0, orders: 0 }; });

      // Hardcoded base months for realism
      monthlySalesMap['Dec'] = { revenue: 7850.40, orders: 198 };
      monthlySalesMap['Jan'] = { revenue: 9230.15, orders: 220 };
      monthlySalesMap['Feb'] = { revenue: 8400.90, orders: 205 };
      monthlySalesMap['Mar'] = { revenue: 11450.60, orders: 280 };
      monthlySalesMap['Apr'] = { revenue: 13900.20, orders: 310 };
      monthlySalesMap['May'] = { revenue: 0, orders: 0 }; // Will calculate below

      allOrders.forEach(o => {
        // Simple map check (all seeded order dates map around April/May 2026)
        const dateObj = new Date(o.date);
        const orderMonth = dateObj.toLocaleString('default', { month: 'short' });
        if (monthlySalesMap[orderMonth] !== undefined) {
          if (o.status !== 'Cancelled') {
            monthlySalesMap[orderMonth].revenue += o.amount;
          }
          monthlySalesMap[orderMonth].orders += 1;
        }
      });

      // Round calculations
      const salesByMonth = Object.keys(monthlySalesMap).map(m => ({
        month: m,
        revenue: Math.round(monthlySalesMap[m].revenue * 100) / 100,
        orders: monthlySalesMap[m].orders
      }));

      // Category metrics
      const categorySales = {};
      orders.forEach(order => {
        order.items.forEach(item => {
          const book = books.find(b => b.id === item.bookId);
          if (book) {
            categorySales[book.category] = (categorySales[book.category] || 0) + (item.price * item.quantity);
          }
        });
      });
      const categoriesChartData = Object.keys(categorySales).map(cat => ({
        category: cat,
        sales: Math.round(categorySales[cat] * 100) / 100
      }));

      // Bestsellers calculations
      const bookSalesCount = {};
      orders.forEach(order => {
        order.items.forEach(item => {
          bookSalesCount[item.bookId] = (bookSalesCount[item.bookId] || 0) + item.quantity;
        });
      });
      const bestSellers = Object.keys(bookSalesCount)
        .map(bookId => {
          const book = books.find(b => b.id === bookId);
          return {
            bookId,
            title: book ? book.title : 'Unknown Title',
            author: book ? book.author : 'Unknown Author',
            category: book ? book.category : 'Fiction',
            cover: book ? book.cover : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=200&q=80',
            price: book ? book.price : 0,
            salesCount: bookSalesCount[bookId],
            totalRevenue: Math.round((book ? book.price : 0) * bookSalesCount[bookId] * 100) / 100
          };
        })
        .sort((a, b) => b.salesCount - a.salesCount)
        .slice(0, 5);

      // Inventory alerts
      const lowStockThreshold = this.getSettings().lowStockThreshold;
      const lowStockBooks = books.filter(b => b.stock > 0 && b.stock <= lowStockThreshold);
      const outOfStockBooks = books.filter(b => b.stock === 0);

      return {
        totalRevenue,
        salesByMonth,
        categoriesChartData,
        bestSellers,
        lowStockCount: lowStockBooks.length,
        outOfStockCount: outOfStockBooks.length,
        orderStatusDistribution: {
          Pending: allOrders.filter(o => o.status === 'Pending').length,
          Confirmed: allOrders.filter(o => o.status === 'Confirmed').length,
          Dispatched: allOrders.filter(o => o.status === 'Dispatched').length,
          Delivered: allOrders.filter(o => o.status === 'Delivered').length,
          Cancelled: allOrders.filter(o => o.status === 'Cancelled').length
        }
      };
    }
  };

})();
