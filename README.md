<div align="center">

# 🛒 PrimeMarket — Frontend

**Angular 21 · TypeScript 5.9 · Bootstrap 5 · SignalR · Stripe.js · RxJS**

[![Angular](https://img.shields.io/badge/Angular-21-DD0031?style=flat-square&logo=angular)](https://angular.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=flat-square&logo=bootstrap)](https://getbootstrap.com/)
[![RxJS](https://img.shields.io/badge/RxJS-7.8-B7178C?style=flat-square&logo=reactivex)](https://rxjs.dev/)
[![Stripe](https://img.shields.io/badge/Stripe-Elements-635BFF?style=flat-square&logo=stripe)](https://stripe.com/)
[![SignalR](https://img.shields.io/badge/SignalR-Real--Time-512BD4?style=flat-square)](https://dotnet.microsoft.com/apps/aspnet/signalr)

A reactive, multi-role single-page application for a modern e-commerce marketplace.
Built as a capstone project for the **ITI Professional Development & BI-infused CRM** track.

[GitHub — Backend](https://github.com/iibrahimshaban/PrimeMarket.git) · [Live Demo](#) · [Demo Video](#) · [Documentation](#)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Features](#-features)
- [Routing & Guards](#-routing--guards)
- [State Management](#-state-management)
- [Auth Flow](#-auth-flow)
- [Real-Time Notifications](#-real-time-notifications)
- [Getting Started](#-getting-started)
- [Environment Configuration](#-environment-configuration)
- [Project Structure](#-project-structure)
- [Team](#-team)

---

## 🌐 Overview

PrimeMarket is a standalone Angular 21 SPA for a multi-role e-commerce marketplace. It serves three distinct user roles — **Customer**, **Seller**, and **Admin** — each with isolated route trees, role-gated dashboards, and a unified reactive data layer.

The application integrates:

- **Stripe Elements** for PCI-compliant card capture at checkout
- **SignalR** for real-time order status updates and notifications
- **Google One Tap** for social sign-in
- **ngx-toastr** for contextual user feedback across all interactions

---

## 🛠 Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Angular | 21 (Standalone) | SPA framework — component tree, routing, DI, HTTP client |
| TypeScript | 5.9 | Type safety across the entire frontend codebase |
| RxJS | 7.8 | Async data streams, HTTP pipelines, filter/pagination |
| Angular Signals | Built-in | Synchronous reactive UI state — auth, cart badge, notifications |
| Bootstrap | 5.3 | Responsive grid and component styling |
| @microsoft/signalr | Latest | Real-time notification push from backend hub |
| @stripe/stripe-js | Latest | PCI-compliant card collection at checkout |
| ngx-toastr | Latest | Toast notifications for user action feedback |
| google-one-tap | Latest | Google OAuth federated sign-in |
| Leaflet | Latest | Map / geolocation UI support |
| Vitest | Latest | Unit testing |
| Prettier | Latest | Code formatting |

---

## 🏗 Architecture

The app is bootstrapped via `bootstrapApplication()` in `main.ts` — no NgModules. Every component is standalone and declares its own imports. All application-level providers (router, HTTP client, auth interceptor, toastr) are registered in `app.config.ts`.

### Standalone + Lazy Loading

```
app.routes.ts
├── /                    → HomeComponent          (eager)
├── /auth                → AuthModule             (lazy — unauthenticated only)
├── /products/:id        → ProductDetailsModule   (lazy)
├── /cart                → CartModule             (lazy — Customer)
├── /checkout            → CheckoutModule         (lazy — Customer)
├── /wishlist            → WishListModule         (lazy — Customer)
├── /brands              → BrandsModule           (lazy)
├── /order-confirmation  → OrderConfirmationModule(lazy — Customer)
├── /seller              → DashboardModule        (lazy — Seller)
├── /seller-request      → SellerRequestModule    (lazy — Customer)
├── /admin               → AdminDashboardModule   (lazy — Admin)
└── **                   → NotFoundComponent
```

> Customers never download the seller or admin bundles. Sellers never download the admin bundle. Lazy loading enforces this at the network level.

### Key Design Decisions

**Signals for UI state, RxJS for data streams**
Angular Signals drive synchronous, always-accurate UI state — the navbar cart badge count, the notification unread count, and the auth state. RxJS `BehaviorSubject + switchMap` drives data-fetching pipelines (product filtering, pagination) because `switchMap` cancels stale in-flight HTTP requests automatically when query parameters change.

**Single HTTP Interceptor**
`auth.interceptor.ts` handles two concerns transparently: attaching the `Authorization: Bearer` header to every outgoing request, and intercepting `401` responses to trigger a silent token refresh before retrying the original request. Feature services never touch token logic.

**Deferred token refresh**
The interceptor only fires a refresh when a `401` is received — not eagerly on app load. This avoids an unnecessary API call every time the browser tab opens.

**OnPush change detection**
Performance-critical components (product listing, cart, notification list) use `ChangeDetectionStrategy.OnPush`, limiting DOM diffing to Signal changes and `@Input()` reference changes only.

---

## ✨ Features

### 🔐 Authentication (Omar Nabil)
- Email/password login and registration
- Email confirmation with tokenized link
- Forgot password and reset password flows
- **Google One Tap** sign-in (`LoginWithGoogle` backend endpoint)
- JWT stored in browser storage; auth state held in an Angular Signal
- Silent token refresh via HTTP interceptor on `401`
- Explicit logout with refresh token revocation (`POST /api/auth/revoke-refresh-token`)

### 🏠 Customer Storefront (Ibrahim Khaled)
- Hero carousel on home page (Angular Signals, `OnPush`, brand color `#e74c3c`)
- Reactive product grid — filter by category, brand, price range
- `BehaviorSubject + switchMap` pipeline cancels stale requests on rapid filter changes
- Product detail page — image gallery with primary image highlight, description tabs, reviews
- Category-based browsing (`/api/Products/category/{id}`)
- Brand listing and brand-filtered product pages

### 🛒 Cart (Ibrahim Khaled)
- Server-side cart — persists across sessions and devices
- Add, update quantity, remove items
- Signal-driven navbar badge count updates instantly on every cart change
- ngx-toastr feedback on every cart action

### ❤️ Wishlist (Ibrahim Khaled)
- Add/remove products from wishlist
- Dedicated wishlist page
- Server-side persistence — survives refresh and device changes
- ngx-toastr feedback

### 💳 Checkout & Stripe (Ibrahim Khaled)
Full multi-step checkout flow:

1. Select or enter a shipping address
2. Apply an optional promo code — validated via `POST /api/Orders/validate-promo` before the total updates
3. **Stripe Elements** collects card details — card data never touches the PrimeMarket server
4. On submit, Stripe confirms the payment directly
5. Backend receives the `payment_intent.succeeded` webhook and creates the order
6. Customer is redirected to the order confirmation page

> **Why webhooks?** A user closing the browser tab after payment but before the success callback fires would leave a paid order unfulfilled. The Stripe webhook is the authoritative, server-to-server signal.

### 📦 Order History (Ibrahim Khaled)
- Customer order list with status, items, and totals
- Order detail view

### 🏪 Seller Dashboard (Mohamed ElMassry)
- Seller product management: create, edit, delete with multi-image upload
- Primary image selection per product
- Seller order list — filtered to own products only
- Order status update (e.g., Processing → Shipped) — triggers SignalR push to customer
- Inventory management: view and adjust stock levels
- Promo code management: create, list, update codes

### 🛠 Seller Onboarding (Mohamed ElMassry)
- Become-a-seller form — submits brand registration request to admin
- `sellerRequestGuard` prevents duplicate submissions by checking brand status first
- Brand status page shows pending / approved / rejected state

### ⚙️ Admin Dashboard (Omar Nabil)
- All products across all sellers
- All orders across all customers
- User management: list, create, edit, enable/disable, unlock
- Category CRUD
- Seller request approval / rejection — approval promotes user role **live via SignalR**
- Notification broadcast to all connected users

### 🔔 Real-Time Notifications (Omar Nabil)
- SignalR connection to `/hubs/notifications` with JWT via `accessTokenFactory`
- Notification sidebar in the main layout — slides in from the right
- Real-time push for order updates, role promotions, admin broadcasts
- Mark individual or all notifications as read
- Unread badge count on the navbar — driven by a Signal

---

## 🛡 Routing & Guards

| Guard | Applied To | Behaviour |
|---|---|---|
| `authGuard` | All authenticated routes | Redirects to `/auth/login` if not logged in |
| `guestGuard` | `/auth/**` | Redirects to `/` if already authenticated |
| `roleGuard(['Customer'])` | Cart, Checkout, Wishlist, Orders | Redirects non-customers |
| `roleGuard(['Seller'])` | `/seller/**` | Redirects non-sellers |
| `roleGuard(['Admin'])` | `/admin/**` | Redirects non-admins |
| `sellerRequestGuard` | `/seller-request` | Blocks users who already have a pending/approved brand |

`roleGuard` is a **factory function** — it accepts an array of allowed roles, reads the current user's roles from the decoded JWT, and redirects to an appropriate fallback. One guard handles all role checks.

---

## 📊 State Management

PrimeMarket uses a **two-tier reactive state** approach — no external state library needed:

| State Type | Tool | Examples |
|---|---|---|
| UI / synchronous state | Angular Signals | `isAuthenticated`, `cartItemCount`, `unreadNotificationCount`, `currentUser` |
| Async / server state | RxJS `BehaviorSubject + switchMap` | Product list with filters, seller order list, paginated admin views |

**Why this split?**
Signals are ideal for state that changes in response to user actions and must immediately update the DOM (badge counts, navbar visibility). `BehaviorSubject` is ideal for state that triggers HTTP requests and needs cancellation semantics (`switchMap`) to avoid race conditions.

---

## 🔑 Auth Flow

```
User submits login form
        │
        ▼
POST /api/Auth ──────────────────► Backend validates credentials
        │                                      │
        │◄──── JWT (short-lived) + Refresh Token (long-lived) ────┘
        │
        ▼
Auth Signal updated ──► Navbar, guards, and interceptor react instantly
        │
        ▼
On any 401 response:
  Interceptor calls POST /api/Auth/new-refresh
        │
        ▼
  New JWT received ──► Original request retried transparently
        │
        ▼
On logout:
  POST /api/Auth/revoke-refresh-token ──► Token invalidated server-side
  Auth Signal cleared ──► User redirected to login
```

---

## 📡 Real-Time Notifications

```typescript
// HubConnectionBuilder configured in NotificationService
const connection = new HubConnectionBuilder()
  .withUrl(`${environment.apiUrl}/hubs/notifications`, {
    accessTokenFactory: () => this.authService.getToken()
  })
  .withAutomaticReconnect()
  .build();

// Listening for pushed events
connection.on('ReceiveNotification', (notification) => {
  this.notificationsSignal.update(n => [notification, ...n]);
  this.unreadCountSignal.update(c => c + 1);
});
```

Events received in real time:
- **Order status changed** — pushed to the customer when a seller updates an order
- **Seller approved** — pushed to the specific user when admin approves their brand request
- **Admin broadcast** — pushed to all connected clients simultaneously

---

## 🚀 Getting Started

### Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [Angular CLI 21](https://angular.dev/tools/cli): `npm install -g @angular/cli`
- Backend API running at `https://localhost:7240` ([backend repo](https://github.com/iibrahimshaban/PrimeMarket.git))

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Omar-Nabil2/PrimeMarket.git
cd PrimeMarket

# 2. Install dependencies
npm install

# 3. Start the development server
ng serve
```

The app starts at `http://localhost:4200`.

---

## ⚙️ Environment Configuration

Edit `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7240',
  stripePublishableKey: 'pk_test_...'
};
```

For production, edit `src/environments/environment.prod.ts` with your deployed API URL and live Stripe publishable key.

---

## 📁 Project Structure

```
src/
├── main.ts                          # bootstrapApplication() entry point
│
└── app/
    ├── app.ts                       # Root component — auth effect, SignalR init
    ├── app.config.ts                # Providers: router, HTTP client, interceptor, toastr
    ├── app.routes.ts                # Top-level routes with lazy-loaded feature modules
    │
    ├── features/
    │   ├── auth/                    # Login, register, confirm email, password reset
    │   ├── home/                    # Home page, hero carousel, product listing grid
    │   ├── Product-Details/         # Product detail — images, tabs, reviews
    │   ├── Brands/                  # Brand listing and brand-filtered products
    │   ├── Cart/                    # Cart page and item management
    │   ├── Checkout/                # Checkout flow with Stripe Elements
    │   ├── WishList/                # Wishlist page
    │   ├── order-confirmation/      # Post-payment confirmation page
    │   ├── dashboard/               # Seller dashboard — products, orders, inventory
    │   ├── SellerRequest/           # Become-a-seller onboarding flow
    │   └── admin-dashboard/         # Admin — users, orders, categories, seller requests
    │
    ├── layouts/
    │   ├── auth-layout/             # Shell for unauthenticated pages
    │   └── main-layout/             # Shell for authenticated pages — navbar, notification sidebar
    │
    └── shared/
        ├── guards/
        │   ├── auth.guard.ts        # Require authenticated user
        │   ├── guest.guard.ts       # Block if already authenticated
        │   ├── role.guard.ts        # Factory — roleGuard(['Seller']) etc.
        │   └── seller-request.guard.ts
        │
        ├── interceptors/
        │   └── auth.interceptor.ts  # Attach Bearer token + silent 401 refresh
        │
        ├── Services/
        │   ├── auth.service.ts      # Auth Signal, login, logout, token management
        │   ├── cart.service.ts      # Cart API calls + cart count Signal
        │   ├── product.service.ts   # Product listing with filter BehaviorSubject
        │   ├── order.service.ts     # Orders by role
        │   ├── wishlist.service.ts  # Wishlist API calls
        │   ├── notification.service.ts  # SignalR connection + notifications Signal
        │   ├── stripe.service.ts    # Stripe Elements setup and payment confirmation
        │   └── category.service.ts  # Category list
        │
        ├── Models/
        │   ├── auth/                # AuthResponse, AuthState, LoginRequest, etc.
        │   ├── Product/             # IProduct, IProductCard, image/review DTOs
        │   ├── Order/               # ICustomerOrder, ISellerOrder, IAdminOrder, etc.
        │   ├── Cart/                # ICart, ICartItem
        │   ├── Wishlist/            # IWishlistItem
        │   ├── Notification/        # INotification, INotificationSummary
        │   └── PromoCode/           # IPromoCode
        │
        └── components/
            ├── navbar/
            ├── footer/
            ├── notification-sidebar/
            └── notfound/
```

---

## 👥 Team

| Code | Name | Contribution |
|---|---|---|
| 6 | **Ibrahim Khaled** | Home page · Product browsing · Cart · Wishlist · Checkout (Stripe) · Order history · Order confirmation |
| 17 | **Mohamed ElMassry** | Seller dashboard · Product management · Seller orders · Inventory · Promo codes · Route guards · Seller onboarding |
| 20 | **Omar Nabil** | Admin dashboard · Auth pages · JWT interceptor · SignalR notifications · User management · Category management · Auth/guest/role guards |

---

## 🔗 Related

| Resource | Link |
|---|---|
| Backend Repository | [github.com/iibrahimshaban/PrimeMarket](https://github.com/iibrahimshaban/PrimeMarket.git) |
| Live Frontend | _Coming soon_ |
| Live API | _Coming soon_ |
| Demo Video | _Coming soon_ |

---

<div align="center">

Made with ❤️ by the PrimeMarket team · ITI 2024/2025

</div>
