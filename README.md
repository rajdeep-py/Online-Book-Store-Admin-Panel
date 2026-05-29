# 📚 Book Heaven - Online Bookstore Admin Console

Welcome to the official administrative console frontend codebase for the **Book Heaven Bookstore Management System**. 

This production-ready storefront control panel is built using **ONLY HTML5, CSS3, and Vanilla JavaScript (ES6+)** with no external frameworks (React/Vue/Angular are strictly avoided) or CSS styling engines (TailwindCSS is avoided). The portal boasts a premium, high-contrast HSL glassmorphism design system inspired by Shopify Admin, Stripe, and Vercel, complete with a stateful relational local database and a native light/dark theme switcher.

---

## 📸 Visual Interface Preview

Below is a live screenshot of the console's **Stock Levels Warning Center** showing custom styling, Outfit/Inter typography, stats metrics cards, horizontal filter tabs, status badges, and action triggers under the dark mode theme:

![Stock Levels Warning Center Screenshot](.system_generated/click_feedback/click_feedback_1779030550378.png)

---

## ✨ Core Features Checklist

The bookstore admin panel is divided into 15 cohesive administrative views:

- [x] **Executive Dashboard (`index.html`)**: Features 8 high-contrast metrics counters, revenue trends, status distributions via Chart.js, recent transactions, best sellers list, and real-time activity timelines.
- [x] **Theme Switcher**: Integrates a seamless navbar toggle that swaps layout HSL variables globally (Dark Mode / Light Mode) and saves preferences in the database to prevent reload flashes.
- [x] **Customer Registry (`customers.html`)**: Paginated records roster supporting text searches, active/suspended filtration, and quick account suspensions.
- [x] **Customer Details (`customer-details.html`)**: Presents detailed shipping registers, total spent summaries, join timestamps, and a complete historical transaction ledger.
- [x] **Order Fulfillment Center (`orders.html`)**: Aggregates all orders inside horizontal status tabs: *All, Pending, Confirmed, Dispatched, Delivered, and Cancelled*.
- [x] **Invoice Processing (`order-details.html`)**: Details purchase invoices, payment modes, tracking numbers, and interactive status transition triggers (*Fulfillment State Machine*).
- [x] **Book Catalog CRUD (`books.html`)**: Coordinates grid catalog, search filters, and confirmation modal deletion triggers.
- [x] **Dynamic Form Wizards (`add-book.html`, `edit-book.html`)**: Incorporates standard input validators (min lengths, positive checks) and instant cover image previews.
- [x] **Genre Categorizer (`categories.html`)**: Registers active genres, details linked book counts, and blocks category deletions if books are still linked.
- [x] **Sales Analytics (`analytics.html`)**: Renders Line plot summaries, Category revenue charts, and Category segment performance indicators.
- [x] **Inventory Warnings (`inventory.html`)**: Highlights out-of-stock and low-stock items with quick-action Restock Popups.
- [x] **Audit Log Inbox (`notifications.html`)**: Displays system notifications with type-specific indicators and unread count clears.
- [x] **Preferences panel (`settings.html`)**: Customizes site title, low stock limits, active currency symbol, and theme settings.
- [x] **Admin Account Bio (`profile.html`)**: Modifies administrator names, password credentials, and summaries with live visual updates.

---

## 🛠 Developer Guide & Internal Architecture

### 1. Architecture Philosophy
1. **Modularity**: HTML, CSS, and JS are split into highly cohesive, single-responsibility files.
2. **Offline/Local Resilience**: The app functions flawlessly over the `file://` protocol without a web server.
3. **Hybrid API Bridge**: seamlessly switches between a live Jakarta Tomcat 11 backend and a local `localStorage` stateful cache.

### 2. The Hybrid API Bridge (`api.js`)
To operate out-of-the-box in double-click local mode (`file://` scheme) without requiring an active backend or a SQL engine, the portal integrates an interactive stateful API layer inside [api.js](assets/js/api.js):
- **Fetch Attempt**: The app attempts to fetch data from the Tomcat backend using session cookies (`jsessionid`).
- **Fallback Catch**: If the fetch fails (CORS error, server offline, or running locally), the `.catch()` block intercepts the failure and retrieves data from `localStorage`.
- **Seeding**: On first load, if `localStorage` is empty, it automatically seeds 30 Books, 20 Customers, 50 Orders, and Notifications.

### 3. Global UI Utilities (`utils.js`)
To keep the application DRY, [utils.js](assets/js/utils.js) exposes global window functions:
- **`window.showToast(message, type)`**: Spawns non-blocking floating notifications (`success`, `warning`, `danger`, `info`).
- **`window.showLoader()` & `window.hideLoader()`**: Manages a full-screen loading overlay.
- **`window.createModal(options)`**: Spawns accessible, dynamic modals with custom titles, HTML bodies, and callback-bound action buttons.
- **`window.loadCommonComponents(activePage)`**: Hybrid loader for Partials (Sidebar, Navbar, Footer). Standard multi-page dashboards use AJAX to fetch headers and footers. However, when files are opened directly from a local disk (`file://`), browsers block local requests due to CORS security rules. This function checks the active protocol; if `file://` is detected, it instantly injects built-in ES6 template literals instead, enabling a **server-free, double-click preview**.

---

## 📂 Codebase File Directory

The project workspace is cleanly structured as follows:

```
admin_frontend/
├── index.html                   # Homepage Dashboard Overview
├── login.html                   # Admin Authorization Gate
├── customers.html               # Customers Paginated Roster
├── customer-details.html        # Detailed Customer Bio Profile
├── orders.html                  # Order Fulfillment Processing Table
├── order-details.html           # Single Order Invoice & Transitions
├── books.html                   # Book Catalog Registry Grid
├── add-book.html                # Add Catalog Title Wizard
├── edit-book.html               # Modify Book Details Form
├── categories.html              # Genre Categories Coordinator
├── analytics.html               # Sales Graphs & Progression Reports
├── inventory.html               # Low Stock Level Warning Center
├── notifications.html           # Central Activity Inbox Logs
├── settings.html                # Admin System Preferences Panel
├── profile.html                 # Super Administrator bio settings
├── README.md                    # Project Manual & Setup Guide
│
├── components/                  # Reusable HTML Component Templates
│   ├── sidebar.html             # Layout Navigation Drawer
│   ├── navbar.html              # Sticky Header with Bell & Search
│   ├── footer.html              # Brand Footer
│   ├── stats-card.html          # Metric card template skeleton
│   ├── order-table.html         # Transaction grid skeleton
│   ├── customer-table.html      # Customer list skeleton
│   ├── loader.html              # Global Screen Loading spinner overlay
│   ├── modal.html               # Reusable dynamic Modal popup container
│   └── toast.html               # Floating micro-notifications container
│
├── scratch/                     # Seed Files Generators & Mock Data
│   └── seed_generator.js        # Node.js compiler scripts creating JSON databases
│
└── assets/                      # Stylesheets, Scripts, and Static Seeds
    ├── images/                  # Static Graphic Assets
    ├── data/                    # Physical Seeding databases JSON files
    │   ├── books.json           # 30 starting Books
    │   ├── customers.json       # 20 starting Customers
    │   ├── orders.json          # 50 starting Orders
    │   ├── analytics.json       # Compiled aggregate trends
    │   └── notifications.json   # Starting unread alerts
    │
    ├── css/                     # Premium Design Stylesheets
    │   ├── utilities.css        # Visual Tokens, Color Resets, Badge styles
    │   ├── animations.css       # Keyframes for loaders, slides, and pulses
    │   ├── style.css            # Base Layouts, Breadcrumbs, Buttons, Modals
    │   ├── sidebar.css          # Navigation drawers & Collapsible icons
    │   ├── navbar.css           # Sticky Top-Header, global Search bar
    │   ├── cards.css            # Metric panels & List summaries
    │   ├── tables.css           # Scrollable grids, Pagination page controls
    │   ├── forms.css            # Grid inputs, validations error markers
    │   ├── dashboard.css        # Bestseller indicators, pulsators, timeline links
    │   ├── charts.css           # Aspect ratio charts grids
    │   ├── analytics.css        # Segment sales progression bars
    │   └── responsive.css       # Responsive breakpoints for mobile screens
    │
    └── js/                      # Modular JavaScript Controllers
        ├── api.js               # Relational LocalStorage Mock Database CRUD
        ├── utils.js             # UI helpers (toasts, modals) and CORS Fallback Loader
        ├── auth.js              # Token Guard checking Session credentials
        ├── validation.js        # Dynamic HTML form validators
        ├── main.js              # Entry routing co-ordinator
        ├── dashboard.js         # Dashboard page controller (binds counts)
        ├── charts.js            # Chart.js rendering wrapper configurations
        ├── customers.js         # Customers page search & profile loader
        ├── orders.js            # Orders tabs and state machine fulfillment
        ├── books.js             # Books catalog CRUD, live cover previewers
        ├── analytics.js         # Sales graphs aggregates updates
        ├── inventory.js         # Stock alerts lists, quick Restock Popups
        └── notifications.js     # Activity inbox clearings
```

---

## 🚀 Cloning & Local Execution Guide

### 1. Clone the Repository
Clone the codebase to your local workspace using Git:
```bash
git clone https://github.com/rajdeep-py/Online-Book-Store-Admin-Panel.git
```

### 2. Run the Portal

#### Option A: Zero-Installation Double-Click (Local Disk)
Navigate into the cloned directory and simply **double-click** the [login.html](login.html) file to launch it in any modern web browser.
*   Because of the built-in hybrid CORS-resilient loader, all reusable components (Sidebar, Navbar, and Footer) will render instantly without a local server!

#### Option B: Lightweight Local Server (Recommended)
If you prefer running the project over an HTTP network server to test modular imports, use one of the following commands:
```bash
# Using Node.js npx serve
npx -y serve ./

# Or using Python's built-in web server
python3 -m http.server 8000

# Or using PHP
php -S localhost:8000
```
Then, open your web browser and navigate to: `http://localhost:8000/login.html` (or the port specified by your tool).

#### Option C: Full Stack Mode (with Tomcat)
To test live API endpoints:
1. Ensure the Java Spring/Tomcat backend is running at `http://localhost:8080/book_store_backend`.
2. Serve this frontend on a local port.
3. The `api.js` endpoints will automatically hit the backend and map session cookies.

---

## 🔑 Access Credentials

To log in to the secure bookstore administrator panel:

| Username / Email | Password | Access Rights |
| :--- | :--- | :--- |
| **`admin@bookheaven.com`** | **`admin123`** | Super Administrator (Full CRUD & Fulfilment Control) |

---

## 👥 Development Team
- **Rajdeep Dey** (<rajdeep.dey.fiem.bca23@teamfuture.in>)

---

> [!NOTE]
> All files, directories, styles, and Javascript modules are **100% complete, fully modular, and production-ready**.
