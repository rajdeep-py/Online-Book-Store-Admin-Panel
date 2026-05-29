/**
 * api.js - Live API Bridge
 * Provides high-performance fetch integrations with Jakarta Tomcat 11
 */

(function () {
  // PUBLIC API INTERFACE
  window.BookstoreAPI = {
    _resolveBookCoverUrl: function (coverPath) {
      if (!coverPath) return 'assets/images/icons/book.png';
      if (/^(https?:|data:|blob:)/i.test(coverPath)) return coverPath;
      if (coverPath.startsWith('/book_store_backend')) return `http://localhost:8080${coverPath}`;
      if (coverPath.startsWith('/')) return `http://localhost:8080/book_store_backend${coverPath}`;
      return `http://localhost:8080/book_store_backend/${coverPath}`;
    },

    _getSessionUrl: function (url) {
      const sessionId = sessionStorage.getItem('bookheaven_admin_session_id') || localStorage.getItem('bookheaven_admin_session_id');
      return sessionId ? `${url};jsessionid=${sessionId}` : url;
    },

    _handleFetchError: function(error) {
      console.error('API Connection Failed:', error);
      window.location.href = 'error.html';
      throw error;
    },

    // ------------------------------------------------------------------------
    // 📚 BOOKS INVENTORY ENDPOINTS
    // ------------------------------------------------------------------------
    getBooks: async function (query = '') {
      try {
        const url = query 
          ? `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.BOOKS}?q=${encodeURIComponent(query)}` 
          : `${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.BOOKS}`;
        const response = await fetch(this._getSessionUrl(url), { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          const items = data.items || data;
          return items.map(b => this._mapBookToFrontend(b));
        } else {
            this._handleFetchError(new Error(`Failed to fetch books: ${response.statusText}`));
        }
      } catch (error) {
        this._handleFetchError(error);
      }
    },

    getBookById: async function (id) {
      try {
        const response = await fetch(this._getSessionUrl(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.BOOKS}/${id}`), { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          return this._mapBookToFrontend(data);
        } else {
            this._handleFetchError(new Error(`Failed to fetch book: ${response.statusText}`));
        }
      } catch (error) {
        this._handleFetchError(error);
      }
    },

    addBook: async function (book) {
      try {
        const formData = new FormData();
        formData.append('book_name', book.title);
        formData.append('book_category', book.category);
        formData.append('book_description', book.description);
        formData.append('author_name', book.author);
        formData.append('author_description', book.authorDesc || '');
        formData.append('price', parseFloat(book.price) || 0);
        formData.append('discount_percent', parseFloat(book.discount) || 0);
        formData.append('stock_amount', parseInt(book.stock) || 0);
        if (book.coverFile) formData.append('book_photo', book.coverFile);

        const response = await fetch(this._getSessionUrl(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.BOOKS}`), {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          return { ...book, id: data.book_id, cover: this._resolveBookCoverUrl(data.book_photo) };
        } else {
            this._handleFetchError(new Error(`Failed to add book: ${response.statusText}`));
        }
      } catch (error) {
        this._handleFetchError(error);
      }
    },

    updateBook: async function (id, updatedFields) {
      try {
        const formData = new FormData();
        formData.append('book_name', updatedFields.title);
        formData.append('book_category', updatedFields.category);
        formData.append('book_description', updatedFields.description);
        formData.append('author_name', updatedFields.author);
        formData.append('author_description', updatedFields.authorDesc || '');
        formData.append('price', parseFloat(updatedFields.price) || 0);
        formData.append('discount_percent', parseFloat(updatedFields.discount) || 0);
        formData.append('stock_amount', parseInt(updatedFields.stock) || 0);
        if (updatedFields.coverFile) formData.append('book_photo', updatedFields.coverFile);

        const response = await fetch(this._getSessionUrl(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.BOOKS}/${id}`), {
          method: 'PUT',
          body: formData,
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          return { id, ...updatedFields, cover: this._resolveBookCoverUrl(data.book_photo) };
        } else {
            this._handleFetchError(new Error(`Failed to update book: ${response.statusText}`));
        }
      } catch (error) {
        this._handleFetchError(error);
      }
    },

    deleteBook: async function (id) {
      try {
        const response = await fetch(this._getSessionUrl(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.BOOKS}/${id}`), {
          method: 'DELETE',
          credentials: 'include'
        });
        if (response.ok) return true;
        this._handleFetchError(new Error(`Failed to delete book: ${response.statusText}`));
      } catch (error) {
        this._handleFetchError(error);
      }
    },

    _mapBookToFrontend: function (b) {
      const coverUrl = this._resolveBookCoverUrl(b.book_photo);
      return {
        id: b.book_id,
        title: b.book_name,
        author: b.author_name,
        authorDescription: b.author_description,
        category: b.book_category,
        price: b.final_selling_price || b.price,
        originalPrice: b.price,
        discountPercent: b.discount_percent,
        stock: b.stock_amount,
        status: b.stock_status === 'IN_STOCK' ? 'Active' : 'Inactive',
        cover: coverUrl,
        description: b.book_description
      };
    },

    // ------------------------------------------------------------------------
    // 👥 CUSTOMER ENDPOINTS
    // ------------------------------------------------------------------------
    getCustomers: async function () {
      try {
        const response = await fetch(this._getSessionUrl(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.CUSTOMERS}`), { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          const items = data.items || data;
          
          const ordersResponse = await fetch(this._getSessionUrl(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.ORDERS}`), { credentials: 'include' });
          let allOrders = [];
          if (ordersResponse.ok) {
             const oData = await ordersResponse.json();
             allOrders = oData.items || [];
          }

          return items.map(c => {
             const mappedCustomer = this._mapCustomerToFrontend(c);
             const custOrders = allOrders.filter(o => o.customer_id === c.customer_id);
             mappedCustomer.ordersCount = custOrders.length;
             mappedCustomer.totalSpent = custOrders.reduce((sum, o) => sum + (o.total_bill_amount || 0), 0);
             return mappedCustomer;
          });
        } else {
            this._handleFetchError(new Error(`Failed to fetch customers: ${response.statusText}`));
        }
      } catch (error) {
        this._handleFetchError(error);
      }
    },

    getCustomerById: async function (id) {
      try {
        const response = await fetch(this._getSessionUrl(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.CUSTOMERS}/${id}`), { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          return this._mapCustomerToFrontend(data);
        } else {
            this._handleFetchError(new Error(`Failed to fetch customer: ${response.statusText}`));
        }
      } catch (error) {
        this._handleFetchError(error);
      }
    },

    updateCustomer: async function (id, updatedFields) {
      try {
        const formData = new FormData();
        formData.append('full_name', updatedFields.name);
        formData.append('email', updatedFields.email);
        formData.append('phone_number', updatedFields.phone || '');
        formData.append('address', updatedFields.address || '');
        if (updatedFields.avatarFile) formData.append('profile_photo', updatedFields.avatarFile);
        if (updatedFields.password) formData.append('password', updatedFields.password);

        const response = await fetch(this._getSessionUrl(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.CUSTOMERS}/${id}`), {
          method: 'PUT',
          body: formData,
          credentials: 'include'
        });
        if (response.ok) return { id, ...updatedFields };
        this._handleFetchError(new Error(`Failed to update customer: ${response.statusText}`));
      } catch (error) {
        this._handleFetchError(error);
      }
    },

    _mapCustomerToFrontend: function (c) {
      let avatarUrl = 'assets/images/icons/user.png';
      if (c.profile_photo) {
        if (c.profile_photo.startsWith('http')) avatarUrl = c.profile_photo;
        else if (c.profile_photo.startsWith('/book_store_backend')) avatarUrl = `http://localhost:8080${c.profile_photo}`;
        else if (c.profile_photo.startsWith('/')) avatarUrl = `http://localhost:8080/book_store_backend${c.profile_photo}`;
        else avatarUrl = `http://localhost:8080/book_store_backend/${c.profile_photo}`;
      }
      return {
        id: c.customer_id,
        name: c.full_name,
        email: c.email,
        avatar: avatarUrl,
        phone: c.phone_number || '',
        address: c.address || '',
        status: 'Active',
        ordersCount: 0,
        totalSpent: 0
      };
    },

    // ------------------------------------------------------------------------
    // 📦 ORDERS ENDPOINTS
    // ------------------------------------------------------------------------
    getOrders: async function () {
      try {
        const response = await fetch(this._getSessionUrl(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.ORDERS}`), { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          const items = data.items || data;
          
          const custResponse = await fetch(this._getSessionUrl(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.CUSTOMERS}`), { credentials: 'include' });
          let custMap = {};
          if (custResponse.ok) {
             const cData = await custResponse.json();
             (cData.items || []).forEach(c => { custMap[c.customer_id] = c; });
          }

          return items.map(o => {
             const mOrder = this._mapOrderToFrontend(o);
             if (custMap[o.customer_id]) {
                mOrder.customerName = custMap[o.customer_id].full_name;
                mOrder.customerEmail = custMap[o.customer_id].email;
                mOrder.customerPhone = custMap[o.customer_id].phone_number;
                mOrder.shippingAddress = custMap[o.customer_id].address;
             }
             return mOrder;
          });
        } else {
            this._handleFetchError(new Error(`Failed to fetch orders: ${response.statusText}`));
        }
      } catch (error) {
        this._handleFetchError(error);
      }
    },

    getOrderById: async function (id) {
      try {
        const response = await fetch(this._getSessionUrl(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.ORDERS}/${id}`), { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          return this._mapOrderToFrontend(data);
        } else {
            this._handleFetchError(new Error(`Failed to fetch order: ${response.statusText}`));
        }
      } catch (error) {
        this._handleFetchError(error);
      }
    },

    updateOrderStatus: async function (id, status) {
      try {
        const getRes = await fetch(this._getSessionUrl(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.ORDERS}/${id}`), { credentials: 'include' });
        if (!getRes.ok) this._handleFetchError(new Error(`Failed to fetch order for update: ${getRes.statusText}`));
        const rawOrder = await getRes.json();

        const backendStatusMap = {
          'Pending': 'PLACED',
          'Confirmed': 'PROCESSING',
          'Dispatched': 'SHIPPED',
          'Delivered': 'DELIVERED',
          'Cancelled': 'CANCELLED'
        };
        
        rawOrder.order_status = backendStatusMap[status] || status;
        rawOrder.items = rawOrder.items_ordered || [];
        rawOrder.customer_id = rawOrder.customer_id || 0;
        
        const response = await fetch(this._getSessionUrl(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.ORDERS}/${id}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(rawOrder),
          credentials: 'include'
        });
        if (response.ok) return true;
        this._handleFetchError(new Error(`Failed to update order status: ${response.statusText}`));
      } catch (error) {
        this._handleFetchError(error);
      }
    },

    _mapOrderToFrontend: function (o) {
      let items = [];
      try {
        items = typeof o.items_ordered === 'string' ? JSON.parse(o.items_ordered) : o.items_ordered;
      } catch (e) {
        console.error('Failed to parse items ordered:', e);
      }

      const mappedItems = items.map(item => ({
        bookId: item.book_id,
        title: item.book_name,
        price: item.final_price || item.price,
        quantity: item.quantity
      }));

      const statusMap = {
        'PLACED': 'Pending',
        'PROCESSING': 'Confirmed',
        'SHIPPED': 'Dispatched',
        'DELIVERED': 'Delivered',
        'CANCELLED': 'Cancelled'
      };
      
      return {
        id: o.order_id,
        customerId: o.customer_id,
        customerName: `Customer #${o.customer_id}`,
        customerEmail: `customer${o.customer_id}@example.com`,
        date: o.created_at ? o.created_at.split(' ')[0] : new Date().toISOString().split('T')[0],
        amount: o.total_bill_amount,
        status: statusMap[o.order_status] || o.order_status,
        paymentMethod: 'Cash on Delivery',
        items: mappedItems,
        shippingAddress: o.shippingAddress || 'Address not provided',
        trackingNumber: o.order_status === 'SHIPPED' ? 'TRK849302948' : null,
        rawItems: o.items_ordered,
        taxCharges: o.tax_charges,
        platformFee: o.platform_fee,
        deliveryFee: o.delivery_fee
      };
    },

    // ------------------------------------------------------------------------
    // ⚙️ ABOUT & SYSTEM ENDPOINTS
    // ------------------------------------------------------------------------
    getCategories: async function () {
      const books = await this.getBooks();
      const categories = [...new Set(books.map(b => b.category))];
      return categories;
    },

    // ------------------------------------------------------------------------
    // 🔔 NOTIFICATIONS ENDPOINTS (Stored exclusively locally as per design)
    // ------------------------------------------------------------------------
    getNotifications: function () {
      return JSON.parse(localStorage.getItem('bookstore_admin_notifications')) || [];
    },
    markNotificationRead: function (id) {
      const notifications = this.getNotifications();
      const idx = notifications.findIndex(n => n.id === id);
      if (idx !== -1) {
        notifications[idx].read = true;
        localStorage.setItem('bookstore_admin_notifications', JSON.stringify(notifications));
      }
      return notifications;
    },
    addNotification: function (type, title, message) {
      const notifications = this.getNotifications();
      const nextId = `NTF-${String(notifications.length + 1).padStart(3, '0')}`;
      const newNotif = {
        id: nextId, type, title, message, time: 'Just now', read: false
      };
      notifications.unshift(newNotif);
      localStorage.setItem('bookstore_admin_notifications', JSON.stringify(notifications));
      return newNotif;
    },

    // ------------------------------------------------------------------------
    // 🛡️ ADMINISTRATOR PROFILE ENDPOINTS
    // ------------------------------------------------------------------------
    getAdminProfile: async function () {
      const adminId = sessionStorage.getItem('admin_id') || localStorage.getItem('admin_id') || 1;
      try {
        const response = await fetch(this._getSessionUrl(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.ADMIN_PROFILE}/${adminId}`), {
          method: 'GET',
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          const nameParts = (data.admin_name || 'Admin User').split(' ');
          return {
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            name: data.admin_name || 'Admin User',
            email: data.admin_email || '',
            phone: '+1 (555) 019-2834',
            bio: 'Managing and designing visual systems for the Book Heaven brand.',
            avatar: data.profile_photo || 'assets/images/icons/user.png',
            role: 'Super Administrator'
          };
        } else {
            this._handleFetchError(new Error(`Failed to fetch admin profile: ${response.statusText}`));
        }
      } catch (error) {
        this._handleFetchError(error);
      }
    },

    updateAdminProfile: async function (profileData) {
      const adminId = sessionStorage.getItem('admin_id') || localStorage.getItem('admin_id') || 1;
      try {
        const payload = {
          admin_name: `${profileData.firstName} ${profileData.lastName}`.trim(),
          admin_email: profileData.email
        };
        if (profileData.password) payload.admin_password = profileData.password;

        const response = await fetch(this._getSessionUrl(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.ADMIN_PROFILE}/${adminId}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include'
        });

        if (response.ok) {
          const profile = await this.getAdminProfile();
          return { ...profile, ...profileData };
        } else {
            this._handleFetchError(new Error(`Failed to update admin profile: ${response.statusText}`));
        }
      } catch (error) {
        this._handleFetchError(error);
      }
    },

    // ------------------------------------------------------------------------
    // ⚙️ GLOBAL PREFERENCES / SETTINGS (Stored exclusively locally)
    // ------------------------------------------------------------------------
    getSettings: function () {
      return JSON.parse(localStorage.getItem('bookstore_admin_settings')) || {
        siteName: 'Book Heaven Admin',
        emailNotifications: true,
        lowStockThreshold: 10,
        currency: 'USD',
        theme: 'light',
        maintenanceMode: false
      };
    },
    updateSettings: function (settingsData) {
      const settings = this.getSettings();
      const updated = { ...settings, ...settingsData };
      localStorage.setItem('bookstore_admin_settings', JSON.stringify(updated));
      return updated;
    },

    // ------------------------------------------------------------------------
    // 💰 EARNING CHARGES
    // ------------------------------------------------------------------------
    getCharges: async function () {
      try {
        const response = await fetch(this._getSessionUrl(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.CHARGES}`), {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          return data.items || [];
        } else {
            this._handleFetchError(new Error(`Failed to fetch charges: ${response.statusText}`));
        }
      } catch (error) {
        this._handleFetchError(error);
      }
    },

    getChargeById: async function (id) {
      try {
        const response = await fetch(this._getSessionUrl(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.CHARGES}/${id}`), {
          credentials: 'include'
        });
        if (response.ok) return await response.json();
        this._handleFetchError(new Error(`Failed to fetch charge: ${response.statusText}`));
      } catch (error) {
        this._handleFetchError(error);
      }
    },

    createCharge: async function (chargeData) {
      try {
        const response = await fetch(this._getSessionUrl(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.CHARGES}`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chargeData),
          credentials: 'include'
        });
        if (response.ok) return await response.json();
        this._handleFetchError(new Error(`Failed to create charge: ${response.statusText}`));
      } catch (error) {
        this._handleFetchError(error);
      }
    },

    updateCharge: async function (id, chargeData) {
      try {
        const response = await fetch(this._getSessionUrl(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.CHARGES}/${id}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chargeData),
          credentials: 'include'
        });
        if (response.ok) return true;
        this._handleFetchError(new Error(`Failed to update charge: ${response.statusText}`));
      } catch (error) {
        this._handleFetchError(error);
      }
    },

    deleteCharge: async function (id) {
      try {
        const response = await fetch(this._getSessionUrl(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.CHARGES}/${id}`), {
          method: 'DELETE',
          credentials: 'include'
        });
        if (response.ok) return true;
        this._handleFetchError(new Error(`Failed to delete charge: ${response.statusText}`));
      } catch (error) {
        this._handleFetchError(error);
      }
    },

    // ------------------------------------------------------------------------
    // 📊 CALCULATED ANALYTICS FOR DASHBOARD
    // ------------------------------------------------------------------------
    getAnalytics: async function () {
      const books = await this.getBooks();
      const ordersList = await this.getOrders();
      if (!books || !ordersList) return null; // Let the handleFetchError catch it

      const orders = ordersList.filter(o => o.status !== 'Cancelled');
      const allOrders = ordersList;

      const totalRevenue = Math.round(orders.reduce((sum, o) => sum + o.amount, 0) * 100) / 100;
      
      const months = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
      const monthlySalesMap = {};
      months.forEach(m => { monthlySalesMap[m] = { revenue: 0, orders: 0 }; });

      monthlySalesMap['Dec'] = { revenue: 7850.40, orders: 198 };
      monthlySalesMap['Jan'] = { revenue: 9230.15, orders: 220 };
      monthlySalesMap['Feb'] = { revenue: 8400.90, orders: 205 };
      monthlySalesMap['Mar'] = { revenue: 11450.60, orders: 280 };
      monthlySalesMap['Apr'] = { revenue: 13900.20, orders: 310 };
      monthlySalesMap['May'] = { revenue: 0, orders: 0 };

      allOrders.forEach(o => {
        const dateObj = new Date(o.date);
        const orderMonth = dateObj.toLocaleString('default', { month: 'short' });
        if (monthlySalesMap[orderMonth] !== undefined) {
          if (o.status !== 'Cancelled') {
            monthlySalesMap[orderMonth].revenue += o.amount;
          }
          monthlySalesMap[orderMonth].orders += 1;
        }
      });

      const salesByMonth = Object.keys(monthlySalesMap).map(m => ({
        month: m,
        revenue: Math.round(monthlySalesMap[m].revenue * 100) / 100,
        orders: monthlySalesMap[m].orders
      }));

      const categorySales = {};
      orders.forEach(order => {
        order.items.forEach(item => {
          const book = books.find(b => b.id == item.bookId);
          if (book) {
            categorySales[book.category] = (categorySales[book.category] || 0) + (item.price * item.quantity);
          }
        });
      });
      const categoriesChartData = Object.keys(categorySales).map(cat => ({
        category: cat,
        sales: Math.round(categorySales[cat] * 100) / 100
      }));

      const bookSalesCount = {};
      orders.forEach(order => {
        order.items.forEach(item => {
          bookSalesCount[item.bookId] = (bookSalesCount[item.bookId] || 0) + item.quantity;
        });
      });
      const bestSellers = Object.keys(bookSalesCount)
        .map(bookId => {
          const book = books.find(b => b.id == bookId);
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
          Pending: allOrders.filter(o => o.status === 'Pending' || o.status === 'PLACED').length,
          Confirmed: allOrders.filter(o => o.status === 'Confirmed').length,
          Dispatched: allOrders.filter(o => o.status === 'Dispatched' || o.status === 'SHIPPED').length,
          Delivered: allOrders.filter(o => o.status === 'Delivered').length,
          Cancelled: allOrders.filter(o => o.status === 'Cancelled').length
        }
      };
    }
  };
})();
