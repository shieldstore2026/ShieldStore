# Shield E-commerce (MERN)

Full-stack professional E-commerce website with **MERN** (MongoDB, Express.js, React.js, Node.js), gaming theme (dark/light mode), JWT + Google OAuth auth, User and Admin panels, cart, wishlist, checkout, and payment (eSewa) integration.

## Features

- **Theme:** Dark mode (default) and Light mode with toggle; preference stored in `localStorage`.
- **Auth:** JWT login, registration, logout, protected routes, bcrypt password hashing, Google OAuth (optional).
- **User panel:** Product browse, category filter, search, product detail, add to cart, cart management, wishlist, checkout, order placement, order history, profile.
- **Admin panel:** Dashboard analytics, product CRUD, category management, order management (status), user management (role).
- **API:** RESTful, MVC structure, error handling, validation (express-validator).
- **Frontend:** React, Context API (auth, cart, wishlist, theme), Tailwind CSS, gaming aesthetic, loading states, toast notifications (react-hot-toast), responsive layout.
- **Payment:** eSewa init + success redirect (configure in `.env`).

## Folder Structure

```
Shields/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   │       └── admin/
│   ├── tailwind.config.js
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── scripts/
│   │   └── seed.js
│   ├── .env
│   ├── .env.example
│   └── package.json
├── package.json
└── README.md
```

## Setup Instructions

### 1. Prerequisites

- **Node.js** (v18+)
- **MongoDB** (local or Atlas)

### 2. Install dependencies

From project root:

```bash
npm run install-all
```

Or manually:

```bash
npm install
cd server && npm install
cd ../client && npm install
```

### 3. Environment variables

- Copy `server/.env.example` to `server/.env` (or use the existing `.env`).
- Set at least:
  - `MONGODB_URI` – MongoDB connection string (e.g. `mongodb://localhost:27017/shield-ecommerce`)
  - `JWT_SECRET` – Secret for JWT (use a strong value in production)
  - `FRONTEND_URL` – Frontend URL(s) for CORS and redirects (e.g. `http://localhost:3000`). Use commas to allow multiple origins (production + preview).
- Optional: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` for Google OAuth; `ESEWA_CLIENT_ID`, `ESEWA_SECRET_KEY` for eSewa.

### 4. Seed database (required for admin)

```bash
cd server
npm run seed
```

Creates **admin user**, sample categories and products. Required if you want to use the admin panel.

### 5. Admin login

1. **Open:** [http://localhost:3000/admin/login](http://localhost:3000/admin/login) (with the app running).
2. **Credentials (after seed):**
   - **Email:** `admin@shield.com`
   - **Password:** `admin123`
3. After signing in you are redirected to the **Admin dashboard** (`/admin`). From there you can manage products, categories, orders, and users.

**Note:** The admin panel is separate from customer login. Only users with role `admin` can access `/admin`. If you log in with a normal user account on this page, you’ll see “Admin access only”.

### 6. Run development

**Terminal 1 – backend:**

```bash
cd server
npm run dev
```

Server runs at `http://localhost:5000`.

**Terminal 2 – frontend:**

```bash
cd client
npm start
```

Client runs at `http://localhost:3000` (proxy to API).

Or from root (if you have `concurrently`):

```bash
npm run dev
```

### 7. Share with others (no deployment)

To let friends open your app from their browser without deploying:

1. **Start the app** (from project root):
   ```bash
   npm run dev
   ```
2. **In a second terminal**, start the tunnel:
   ```bash
   npm run share
   ```
3. In the terminal you’ll see a line like **`Your quick Tunnel has been created! Visit it at (it may take some time to be reachable): https://xxxx-xx-xx-xx-xx.trycloudflare.com`**. Copy that **https://…trycloudflare.com** link and share it.
4. No password—friends open the link and the site loads.

Your computer and the app must stay running (and the tunnel terminal open) while they use the link. **Install Cloudflare Tunnel once** so the `share` command works: [install cloudflared](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/) or on Windows: `winget install cloudflare.cloudflared`.

### 8. Deploy to production

See **[DEPLOY.md](./DEPLOY.md)** for **Vercel** (frontend), **Render** (backend), **MongoDB Atlas**, env vars, and troubleshooting.

**Before building the client for production:** set `REACT_APP_API_URL` to your API base URL (see `client/.env.example`).

### 9. Build for production

```bash
cd client
npm run build
```

Serve the `client/build` folder with your preferred static host; set `REACT_APP_API_URL` to your backend URL when building.

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Login |
| POST | /api/auth/logout | Logout |
| GET | /api/auth/me | Current user (protected) |
| GET | /api/auth/google | Google OAuth start |
| GET | /api/categories | List categories |
| GET | /api/products | List products (query: page, limit, search, category, featured, ids) |
| GET | /api/products/:id | Get product |
| POST | /api/orders | Create order |
| GET | /api/orders | List orders (protected) |
| PUT | /api/orders/:id/status | Update order status (admin) |
| GET | /api/users | List users (admin) |
| PUT | /api/users/profile | Update profile (protected) |
| PUT | /api/users/:id/role | Update user role (admin) |
| POST | /api/payment/esewa/init | eSewa init |

Admin product/category CRUD: POST/PUT/DELETE on `/api/products` and `/api/categories` (admin only).

## Default credentials (after seed)

| Role  | Email               | Password   |
|-------|---------------------|------------|
| Admin | `admin@shield.com`  | `admin123` |

Use these only on **Admin login**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login).

## Tech stack

- **Backend:** Express, Mongoose, JWT, bcryptjs, passport (Google OAuth), express-validator, dotenv, cors, cookie-parser.
- **Frontend:** React 18, React Router 6, Context API, Tailwind CSS 3, fetch API, react-hot-toast.
- **Database:** MongoDB.
