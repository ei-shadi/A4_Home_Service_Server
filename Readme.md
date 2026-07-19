# <div align="center">🔧 FixItNow</div>

<div align="center">

### **Your Trusted Home Service Platform**

A secure and scalable **Home Service Marketplace Backend API** built with **Node.js, Express.js, TypeScript, Prisma ORM, PostgreSQL, JWT Authentication, and Stripe**.

Customers can book professional technicians, technicians can manage their services and bookings, and admins can manage the entire platform.

</div>

---

<h2 align="center">✨ Project Overview</h2>

**FixItNow** is a RESTful backend API for a home service marketplace. It allows customers to browse services, book technicians, make secure online payments, and leave reviews after completed jobs. Technicians can manage their profiles, services, and bookings, while administrators oversee users, bookings, and service categories.

---

<h2 align="center">🚀 Features</h2>

### 👤 Customer Features

* 🔐 Register & Login
* 👀 Browse Services & Technicians
* 🔍 Search & Filter Services
* 📅 Book Home Services
* 💳 Secure Stripe Payment
* 📜 View Booking History
* 💰 View Payment History
* ⭐ Leave Reviews After Job Completion
* 👤 Manage Profile

### 👨‍🔧 Technician Features

* 🔐 Register & Login
* 👤 Create & Update Technician Profile
* 🛠️ Create & Manage Services
* 📅 Manage Availability
* 📥 View Incoming Bookings
* ✅ Accept or Decline Bookings
* 🚧 Update Booking Status
* ✔️ Mark Jobs as Completed

### 👨‍💼 Admin Features

* 👥 Manage Users
* 🚫 Ban / Unban Users
* 📂 Manage Service Categories
* 📊 View All Bookings
* 🛡️ Platform Management

### ⚙️ Core Features

* 🔐 JWT Authentication
* 🛡️ Role-Based Authorization
* 🍪 HTTP Only Cookie Authentication
* 📦 Prisma ORM
* 🗄️ PostgreSQL Database
* 💳 Stripe Payment Integration
* 📝 Global Error Handling
* 📄 Filtering & Searching
* ⚡ TypeScript Support
* 📚 RESTful API Architecture

---

<h2 align="center">🤖 Tech Stack</h2>

| 🛠️ Technology   | 💡 Purpose                    |
| ---------------- | ----------------------------- |
| ⚡ Node.js        | Runtime Environment           |
| 🚂 Express.js    | Backend Framework             |
| 🔷 TypeScript    | Type Safety                   |
| 🗄️ PostgreSQL   | Database                      |
| 📦 Prisma ORM    | ORM                           |
| 🔐 JWT           | Authentication                |
| 🍪 Cookie Parser | Cookie Management             |
| 🌐 CORS          | Cross-Origin Resource Sharing |
| 🛡️ bcrypt       | Password Hashing              |
| 💳 Stripe        | Payment Gateway               |
| 🔄 ts-node-dev   | Development Server            |

---

<h2 align="center">👥 User Roles</h2>

* **Customer** — Browse services, create bookings, make payments, leave reviews.
* **Technician** — Manage services, availability, bookings, and complete jobs.
* **Admin** — Manage users, bookings, and service categories.

---

<h2 align="center">🗂️ Project Structure</h2>

```bash
src
│
├── app
│   ├── config
│   ├── lib
│   ├── middleware
│   ├── module
│   │   ├── auth
│   │   ├── user
│   │   ├── technician
│   │   ├── category
│   │   ├── service
│   │   ├── booking
│   │   ├── payment
│   │   └── review
│   ├── routes
│   ├── shared
│   └── utils
│
├── prisma
│   ├── migrations
│   ├── schema
│   └── seed.ts
│
├── app.ts
└── server.ts
```

---

<h2 align="center">🗄️ Database Models</h2>

* 👤 Users
* 🎭 Roles
* 👨‍🔧 Technician Profiles
* 📂 Categories
* 🛠️ Services
* 📅 Bookings
* 💳 Payments
* ⭐ Reviews

---

<h2 align="center">🔐 Authentication & Authorization</h2>

* JWT Access Token
* HTTP Only Cookies
* bcrypt Password Hashing
* Protected Routes
* Role-Based Authorization Middleware

---

<h2 align="center">💳 Payment Workflow</h2>

```text
Customer
   │
   ▼
Create Booking
   │
   ▼
Technician Accepts Booking
   │
   ▼
Create Stripe Checkout Session
   │
   ▼
Stripe Payment
   │
   ▼
Verify Payment
   │
   ▼
Update Payment & Booking Status
```

---

<h2 align="center">📦 API Endpoints</h2>

| Method | Endpoint                | Description           |
| ------ | ----------------------- | --------------------- |
| POST   | `/api/auth/register`    | Register User         |
| POST   | `/api/auth/login`       | Login User            |
| POST   | `/api/auth/logout`      | Logout User           |
| GET    | `/api/auth/me`          | Current User          |
| GET    | `/api/services`         | Get All Services      |
| GET    | `/api/services/:id`     | Get Service Details   |
| GET    | `/api/categories`       | Get Categories        |
| GET    | `/api/technicians`      | Get Technicians       |
| GET    | `/api/technicians/:id`  | Technician Details    |
| POST   | `/api/bookings`         | Create Booking        |
| GET    | `/api/bookings`         | User Bookings         |
| GET    | `/api/bookings/:id`     | Booking Details       |
| PATCH  | `/api/bookings/:id`     | Update Booking        |
| POST   | `/api/payments/create`  | Create Stripe Session |
| POST   | `/api/payments/confirm` | Verify Payment        |
| GET    | `/api/payments`         | Payment History       |
| GET    | `/api/payments/:id`     | Payment Details       |
| POST   | `/api/reviews`          | Create Review         |
| GET    | `/api/admin/users`      | Get Users             |
| PATCH  | `/api/admin/users/:id`  | Update User Status    |
| GET    | `/api/admin/bookings`   | All Bookings          |
| GET    | `/api/admin/categories` | Categories            |
| POST   | `/api/admin/categories` | Create Category       |

> 🔐 Protected routes require JWT Authentication.

---

<h2 align="center">⚙️ Installation & Setup</h2>

### 📥 Clone Repository

```bash
git clone https://github.com/ei-shadi/A4_Home_Service_Server.git

cd A4_Home_Service_Server
```

### 📦 Install Dependencies

```bash
npm install
```

### ⚙️ Configure Environment Variables

Create a `.env` file inside the project root.

```env
PORT=5000

DATABASE_URL=YOUR_CONNECTION_STRING_HERE
APP_URL=YOUR_APP_URL_HERE

BCRYPT_SALT_ROUNDS=10
NODE_ENV=Development or Production

JWT_ACCESS_SECRET=ACCESS_SECRET
JWT_REFRESH_SECRET=REFRESH_SECRET
JWT_ACCESS_EXPIRES_IN=1d
JWT_REFRESH_EXPIRES_IN=7d

STRIPE_PRODUCT_ID=YOUR_STRIPE_PRODUCT_KEY
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=YOUR_STRIPE_WEBHOOK_SECRET
```

### 🗄️ Generate Prisma Client

```bash
npx prisma generate
```

### 📂 Run Database Migration

```bash
npx prisma migrate dev
```

### 🌱 Seed Database

```bash
npm run seed
```

### 🚀 Start Development Server

```bash
npm run dev
```

### 📦 Production Build

```bash
npm run build

npm start
```

---

<h2 align="center">📋 Booking Workflow</h2>

```text
REQUESTED
     │
     ├────────────► DECLINED
     │
     ▼
 ACCEPTED
     │
     ▼
    PAID
     │
     ▼
IN_PROGRESS
     │
     ▼
COMPLETED
```

> Customers can cancel bookings before they reach the **IN_PROGRESS** stage.

---

<h2 align="center">🧪 API Testing</h2>

You can test the API using:

* Postman (I Added My "POSTMAN" Collection)
* Thunder Client
* Insomnia

---

<h2 align="center">👨‍💻 Author</h2>

**Eftajul Islam Shadi**

🌐 GitHub: https://github.com/ei-shadi

---

<div align="center">

## ⭐ If you found this project helpful, consider giving it a star!

</div>
