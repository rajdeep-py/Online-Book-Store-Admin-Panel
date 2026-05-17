const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'assets', 'data');

// Helper to format dates
function getPastDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0];
}

// 1. GENERATE BOOKS (30 Books)
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
  
  // Set explicit stocks: 2 with low stock, 1 out of stock
  let stock = Math.floor(Math.random() * 80) + 15;
  if (idNum === 5) stock = 3;  // Low stock
  if (idNum === 12) stock = 0; // Out of stock
  if (idNum === 25) stock = 5; // Low stock

  // Random cover selection
  const cover = covers[idx % covers.length];

  return {
    id,
    title: template.title,
    author: template.author,
    category: template.category,
    price: template.price,
    stock,
    status: stock === 0 ? 'Inactive' : 'Active',
    cover,
    description: `A masterfully written piece by ${template.author} exploring the concepts of ${template.category.toLowerCase()}. A must-read book that has captivated millions of readers worldwide.`,
    publisher: 'Book Heaven Press',
    publishDate: getPastDate(Math.floor(Math.random() * 1000) + 200),
    isbn: `978-3-16-14841${idNum}`
  };
});

// 2. GENERATE CUSTOMERS (20 Customers)
const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

const customers = [];
for (let i = 0; i < 20; i++) {
  const id = `CUST-${String(i + 1).padStart(3, '0')}`;
  const firstName = firstNames[i];
  const lastName = lastNames[i % lastNames.length];
  const name = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
  const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;
  
  // Join dates between 150 days ago and 5 days ago
  const joinDate = getPastDate(Math.floor(Math.random() * 145) + 5);

  customers.push({
    id,
    name,
    email,
    avatar,
    phone: `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    address: `${Math.floor(Math.random() * 900) + 100} Main Street, Apt ${Math.floor(Math.random() * 30) + 1}, New York, NY 10001`,
    ordersCount: 0, // Will be computed from orders
    totalSpent: 0,  // Will be computed from orders
    status: i === 15 ? 'Suspended' : 'Active', // One suspended customer
    joinDate
  });
}

// 3. GENERATE ORDERS (50 Orders)
const orderStatuses = ['Pending', 'Confirmed', 'Dispatched', 'Delivered', 'Cancelled'];
const paymentMethods = ['Credit Card', 'PayPal', 'Stripe', 'Cash on Delivery'];

const orders = [];
for (let i = 0; i < 50; i++) {
  const id = `ORD-${String(i + 1).padStart(3, '0')}`;
  
  // Pick random customer
  const custIdx = Math.floor(Math.random() * customers.length);
  const customer = customers[custIdx];
  
  // Select items: 1 to 4 random books
  const itemsCount = Math.floor(Math.random() * 3) + 1;
  const items = [];
  let amount = 0;
  
  const selectedBookIndices = [];
  while (selectedBookIndices.length < itemsCount) {
    const rIdx = Math.floor(Math.random() * books.length);
    if (!selectedBookIndices.includes(rIdx)) {
      selectedBookIndices.push(rIdx);
    }
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
  
  // Update customer's metrics
  customer.ordersCount += 1;
  customer.totalSpent += amount;

  // Determine status (delivered is most common)
  let status = 'Delivered';
  const rand = Math.random();
  if (rand < 0.08) status = 'Pending';
  else if (rand < 0.16) status = 'Confirmed';
  else if (rand < 0.25) status = 'Dispatched';
  else if (rand < 0.32) status = 'Cancelled';
  
  // Orders spread over last 45 days. Order ORD-050 is the newest, ORD-001 is oldest.
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

// Format double totals in customers
customers.forEach(c => {
  c.totalSpent = Math.round(c.totalSpent * 100) / 100;
});

// 4. GENERATE ANALYTICS
const salesByMonth = [
  { month: 'Dec', revenue: 7850.40, orders: 198 },
  { month: 'Jan', revenue: 9230.15, orders: 220 },
  { month: 'Feb', revenue: 8400.90, orders: 205 },
  { month: 'Mar', revenue: 11450.60, orders: 280 },
  { month: 'Apr', revenue: 13900.20, orders: 310 },
  { month: 'May', revenue: 15640.85, orders: 365 }
];

const orderStatusDistribution = {
  Pending: orders.filter(o => o.status === 'Pending').length,
  Confirmed: orders.filter(o => o.status === 'Confirmed').length,
  Dispatched: orders.filter(o => o.status === 'Dispatched').length,
  Delivered: orders.filter(o => o.status === 'Delivered').length,
  Cancelled: orders.filter(o => o.status === 'Cancelled').length
};

const categorySales = {};
orders.forEach(order => {
  if (order.status !== 'Cancelled') {
    order.items.forEach(item => {
      const book = books.find(b => b.id === item.bookId);
      if (book) {
        categorySales[book.category] = (categorySales[book.category] || 0) + (item.price * item.quantity);
      }
    });
  }
});
const categoriesChartData = Object.keys(categorySales).map(cat => ({
  category: cat,
  sales: Math.round(categorySales[cat] * 100) / 100
}));

// Find best sellers by tracking books sold count
const bookSalesCount = {};
orders.forEach(order => {
  if (order.status !== 'Cancelled') {
    order.items.forEach(item => {
      bookSalesCount[item.bookId] = (bookSalesCount[item.bookId] || 0) + item.quantity;
    });
  }
});
const bestSellers = Object.keys(bookSalesCount)
  .map(bookId => {
    const book = books.find(b => b.id === bookId);
    return {
      bookId,
      title: book ? book.title : 'Unknown Book',
      author: book ? book.author : 'Unknown Author',
      category: book ? book.category : 'General',
      cover: book ? book.cover : '',
      price: book ? book.price : 0,
      salesCount: bookSalesCount[bookId],
      totalRevenue: Math.round((book ? book.price : 0) * bookSalesCount[bookId] * 100) / 100
    };
  })
  .sort((a, b) => b.salesCount - a.salesCount)
  .slice(0, 5);

const analytics = {
  totalRevenue: orders.reduce((sum, o) => o.status !== 'Cancelled' ? sum + o.amount : sum, 0),
  salesByMonth,
  orderStatusDistribution,
  categoriesChartData,
  bestSellers
};
analytics.totalRevenue = Math.round(analytics.totalRevenue * 100) / 100;

// 5. GENERATE NOTIFICATIONS (10 Notifications)
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

// Write the files
fs.writeFileSync(path.join(DATA_DIR, 'books.json'), JSON.stringify(books, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'customers.json'), JSON.stringify(customers, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'orders.json'), JSON.stringify(orders, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'analytics.json'), JSON.stringify(analytics, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'notifications.json'), JSON.stringify(notifications, null, 2));

console.log('Successfully generated books.json, customers.json, orders.json, analytics.json, notifications.json in assets/data/!');
