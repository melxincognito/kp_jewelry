# KP Jewelry

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
- Split-pane iMessage-style inbox for both customers (`/messages`) and the seller (`/dashboard/messages`) — conversation list on the left, thread on the right
- Conversations sorted by most recent message; new messages bubble the thread to the top automatically
- Unread message badge on the nav bar for both customers and the admin dashboard — shows count, clears when inbox is opened
- **Soft-delete with 30-day retention** — conversations can be moved to a Deleted tab and recovered at any time; messages are permanently removed only after both parties have had them in their deleted folder for 30+ days
- Cleanup endpoint at `GET /api/messages/cleanup` (requires `HEALTH_API_KEY`) — intended to be called on a daily cron
- Full keyboard and screen reader accessibility: selecting a conversation shifts focus into the thread, each message is individually focusable, new messages are announced via a live region
- No payment processing — seller and buyer coordinate payment directly

### Inventory Management (Admin Only)

- Add, edit, and delete items with full cost tracking
- **SKU field** — optional unique identifier per item (e.g. `NKL-001`), shown in the inventory table and filterable
- **Material field** — optional dropdown (Gold, White Gold, Rose Gold, Silver, Sterling Silver, Stainless Steel, Plated, Other) stored per item
- **Size breakdown** — items that come in sizes (rings, bracelets, etc.) can opt into per-size inventory tracking; click **+ Add sizing** to define size labels (e.g. `6`, `M`, `18 inch`) with individual quantities; total quantity is automatically calculated as the sum; items without sizes (nose rings, charms, etc.) work exactly as before
- **Bulk import** — upload a `.xlsx`, `.xls`, or `.csv` spreadsheet to create multiple items at once; a downloadable CSV template is provided; each row is validated and errors are reported per-row without blocking successful rows
- Enter purchase cost in **Mexican Pesos (MXN)** — click **Fetch** to auto-load the historical exchange rate for the exact purchase date
- Tracks: cost in MXN, cost in USD, exchange rate used, shipping/import fees, wholesale price, and selling price
- Real-time margin and markup preview while filling in prices
- Tag items by jewelry type (necklace, bracelet, ring, earring, charm, nose ring, clip) and style (Cubano, Torso, Cartier, Franco, etc.)
- Upload product photos to Azure Blob Storage
- **Storefront visibility toggle** — items can be hidden from the shop while still managed in the dashboard
- **Inventory filters** — filter the inventory table by name, SKU, jewelry type, and status simultaneously; live match count updates as you type

### Sales & Analytics

- Record sales with sale price, buyer, date, and notes
- **Size-aware sale recording** — when a sized item is selected, a size dropdown appears showing only sizes still in stock; recording the sale deducts from that specific size and the product total simultaneously
- **Date range filtering** — filter the sales table by preset (Today, This Week, This Month, Last Month, This Quarter, Last Quarter, This Year, Last Year) or a custom date range; totals update to reflect the filtered period
- **Export to Excel or PDF** — download the currently filtered sales records; filenames reflect the active filter (e.g. `kp-jewelers-sales-last-month.xlsx`); Excel uses SheetJS, PDF uses jsPDF with autotable
- Dashboard overview: total revenue, monthly revenue, items sold, available inventory
- Sales history table with per-item profit tracking
- Unread message alerts on the dashboard

### Health Monitoring

- `GET /api/health` — returns the status of all critical services with per-check response times
- Checks: **Azure SQL database** (`SELECT 1`), **Azure Blob Storage** (container exists), **Frankfurter exchange rate API**, **environment configuration** (required env vars present)
- Status levels: `healthy` (HTTP 200), `degraded` (HTTP 200 — non-critical service down), `unhealthy` (HTTP 503 — critical service down)
- Protected by `HEALTH_API_KEY` — pass as `Authorization: Bearer <key>` header or `?key=<key>` query param; unauthenticated requests receive a `401` with no service detail

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
| Spreadsheet    | xlsx (SheetJS)                          |
| PDF Export     | jsPDF + jspdf-autotable                 |

---

## Project Structure

```
app/
├── (store)/              # Public storefront (/ /shop /messages)
├── (dashboard)/          # Owner dashboard (/dashboard/...)
├── (auth)/               # Login & register pages
└── api/                  # Route handlers
    ├── health/           # Health monitoring endpoint
    ├── messages/
    │   ├── threads/      # Soft-delete and restore conversations
    │   └── cleanup/      # Permanent deletion cron endpoint
    ├── products/         # CRUD + bulk import
    └── sales/            # Record sales with size tracking

components/
├── ui/                   # Reusable: Button, Input, Badge, Modal, StatCard
├── store/                # ProductCard, FilterSidebar, Navbar, Footer
├── dashboard/            # ProductForm, DashboardNav, RecordSaleButton,
│                         #   InventoryTable, BulkImportButton,
│                         #   SalesFilters, SalesExport
└── messages/             # MessageThread, MessagesLayout

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

| Variable                                    | Where to find it                                             |
| ------------------------------------------- | ------------------------------------------------------------ |
| `DATABASE_URL`                              | See Database Setup section below                             |
| `AUTH_SECRET`                               | Run `openssl rand -base64 32`                                |
| `AZURE_STORAGE_CONNECTION_STRING`           | Azure Portal → Storage Account → Access Keys                 |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google Cloud Console (optional — for "Continue with Google") |
| `HEALTH_API_KEY`                            | Any secret string you choose                                 |

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

_If it throws an error, run the following_

```bash
rm -rf app/generated/prisma .next
npx prisma generate
npm run dev
```

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

> **Username format:** Azure SQL requires the username in the format `username@servername`).

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

# Health Endpoint — protects /api/health and /api/messages/cleanup
# Call with: Authorization: Bearer <key>  or  ?key=<key>
HEALTH_API_KEY=""
```

---

## Routes

| Route                            | Access    | Description                          |
| -------------------------------- | --------- | ------------------------------------ |
| `/`                              | Public    | Storefront landing page              |
| `/shop`                          | Public    | Browse and filter all jewelry        |
| `/shop/[id]`                     | Public    | Product detail page                  |
| `/messages`                      | Logged in | Customer message inbox               |
| `/login`                         | Public    | Sign in                              |
| `/register`                      | Public    | Create account                       |
| `/dashboard`                     | Admin     | Analytics overview                   |
| `/dashboard/inventory`           | Admin     | Manage all products                  |
| `/dashboard/inventory/new`       | Admin     | Add a new item                       |
| `/dashboard/inventory/[id]/edit` | Admin     | Edit an existing item                |
| `/dashboard/sales`               | Admin     | Sales history, filtering, and export |
| `/dashboard/messages`            | Admin     | All customer conversations           |
| `/dashboard/users`               | Admin     | Manage user roles                    |
| `/api/health`                    | Key       | Service health check                 |
| `/api/messages/cleanup`          | Key       | Permanently delete 30-day-old trash  |

---

## Currency Tracking

When adding an item, enter the purchase date and cost in Mexican Pesos. Click the **Fetch** button on the exchange rate field — the app calls the [Frankfurter API](https://www.frankfurter.app/) to look up the actual MXN/USD rate for that specific date and automatically calculates the USD cost. The rate used is stored alongside the product so the record is always accurate, even as rates change over time.

---

## Scheduled Maintenance

Two endpoints are designed to be called on a schedule by an external cron (GitHub Actions, Azure Scheduler, etc.):

| Endpoint                  | Recommended cadence | What it does                                                  |
| ------------------------- | ------------------- | ------------------------------------------------------------- |
| `GET /api/messages/cleanup` | Daily             | Permanently deletes messages both parties soft-deleted 30+ days ago |
| `GET /api/health`           | As needed         | Verifies all services are reachable                           |

Both require `Authorization: Bearer <HEALTH_API_KEY>` or `?key=<HEALTH_API_KEY>`.
