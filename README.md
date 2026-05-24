# Global Service Mitra (GSM)

> **Service · Support · Solutions**
> Trusted Support. Smart Solutions. Stronger Together.

A full-stack service booking platform built with **Next.js 14 (App Router) + TypeScript + Tailwind + Prisma + PostgreSQL**.

## Features

- Public marketing pages (Home, Services & Products, About, Contact) — server-rendered for great **SEO** (metadata, sitemap, robots, OG tags)
- **Guest cart** — add services or products without signing in; login is required only at checkout
- **Dual authentication** on a single inline checkout step: Email + Password tab, Mobile + OTP tab, or Register
- Locality-aware bookings — users pick from admin-managed serviceable areas
- One transactional checkout creates Bookings (for services) and a ProductOrder (for products), decrements stock, validates prices server-side
- User dashboard to view and cancel bookings
- **Admin panel** at `/admin` with:
  - Dashboard (KPIs + recent bookings)
  - Bookings (filter + inline status update)
  - Services CRUD + per-service availability dates & time slots
  - Products CRUD
  - Categories CRUD
  - Localities CRUD
  - Users (promote/demote admin)
- Sessions with signed JWT cookies (no third-party deps)
- Brand-matched theme (royal blue + orange) and a built-in SVG logo mark

## Quick start

### 1. Prerequisites

- Node.js 18+
- A PostgreSQL database. Easiest paths:
  - **Docker (local):**
    ```powershell
    docker run -d --name homeflux-pg -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=homeflux postgres:16-alpine
    ```
  - **Neon (hosted, free):** sign up at <https://neon.tech>, create a project, copy the connection string.

### 2. Configure environment

Copy `.env.example` → `.env` and edit:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/homeflux"
AUTH_SECRET="generate-with-openssl-rand-base64-32"
ADMIN_EMAIL="admin@globalservicemitra.in"
ADMIN_PASSWORD="Admin@12345"
DEV_OTP_CODE="123456"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 3. Install + initialize

```powershell
npm install
npm run setup      # generates Prisma client, pushes schema, seeds data
npm run dev
```

Open <http://localhost:3000>.

### 4. Sign in

| Role  | Where           | Credentials                                                |
| ----- | --------------- | ---------------------------------------------------------- |
| User  | `/login`        | Register fresh, or use Mobile tab + any 10-digit + OTP `123456` |
| Admin | `/admin/login`  | `admin@globalservicemitra.in` / `Admin@12345`              |

## How the flow works

1. Browse `/services` — switch tabs between Services and Products.
2. **Services:** click any service → fill locality + address + date/time + contact → **Add to Cart** (no login needed). Re-add multiple if you want.
3. **Products:** click **Add to Cart** on any product card; quantity is adjustable in the cart.
4. Open the cart icon in the navbar (`/cart`) → review → **Proceed to Checkout**.
5. **Checkout** — if you're a guest, the inline auth widget appears (Email / Mobile / Register tabs). After auth, the page flips to "Place order".
6. Submitting hits `/api/checkout` → creates Booking rows + ProductOrder in one transaction → redirects to `/bookings`.

## Project structure

```
prisma/
  schema.prisma            # PostgreSQL data model (User, Booking, Service, Product, ProductOrder, OrderItem, etc.)
  seed.ts                  # Admin user + categories/services/products/localities

src/
  app/
    layout.tsx             # Root layout w/ Navbar + Footer + SEO metadata, wraps CartProvider
    page.tsx               # Home (ISR)
    services/              # Listing + detail + add-to-cart
    cart/                  # Guest-friendly cart page
    checkout/              # Inline-auth checkout
    about/, contact/       # Marketing pages
    login/, register/      # Standalone auth pages (also used outside checkout)
    bookings/              # User's own bookings (gated)
    admin/
      login/               # Admin login (no chrome)
      (panel)/             # Route group with sidebar + auth check
        page.tsx, bookings/, services/, products/, categories/, localities/, users/
    api/
      auth/                # register, login-email, send-otp, verify-otp, me, logout
      bookings/            # User booking cancel
      checkout/            # Single-shot transactional checkout
      admin/               # Admin CRUD endpoints (all gated)
    sitemap.ts, robots.ts  # SEO

  components/
    Logo.tsx               # SVG GSM mark + wordmark
    Navbar.tsx, Footer.tsx
    cart/                  # CartProvider, CartButton, AddProductButton
    DeleteRowButton.tsx

  lib/
    db.ts                  # Prisma singleton
    auth.ts                # JWT session helpers + role guards
    otp.ts                 # OTP issue/verify (dev console output)
    format.ts              # Money formatting
    cart-types.ts          # Cart item types (service vs product)

  middleware.ts            # Protects /admin, /bookings, /account
```

## Useful scripts

```powershell
npm run dev         # local dev
npm run build       # production build (runs prisma db push)
npm run start       # serve the build
npm run db:push     # apply schema changes
npm run db:seed     # re-run seed
npm run db:reset    # drop + recreate + reseed
```

## Replacing the logo

The built-in [src/components/Logo.tsx](src/components/Logo.tsx) ships an SVG approximation of the GSM mark. To use the official artwork:

1. Drop the file in `public/logo.png` (or `.svg`)
2. Update `BrandLogo` and `LogoMark` in `src/components/Logo.tsx` to render `<img src="/logo.png" />` instead of the inline SVG

## Going to production

- **Vercel** + **Neon** is the easiest path. Set `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL` as project env vars.
- Build script already runs `prisma generate && prisma db push`, so deploys apply schema changes automatically.
- For real SMS OTP, replace the body of `issueOtp()` in [src/lib/otp.ts](src/lib/otp.ts) with a Twilio / MSG91 call.
