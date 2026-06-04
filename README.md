# 📚 BookHeaven - Admin Console Frontend

**A robust, high-performance administrative control panel for the BookHeaven e-commerce platform.**

## 📖 Table of Contents
1. [Project Overview](#1-project-overview)
2. [Key Features Checklist](#2-key-features-checklist)
3. [File & Directory Structure](#3-file--directory-structure)
4. [Core Javascript Modules & Functions](#4-core-javascript-modules--functions)
5. [Backend Integration Details](#5-backend-integration-details)
6. [Developer Team](#6-developer-team)
7. [Future Implementations](#7-future-implementations)

---

## 1. Project Overview
The BookHeaven Admin Console is a production-ready storefront control panel. It is built strictly using **HTML5, CSS3, and Vanilla JavaScript (ES6+)**—avoiding all heavy external frameworks (like React, Angular, or Vue). It boasts a premium, high-contrast HSL glassmorphic design system tailored for operational efficiency, complete with a native Light/Dark theme switcher and an interactive stateful mock database.

---

## 2. Key Features Checklist
- **Executive Dashboard**: Features KPI metric counters, revenue trends via Chart.js, recent transaction logs, and real-time activity timelines.
- **Order Fulfillment Center**: Aggregates all orders into horizontal status tabs (*Pending, Confirmed, Dispatched, Delivered, Cancelled*) with an interactive state-machine.
- **Book Catalog CRUD**: Allows administrators to view, add, modify, and delete books in the catalog using dynamic form wizards and instant image previews.
- **Customer Registry**: Paginated records roster supporting text searches and detailed customer bios showing total lifetime spend and historical transactions.
- **Inventory Warnings**: Highlights low-stock and out-of-stock items, complete with quick-action "Restock" popups.
- **Sales Analytics**: Line plots, category revenue distributions, and segment performance indicators powered by Chart.js.
- **Global Theme Switcher**: Integrates a seamless navbar toggle that swaps layout HSL variables globally (Dark Mode / Light Mode) and saves preferences.

---

## 3. File & Directory Structure
```text
admin_frontend/
├── index.html                   # Executive Dashboard Overview
├── login.html                   # Secure Admin Authorization Gate
├── customers.html               # Customers Paginated Roster
├── customer-details.html        # Detailed Customer Bio Profile
├── orders.html                  # Order Fulfillment Processing Table
├── order-details.html           # Single Order Invoice & Transitions
├── books.html                   # Book Catalog Registry Grid
├── add-book.html                # Add Catalog Title Form Wizard
├── edit-book.html               # Modify Existing Book Details Form
├── analytics.html               # Sales Graphs & Progression Reports
├── inventory.html               # Low Stock Level Warning Center
├── portfolio.html               # Specialized Portfolio Management
├── components/                  # Reusable HTML Component Templates
│   ├── sidebar.html             # Layout Navigation Drawer
│   ├── navbar.html              # Sticky Header with Notifications
│   ├── footer.html              # Brand Footer
│   ├── loader.html              # Global Screen Loading spinner overlay
│   └── modal.html & toast.html  # Dynamic interactive elements
└── assets/                      
    ├── images/                  # Static Graphic Assets and Icons
    ├── css/                     # Modular Stylesheets (dashboard, charts, forms, animations)
    └── js/                      # Modular JavaScript Controllers
```

---

## 4. Core Javascript Modules & Functions

The logic of the administrative panel is separated into distinct ES6 modules to ensure maximum maintainability.

### `api.js` (The Hybrid Data Engine)
Acts as the Relational API Bridge.
- `API.fetchData()`: Base utility mapping REST calls to the Spring/Tomcat backend.
- **Stateful Mocking**: If the live backend is unreachable, the system catches the failure and falls back to a relational `localStorage` database, instantly seeding 30 books, 20 customers, and 50 orders so development can continue seamlessly.

### `utils.js` (Global UI Utilities)
Handles reusable interface interactions:
- `window.showToast(message, type)`: Spawns non-blocking floating notifications (`success`, `warning`, `danger`).
- `window.showLoader()` / `hideLoader()`: Manages full-screen loading states.
- `window.createModal(options)`: Spawns accessible dynamic modals with custom callback-bound action buttons (used heavily for delete confirmations).
- `window.loadCommonComponents()`: Injects shared components (Sidebar, Navbar). Contains an offline bypass for CORS issues over the `file://` protocol.

### E-Commerce Controllers
- **`dashboard.js`**: Binds database metrics to the top KPI cards and generates the Recent Orders table.
- **`books.js`**: Controls the Book Catalog CRUD interface, handling search filtration and form processing for `add-book` and `edit-book`.
- **`orders.js`**: Implements the state machine for order fulfillment (advancing order statuses and triggering notification toasts).
- **`customers.js`**: Populates the customer registry, handles pagination, and fetches individual customer transaction ledgers.
- **`charts.js` & `analytics.js`**: Wrappers configuring and rendering responsive `Chart.js` canvases for sales tracking.
- **`inventory.js`**: Evaluates stock levels and triggers the restock flow.

---

## 5. Backend Integration Details

- **Target Backend**: Designed for a Java Spring Boot / Tomcat 11 stack running on `http://localhost:8080/book_store_backend`.
- **Authentication (`auth.js`)**: Uses a Token Guard mechanism. The system expects a standard `jsessionid` or JWT. Unauthenticated attempts directly redirect the user to `login.html`.
- **CORS & Offline Capabilities**: The frontend incorporates a robust try/catch layer in `api.js`. It checks for network failures or `file://` protocols and hot-swaps to offline mode, making the frontend completely standalone for local testing and UX reviews.

---

## 🚀 Running the Frontend Locally (Windows & macOS)

> ⚠️ **IMPORTANT**: Do **NOT** open `index.html` by double-clicking the file in your file explorer! Doing so will open the site using the `file:///` protocol, which causes modern browsers to block API requests and 3D model loads due to strict **CORS** security policies.

To run the Admin Panel correctly:
1. Open the `Online-Book-Store-Admin-Panel` folder in **Visual Studio Code**.
2. Install the **"Live Server"** extension (by Ritwick Dey) from the VS Code Extensions panel.
3. Right-click on `index.html` (or `login.html`) and select **"Open with Live Server"**.
4. The panel will open in your browser at `http://127.0.0.1:5500`, bypassing all CORS and file protocol restrictions so it can freely talk to the Java backend!

## 6. Developer Team

- **Raj** - *Head of Curation*
  - Provides the structural vision for what catalog data the administrative panel needs to surface and manage.
- **Rajdeep Dey** - *Lead Developer*
  - Designed the system architecture, built the Vanilla JS stateful `localStorage` mock database, and constructed the API bridges and modular JavaScript controllers.
- **Srijani** - *Customer Experience*
  - Designed the admin panel's glassmorphic user interface, implemented the dark mode color tokens, and optimized the responsive charting logic.

---

## 7. Future Implementations (Roadmap)

1. **Role-Based Access Control (RBAC)**:
   Implement fine-grained permissions so staff members have access to inventory or orders, but only Super Admins can access sales analytics or modify user roles.
2. **Bulk Data Export/Import**:
   Add functionality via a library like `SheetJS` to allow admins to export order histories to CSV/Excel, and import new book catalogs natively via the dashboard.
3. **Advanced Order Logistics Integration**:
   Connect the order fulfillment state machine (`orders.js`) to real-world carrier APIs (like FedEx or UPS) to pull automated tracking updates instead of manual transitions.
4. **Real-time WebSocket Notifications**:
   Upgrade the polling notification system to a push-based WebSocket connection, alerting admins instantly when a new order is placed by a user on the consumer frontend.
5. **Dynamic Dashboard Widgets**:
   Allow admins to drag, drop, and rearrange the metric cards and charts on `index.html` to create a customized workspace view.
