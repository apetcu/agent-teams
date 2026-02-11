# Marketplace PRD

## Overview

A general-purpose multi-vendor ecommerce marketplace built with Next.js, Tailwind CSS, MongoDB, and Stripe. Vendors register openly, list products with variants and inventory, and the platform admin manages payouts manually. Design is minimal and clean.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Server Actions) |
| Styling | Tailwind CSS 4 |
| Database | MongoDB + Mongoose |
| Auth | NextAuth.js v5 (OAuth only — Google, GitHub) |
| Payments | Stripe Checkout |
| File Storage | Cloudinary (product images) |
| Deployment | Vercel |

---

## User Roles

| Role | Description |
|------|-------------|
| **Guest** | Browse products, search, view details — no account needed |
| **Customer** | Authenticated user — add to cart, checkout, wishlist, order history |
| **Vendor** | Authenticated user who registered as vendor — manage own products, orders, dashboard |
| **Admin** | Platform administrator — manage all users, vendors, products, orders, coupons, site settings |

---

## Data Models

### User
```
- _id
- name
- email
- image (from OAuth)
- role: enum [customer, vendor, admin]
- wishlist: [ProductId]
- createdAt, updatedAt
```

### Vendor Profile
```
- _id
- userId (ref User)
- storeName
- storeSlug (unique, URL-friendly)
- storeDescription
- storeLogo
- storeBanner
- contactEmail
- payoutDetails (bank info for manual payouts)
- isActive: boolean
- createdAt, updatedAt
```

### Category
```
- _id
- name
- slug (unique)
- description
- image
- parentCategory (ref Category, nullable — for subcategories)
- createdAt, updatedAt
```

### Product
```
- _id
- vendorId (ref User)
- name
- slug (unique)
- description (rich text)
- category (ref Category)
- basePrice
- images: [String] (Cloudinary URLs)
- variants: [{
    name (e.g. "Size", "Color")
    options: [{
      value (e.g. "Large", "Red")
      priceModifier (default 0)
      sku
      stock
    }]
  }]
- totalStock (computed)
- isActive: boolean
- tags: [String]
- createdAt, updatedAt
```

### Cart
```
- _id
- userId (ref User)
- items: [{
    productId (ref Product)
    variantSelections: [{ name, value }]
    quantity
    priceAtAdd
  }]
- updatedAt
```

### Order
```
- _id
- userId (ref User)
- items: [{
    productId (ref Product)
    vendorId (ref User)
    variantSelections: [{ name, value }]
    quantity
    unitPrice
    totalPrice
  }]
- subtotal
- discount
- total
- couponUsed (ref Coupon, nullable)
- stripePaymentIntentId
- stripeSessionId
- status: enum [pending, paid, processing, shipped, delivered, cancelled, refunded]
- shippingAddress: {
    fullName, street, city, state, zip, country
  }
- createdAt, updatedAt
```

### Coupon
```
- _id
- code (unique)
- type: enum [percentage, fixed]
- value
- minOrderAmount
- maxUses
- usedCount
- vendorId (ref User, nullable — null = platform-wide)
- isActive: boolean
- expiresAt
- createdAt
```

### Review (future, not in MVP)
```
- reserved for post-MVP
```

---

## Pages & Features

### Phase 1 — Project Setup
- [ ] Initialize Next.js 15 with App Router
- [ ] Configure Tailwind CSS 4
- [ ] Set up MongoDB connection with Mongoose
- [ ] Configure NextAuth.js v5 with Google + GitHub OAuth
- [ ] Set up Cloudinary for image uploads
- [ ] Create base layout (header, footer, navigation)
- [ ] Set up Stripe SDK

### Phase 2 — Homepage
- [ ] Hero section with featured banner
- [ ] Featured categories grid
- [ ] Trending / new products carousel
- [ ] "Shop by vendor" section
- [ ] Search bar in header (routes to search results page)
- [ ] Responsive mobile layout

### Phase 3 — Category Pages
- [ ] `/categories` — grid of all categories
- [ ] `/categories/[slug]` — products filtered by category
- [ ] Sidebar filters: price range, sort (price asc/desc, newest, popular)
- [ ] Pagination
- [ ] Breadcrumb navigation

### Phase 4 — Product Details Page
- [ ] `/products/[slug]`
- [ ] Image gallery with zoom
- [ ] Product name, price, description
- [ ] Variant selectors (size, color, etc.)
- [ ] Stock availability indicator
- [ ] "Add to Cart" button
- [ ] "Add to Wishlist" button
- [ ] Vendor info card with link to vendor store
- [ ] Related products section (same category)

### Phase 5 — Vendor Store Page
- [ ] `/store/[slug]`
- [ ] Vendor banner, logo, description
- [ ] All products from this vendor
- [ ] Filters and pagination

### Phase 6 — Cart
- [ ] `/cart`
- [ ] List cart items with quantities, variants, prices
- [ ] Update quantity / remove items
- [ ] Coupon code input + apply
- [ ] Cart summary (subtotal, discount, total)
- [ ] "Proceed to Checkout" button
- [ ] Persistent cart (MongoDB, synced with auth)

### Phase 7 — Checkout & Orders
- [ ] `/checkout`
- [ ] Shipping address form
- [ ] Order summary review
- [ ] Stripe Checkout integration (redirect to Stripe-hosted page)
- [ ] `/checkout/success` — order confirmation page
- [ ] `/checkout/cancel` — payment cancelled page
- [ ] Stripe webhook to update order status on payment success
- [ ] Inventory deduction on successful payment
- [ ] `/orders` — customer order history
- [ ] `/orders/[id]` — order detail with status

### Phase 8 — Wishlist
- [ ] `/wishlist`
- [ ] Add/remove products from any product card or detail page
- [ ] "Move to Cart" action

### Phase 9 — Contact Page
- [ ] `/contact`
- [ ] Contact form (name, email, subject, message)
- [ ] Platform info / FAQ section

### Phase 10 — Vendor Dashboard
- [ ] `/vendor/dashboard` — overview (total sales, orders, products count)
- [ ] `/vendor/products` — list, add, edit, delete products
- [ ] `/vendor/products/new` — create product form with image upload, variants
- [ ] `/vendor/products/[id]/edit` — edit product
- [ ] `/vendor/orders` — orders containing this vendor's products
- [ ] `/vendor/orders/[id]` — order detail, update status (processing → shipped)
- [ ] `/vendor/settings` — store profile, payout details
- [ ] `/vendor/coupons` — create/manage vendor-specific coupons

### Phase 11 — Admin Dashboard
- [ ] `/admin/dashboard` — platform metrics (total revenue, orders, users, vendors)
- [ ] `/admin/users` — list all users, change roles, disable accounts
- [ ] `/admin/vendors` — list vendors, view stores, deactivate
- [ ] `/admin/products` — view/remove any product
- [ ] `/admin/orders` — all orders, filter by status/vendor/date
- [ ] `/admin/categories` — CRUD categories and subcategories
- [ ] `/admin/coupons` — create/manage platform-wide coupons
- [ ] `/admin/payouts` — track vendor earnings, mark payouts as completed
- [ ] `/admin/settings` — site name, commission rate, contact info

---

## Design System (Minimal / Clean)

### Colors
```
Background:    #FFFFFF (white)
Surface:       #F9FAFB (gray-50)
Border:        #E5E7EB (gray-200)
Text primary:  #111827 (gray-900)
Text secondary:#6B7280 (gray-500)
Accent:        #111827 (black — buttons, links, active states)
Accent hover:  #374151 (gray-700)
Success:       #059669 (emerald-600)
Error:         #DC2626 (red-600)
```

### Typography
```
Font:          Inter (via next/font)
Headings:      font-semibold, tracking-tight
Body:          font-normal, text-gray-700
Small/Caption: text-sm text-gray-500
```

### Components Style
- Buttons: solid black primary, outlined secondary, rounded-md
- Cards: white bg, subtle border, rounded-lg, small shadow on hover
- Inputs: border-gray-300, rounded-md, focus:ring-black
- Spacing: generous whitespace, consistent padding (p-6 for cards, p-8 for sections)
- Images: rounded-lg, object-cover
- Navigation: sticky header, clean with logo left, search center, auth/cart right

---

## API Routes / Server Actions

### Auth
- `GET/POST /api/auth/[...nextauth]` — NextAuth routes

### Products
- `GET /api/products` — list with filters (category, price, sort, pagination)
- `GET /api/products/[slug]` — single product
- `GET /api/products/related/[id]` — related products

### Cart
- `GET /api/cart` — get user cart
- `POST /api/cart` — add item
- `PATCH /api/cart` — update quantity
- `DELETE /api/cart/[itemId]` — remove item
- `POST /api/cart/coupon` — apply coupon

### Orders
- `POST /api/checkout` — create Stripe session, create pending order
- `POST /api/webhooks/stripe` — handle payment events
- `GET /api/orders` — user order history
- `GET /api/orders/[id]` — order detail

### Vendor
- `POST /api/vendor/register` — create vendor profile
- `GET /api/vendor/products` — vendor's products
- `POST /api/vendor/products` — create product
- `PATCH /api/vendor/products/[id]` — update product
- `DELETE /api/vendor/products/[id]` — delete product
- `GET /api/vendor/orders` — vendor's orders
- `PATCH /api/vendor/orders/[id]` — update order status
- `CRUD /api/vendor/coupons` — vendor coupon management

### Admin
- `GET /api/admin/dashboard` — platform metrics
- `CRUD /api/admin/users` — user management
- `CRUD /api/admin/vendors` — vendor management
- `CRUD /api/admin/products` — product management
- `CRUD /api/admin/orders` — order management
- `CRUD /api/admin/categories` — category management
- `CRUD /api/admin/coupons` — coupon management
- `GET /api/admin/payouts` — vendor earnings
- `POST /api/admin/payouts/[vendorId]` — mark payout complete

### Wishlist
- `GET /api/wishlist` — get wishlist
- `POST /api/wishlist/[productId]` — toggle wishlist

### Contact
- `POST /api/contact` — submit contact form

---

## Middleware & Auth Guards

```
/vendor/*     → requires role: vendor or admin
/admin/*      → requires role: admin
/checkout     → requires authenticated user
/orders/*     → requires authenticated user
/wishlist     → requires authenticated user
/cart         → requires authenticated user (guests see "sign in to use cart")
```

---

## Project Structure

```
src/
├── app/
│   ├── (storefront)/
│   │   ├── page.tsx                    # Homepage
│   │   ├── categories/
│   │   │   ├── page.tsx                # All categories
│   │   │   └── [slug]/page.tsx         # Category products
│   │   ├── products/
│   │   │   └── [slug]/page.tsx         # Product detail
│   │   ├── store/
│   │   │   └── [slug]/page.tsx         # Vendor storefront
│   │   ├── cart/page.tsx
│   │   ├── checkout/
│   │   │   ├── page.tsx
│   │   │   ├── success/page.tsx
│   │   │   └── cancel/page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── wishlist/page.tsx
│   │   └── contact/page.tsx
│   ├── vendor/
│   │   ├── dashboard/page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/edit/page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── coupons/page.tsx
│   │   └── settings/page.tsx
│   ├── admin/
│   │   ├── dashboard/page.tsx
│   │   ├── users/page.tsx
│   │   ├── vendors/page.tsx
│   │   ├── products/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── categories/page.tsx
│   │   ├── coupons/page.tsx
│   │   ├── payouts/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── products/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── orders/
│   │   ├── vendor/
│   │   ├── admin/
│   │   ├── wishlist/
│   │   ├── contact/
│   │   └── webhooks/stripe/route.ts
│   └── layout.tsx
├── components/
│   ├── ui/                             # Buttons, inputs, cards, modals
│   ├── layout/                         # Header, Footer, Sidebar
│   ├── product/                        # ProductCard, ProductGrid, VariantSelector
│   ├── cart/                           # CartItem, CartSummary
│   ├── vendor/                         # VendorCard, VendorNav
│   └── admin/                          # AdminNav, DataTable, MetricCard
├── lib/
│   ├── db.ts                           # MongoDB connection
│   ├── auth.ts                         # NextAuth config
│   ├── stripe.ts                       # Stripe client
│   ├── cloudinary.ts                   # Upload helpers
│   └── utils.ts                        # formatPrice, slugify, etc.
├── models/
│   ├── User.ts
│   ├── VendorProfile.ts
│   ├── Product.ts
│   ├── Category.ts
│   ├── Cart.ts
│   ├── Order.ts
│   └── Coupon.ts
└── middleware.ts                        # Auth guards for protected routes
```

---

## Build Phases → Team Task Mapping

| Phase | Build Team Assignment | Review Focus |
|-------|----------------------|-------------|
| 1. Project Setup | backend + frontend (parallel) | architect: folder structure, config |
| 2. Homepage | frontend | ux: layout, responsiveness, whitespace |
| 3. Categories | frontend (pages) + backend (API) | ux: filters UX, architect: query patterns |
| 4. Product Details | frontend (page) + backend (API) | ux: gallery, variant UX, security: input validation |
| 5. Vendor Store | frontend | ux: consistency with storefront |
| 6. Cart | frontend + backend (parallel) | security: price tampering, architect: cart sync |
| 7. Checkout & Orders | backend (Stripe) + frontend | security: webhook verification, payment flow |
| 8. Wishlist | backend + frontend | architect: API consistency |
| 9. Contact | frontend | ux: form validation UX |
| 10. Vendor Dashboard | frontend + backend (parallel) | security: authorization, architect: CRUD patterns |
| 11. Admin Dashboard | frontend + backend (parallel) | security: admin auth, role escalation |
