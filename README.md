# KP Jewlers

A full-stack jewelry storefront and inventory management system. Customers can browse handpicked jewelry, create accounts, and message the seller to coordinate purchases. The owner manages inventory, tracks costs in both MXN and USD, records sales, and handles all customer messages from a private dashboard.

---

## Features

### Storefront (Public)

- Landing page with featured products and category quick-links
- Shop page with filtering by jewelry type, style tags, and availability
- Product detail page with image gallery and pricing
- Account creation and Google sign-in for customers who want to message the seller

### Messaging

- Customers can send messages to the seller about specific items
- Async inbox for both customers (`/messages`) and the seller (`/dashboard/messages`)
- No payment processing — seller and buyer coordinate payment directly

### Inventory Management (Admin Only)

- Add, edit, and delete items with full cost tracking
- Enter purchase cost in **Mexican Pesos (MXN)** — click **Fetch** to auto-load the historical exchange rate for the exact purchase date
- Tracks: cost in MXN, cost in USD, exchange rate used, shipping/import fees, wholesale price, and selling price
- Real-time margin and markup preview while filling in prices
- Tag items by jewelry type (necklace, bracelet, ring, earring, charm, nose ring, clip) and style (Cubano, Torso, Cartier, Franco, etc.)
- Upload product photos to Azure Blob Storage

### Sales & Analytics

- Record sales with sale price, buyer, date, and notes
- Dashboard overview: total revenue, monthly revenue, items sold, available inventory
- Sales history table with per-item profit tracking
- Unread message alerts on the dashboard

### User Management

- Role-based access: `ADMIN` and `CUSTOMER`
- Owner can promote any registered user to admin from `/dashboard/users`
- Admins cannot accidentally demote themselves

---

## Tech Stack

| Layer          | Technology                              |
| -------------- | --------------------------------------- |
| Framework      | Next.js 16 (App Router)                 |
| Language       | TypeScript                              |
| Styling        | Tailwind CSS v4                         |
| Database       | Azure SQL (SQL Server)                  |
| ORM            | Prisma 7                                |
| Authentication | Auth.js v5 (credentials + Google OAuth) |
| Image Storage  | Azure Blob Storage                      |
| Exchange Rates | Frankfurter API (free, no key required) |
| Validation     | Zod                                     |

---

## Project Structure

```
app/
├── (store)/              # Public storefront (/ /shop /messages)
├── (dashboard)/          # Owner dashboard (/dashboard/...)
├── (auth)/               # Login & register pages
└── api/                  # Route handlers

components/
├── ui/                   # Reusable: Button, Input, Badge, Modal, StatCard
├── store/                # ProductCard, FilterSidebar, Navbar, Footer
├── dashboard/            # ProductForm, DashboardNav, RecordSaleButton
└── messages/             # MessageThread, SendMessageForm

lib/
├── auth.ts               # Auth.js config
├── db.ts                 # Prisma client singleton
├── azure-blob.ts         # Image upload/delete
├── exchange-rate.ts      # Historical MXN→USD rate lookup
└── validations.ts        # Zod schemas
```

---

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd kp_jewlers
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in your values in `.env`:

| Variable                                    | Where to find it                                              |
| ------------------------------------------- | ------------------------------------------------------------- |
| `DATABASE_URL`                              | See Database Setup section below                              |
| `AUTH_SECRET`                               | Run `openssl rand -base64 32`                                 |
| `AZURE_STORAGE_CONNECTION_STRING`           | Azure Portal → Storage Account → Access Keys                  |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google Cloud Console (optional — for "Continue with Google")  |

### 3. Push the database schema

```bash
npx prisma db push
```

> **Note:** `prisma db push` is used instead of `prisma migrate dev` because Azure SQL does not support automatic shadow database creation, which Prisma migrate requires.

### 4. Create your admin account

Start the app, go to [http://localhost:3000/register](http://localhost:3000/register) and create an account. Then open Prisma Studio to promote yourself to admin:

```bash
npx prisma studio
```

Find your user record and change `role` from `CUSTOMER` to `ADMIN`. After that you can promote other users directly from `/dashboard/users`.

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Database Setup (Azure SQL)

The app uses **Azure SQL Database** (SQL Server). The connection string format is:

```
sqlserver://YOUR_SERVER.database.windows.net:1433;database=YOUR_DB;user=YOUR_USER@YOUR_SERVER;password=YOUR_PASSWORD;encrypt=true;trustServerCertificate=false
```

### Azure SQL setup steps

1. **Create an Azure SQL Server and database** in the Azure Portal
2. **Disable Azure AD-only authentication** so SQL login works:
   ```bash
   az sql server ad-only-auth disable \
     --resource-group YOUR_RESOURCE_GROUP \
     --name YOUR_SERVER_NAME
   ```
3. **Set the admin password** via Azure Cloud Shell:
   ```bash
   az sql server update \
     --name YOUR_SERVER_NAME \
     --resource-group YOUR_RESOURCE_GROUP \
     --admin-password "YourPassword123!"
   ```
4. **Add your IP to the firewall:**
   Azure Portal → SQL Server → Networking → Add your client IPv4 address → Save
5. **Find your admin username:**
   Azure Portal → SQL Server → Settings → Properties → Server admin login

> **Username format:** Azure SQL requires the username in the format `username@servername` (e.g. `CloudSA0145a138@kp-jewelry`).

---

## Environment Variables

```env
# Azure SQL Server
DATABASE_URL="sqlserver://YOUR_SERVER.database.windows.net:1433;database=YOUR_DB;user=YOUR_USER@YOUR_SERVER;password=YOUR_PASSWORD;encrypt=true;trustServerCertificate=false"

# Auth.js — generate with: openssl rand -base64 32
AUTH_SECRET=""

# Google OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Azure Blob Storage
AZURE_STORAGE_CONNECTION_STRING=""
```

---

## Routes

| Route                            | Access    | Description                   |
| -------------------------------- | --------- | ----------------------------- |
| `/`                              | Public    | Storefront landing page       |
| `/shop`                          | Public    | Browse and filter all jewelry |
| `/shop/[id]`                     | Public    | Product detail page           |
| `/messages`                      | Logged in | Customer message inbox        |
| `/login`                         | Public    | Sign in                       |
| `/register`                      | Public    | Create account                |
| `/dashboard`                     | Admin     | Analytics overview            |
| `/dashboard/inventory`           | Admin     | Manage all products           |
| `/dashboard/inventory/new`       | Admin     | Add a new item                |
| `/dashboard/inventory/[id]/edit` | Admin     | Edit an existing item         |
| `/dashboard/sales`               | Admin     | Sales history and recording   |
| `/dashboard/messages`            | Admin     | All customer conversations    |
| `/dashboard/users`               | Admin     | Manage user roles             |

---

## Currency Tracking

When adding an item, enter the purchase date and cost in Mexican Pesos. Click the **Fetch** button on the exchange rate field — the app calls the [Frankfurter API](https://www.frankfurter.app/) to look up the actual MXN/USD rate for that specific date and automatically calculates the USD cost. The rate used is stored alongside the product so the record is always accurate, even as rates change over time.
