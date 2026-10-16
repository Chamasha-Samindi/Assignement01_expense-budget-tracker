# 💰 Full-Stack Expense & Budget Tracker

A complete full-stack web application built using the MERN stack (MongoDB, Express.js, React, Node.js) to help users manage their personal finances securely and efficiently.

## ✨ Features

*   **Secure Authentication:** User login and registration system using JSON Web Tokens (JWT) and securely hashed passwords (bcrypt).
*   **Data Isolation:** Each user has their own secure dashboard. Transactions and budgets are strictly linked to the logged-in user.
*   **Transaction Management:** Add, view, and delete daily income and expenses.
*   **Budget Planning:** Set specific monthly budget limits for different categories (Food, Transport, Bills, etc.) and track progress via visual indicators.
*   **Advanced Filtering:** Filter transaction history by specific categories and months.
*   **Dynamic Dashboard:** Real-time calculation of total balance, total income, and total expenses.

## 🛠️ Tech Stack

*   **Frontend:** React.js, CSS
*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB Atlas (Mongoose)
*   **Authentication:** JWT (JSON Web Tokens), bcryptjs

## 🚀 How to Run Locally

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed and a MongoDB Atlas account setup.

### 2. Backend Setup
1. Navigate to the server directory: `cd server`
2. Install dependencies: `npm install`
3. Create a `.env` file in the `server` directory and add your credentials:
   ```env
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key_here