# StockFlow — Smart Inventory & Supply Chain Monitoring

StockFlow is a browser-based inventory and supply-chain monitoring dashboard built with HTML, CSS, JavaScript, Firebase Authentication, and Cloud Firestore. It brings stock movement, inventory records, supplier performance, reliability reviews, and activity logs into one interface.

## Features

- **Authentication:** Register and sign in with Firebase Authentication.
- **Role selection:** Accounts can be registered as staff, admin, or supplier.
- **Inventory management:** Record stock IN and stock OUT movements with item, category, quantity, warehouse, and supplier details.
- **Warehouse filtering:** Filter inventory by warehouse.
- **Analytics:** Visualize stock movement using Chart.js.
- **Supplier performance:** View supplier stock movement and performance scores.
- **Reliability reviews:** Submit supplier reviews covering product quality, service quality, feedback, and remarks.
- **Activity logs:** Review inventory activity recorded by the application.

## Tech Stack

- HTML5
- CSS3
- JavaScript (ES modules)
- Firebase Authentication
- Cloud Firestore
- Chart.js

## Project Structure

```text
StockFlow/
├── index.html          # Login page
├── register.html       # Account registration page
├── dashboard.html      # Inventory and analytics dashboard
├── css/
│   └── style.css       # Application styles
└── js/
    ├── auth.js         # Registration, login, and logout
    ├── dashboard.js    # Dashboard, inventory, analytics, and reviews
    └── firebase.js     # Firebase app, Auth, and Firestore setup
```

## Setup and Run Locally

### 1. Download or clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/StockFlow.git
cd StockFlow
```

Replace `YOUR-USERNAME` with your GitHub username. If you downloaded the ZIP instead, extract it and open the `StockFlow` folder.

### 2. Configure Firebase

The application uses Firebase Authentication and Cloud Firestore.

1. Open the [Firebase Console](https://console.firebase.google.com/) and create or select a Firebase project.
2. Enable **Email/Password** under Authentication sign-in providers.
3. Create a Cloud Firestore database.
4. Register a web app in the Firebase project.
5. Update the `firebaseConfig` object in `js/firebase.js` with your project's web-app configuration.
6. Configure Firestore Security Rules so users can access only the data permitted by your application and roles. Do not rely on frontend role selection as an authorization boundary.

### 3. Start a local web server

Because the JavaScript files use ES modules and Firebase imports, open the project through a local HTTP server rather than opening the HTML file directly.

In VS Code, install the **Live Server** extension if needed, then right-click `index.html` and choose **Open with Live Server**. Alternatively, use any local static HTTP server.

### 4. Use the application

1. Open `index.html`.
2. Register an account on the registration page.
3. Sign in and use the dashboard to manage stock, review analytics, view suppliers, and record reliability reviews.

The application requires a correctly configured Firebase project and suitable Firestore rules to operate fully.

## Security Notes

- Never commit private credentials, service-account JSON files, or secrets.
- Firebase web configuration is intended to be used by client applications, but it is not a substitute for properly configured Firebase Authentication and Firestore Security Rules.
- Before deploying publicly, review role permissions, database rules, and access to inventory and supplier records.

## Notes

This repository contains the existing static frontend and Firebase client integration. It does not include a separate server-side backend or package manager configuration.
