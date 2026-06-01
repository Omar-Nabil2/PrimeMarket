# PrimeMarket Frontend Project Summary

## Project Purpose and Overview

PrimeMarket is a single-page e-commerce frontend built with modern Angular (v21) and designed for a multi-role marketplace. It supports customer browsing, shopping cart checkout, wishlist management, seller brand onboarding, and separate dashboards for sellers and administrators.

The UI is configured as a standalone Angular application using `bootstrapApplication`, lazy-loaded feature routes, HTTP interceptors, and real-time notifications via SignalR.

## Folder / Module Structure

### Root
- `angular.json` - Angular workspace configuration
- `package.json` - npm dependencies and scripts
- `src/main.ts` - application bootstrap entry point
- `src/environments/` - environment configuration for API base URL and Stripe publishable key

### `src/app`
- `app.ts` - root component with app-wide effect for auth and notifications
- `app.config.ts` - application providers: router, HTTP client, auth interceptor, toastr
- `app.routes.ts` - top-level route definitions and lazy-loaded feature modules
- `Core/` - currently empty placeholder
- `features/` - application features grouped by domain
- `layouts/` - main and auth layout components
- `shared/` - shared utilities, guards, interceptors, models, and services

### `src/app/features`
- `admin-dashboard/` - admin pages and routes
- `auth/` - authentication pages and routes
- `Brands/` - brand-related listing and pages
- `Cart/` - cart pages and components
- `Checkout/` - checkout workflow and payment integration
- `dashboard/` - seller dashboard routes and pages
- `home/` - home page and product listing components
- `order-confirmation/` - order complete page
- `Product-Details/` - product detail pages and components
- `SellerRequest/` - become seller flow and guard
- `WishList/` - wishlist pages and routes

### `src/app/layouts`
- `auth-layout/` - layout for authentication pages
- `main-layout/` - layout for the main storefront and authenticated pages

### `src/app/shared`
- `components/` - common UI components like footer, navbar, notfound, notification sidebar
- `guards/` - route guards for auth, guest, role-based access
- `interceptors/` - HTTP auth interceptor for token refresh and authorization headers
- `Models/` - typed interfaces for auth, products, categories, checkout, orders, users, notifications
- `Services/` - shared service logic for auth, cart, products, categories, orders, wishlist, Stripe, notifications, etc.

## Key Technologies and Dependencies

- Angular 21 (standalone application style)
- TypeScript 5.9
- Bootstrap 5.3
- RxJS 7.8
- ngx-toastr for toast notifications
- @microsoft/signalr for real-time notifications
- Stripe (`@stripe/stripe-js`) for payment collection
- Leaflet for map or geolocation UI support
- Google One Tap (`@types/google-one-tap`, `google-one-tap`) for federated auth integration
- Prettier and Vitest for formatting and testing

## Main Features and Flows

1. Authentication
   - Email/password login
   - Registration
   - Google sign-in via backend `LoginWithGoogle`
   - Email confirmation, password reset, and profile updates
   - Role-based route protection for Customer, Seller, and Admin

2. Storefront / Catalog
   - Home page product listing
   - Product browsing by category and brand
   - Product detail pages with images, tabs, and reviews
   - Wishlist and cart operations

3. Cart and Checkout
   - Cart item add/remove/update
   - Checkout flow with Stripe payment integration
   - Order confirmation page after checkout

4. Notifications and Real-Time Updates
   - SignalR connection to `/hubs/notifications`
   - Real-time notification receipt and read/unread state
   - Notification summary loaded when authenticated

5. User and Role Flows
   - Customer account pages and order history
   - Seller registration request / brand onboarding
   - Seller dashboard for product and order management
   - Admin dashboard for managing products, users, and orders

## API Endpoints (Backend Integration)

The frontend uses `environment.apiUrl`, currently `https://localhost:7240`.

### Auth and Account
- `POST /api/auth` - login
- `POST /api/auth/register` - register
- `POST /api/auth/LoginWithGoogle` - Google login/register
- `POST /api/auth/confirm-email` - email confirmation
- `POST /api/auth/ForgetPassword-Confirm` - request password reset
- `POST /api/auth/reset-password` - reset password
- `POST /api/auth/new-refresh` - refresh access token
- `POST /api/auth/revoke-refresh-token` - revoke refresh token
- `GET /api/Account/Info` - user info
- `PUT /api/Account/Change-Password` - change password
- `POST /api/Account/Profile-Image` - upload profile image

### Products and Catalog
- `GET /api/Products` - product list and filtering
- `GET /api/Products/{productId}` - product detail
- `GET /api/Products/category/{categoryId}` - category products
- `GET /api/Products/{productId}/images` - product images
- `POST /api/Products/{productId}/images` - upload product images
- `DELETE /api/Products/{productId}/images/{imageId}` - delete image
- `PUT /api/Products/{productId}/images/{imageId}/set-primary` - set primary image

### Categories
- `GET /api/Categories` - public category list
- `POST /api/Categories` - create category
- `PUT /api/Categories/{id}` - update category
- `DELETE /api/Categories/{id}` - delete category

### Cart and Wishlist
- `GET /api/Cart` - fetch cart contents
- `POST /api/Cart/{productId}` - add product to cart
- `PUT /api/Cart/{cartItemId}` - update cart item quantity
- `DELETE /api/Cart/{cartItemId}` - remove cart item
- `GET /api/WishList` - fetch wishlist
- `POST /api/WishList/{productId}` - add to wishlist
- `DELETE /api/WishList/{productId}` - remove from wishlist

### Orders
- `GET /api/Orders` - customer orders
- `GET /api/Orders/seller` - seller order list
- `GET /api/Orders/admin` - admin order list
- `GET /api/Orders/seller/{orderId}` - seller order details
- `GET /api/Orders/admin/{orderId}` - admin order details
- `PUT /api/Orders/{orderId}/status` - update order status

### User and Management
- `GET /api/User` - list users
- `GET /api/User/{id}` - user detail
- `POST /api/User` - create user
- `PUT /api/User/{id}` - update user
- `PUT /api/User/{id}/toggle-status` - enable/disable user
- `PUT /api/User/{id}/unlock` - unlock user

### Notifications
- `GET /api/notification` - notification summary
- `PATCH /api/notification/{id}/read` - mark single notification read
- `PATCH /api/notification/read-all` - mark all read
- SignalR hub: `/hubs/notifications`

### Promo Codes
- `GET /api/PromoCode/All` - list promo codes
- `POST /api/PromoCode` - create promo code
- `PUT /api/PromoCode/{id}` - update promo code
- `DELETE /api/PromoCode/{id}` - delete promo code

## Data Models / Entities

### Authentication / User
- `AuthResponse` - authenticated user payload containing JWT, refresh token, roles, and profile data
- `AuthState` - local auth state for user, token, and login status
- `LoginRequest`, `RegisterRequest`, `ConfirmEmailRequest`, `ForgetPasswordRequest`, `ResetPasswordRequest`
- `UserInfo`, `UserProfileResponse`, `ProfileImageResponse`

### Product and Catalog
- `IProduct` - product detail model
- `IProcuctCard` - product card summary model
- product image and review DTOs in `shared/Models/Product/*`

### Orders and Checkout
- `ICustomerOrder`, `IAdminOrder`, `ISellerOrder` - order list models by role
- `ICustomerOrderItem` - order line item
- `IOrderAddress` - shipping address model
- `IPlaceOrderRequest` / `IPlaceOrderResponse` - checkout payloads
- `OrderStatus` enum

### Notifications
- `INotificationSummary` - summary with notification list
- `INotification` - single notification model

### Cart / Wishlist / Promo
- `ICart`, `ICartItem` - cart state models
- `IWishlistItem` - wishlist entry model
- `IPromoCode` - promo code model

## Auth and Security Approach

- Uses JWT access tokens stored in browser storage and refresh tokens for session renewal
- `auth.interceptor.ts` attaches bearer tokens to most outgoing requests
- refresh token flow triggers automatically when access token is expired or a 401 occurs
- route protection via:
  - `authGuard` for authenticated-only routes
  - `guestGuard` for auth pages only accessible when not logged in
  - `roleGuard(['Customer'])`, `roleGuard(['Seller'])`, `roleGuard(['Admin'])` for role-specific routes
- roles are derived from JWT claims and persisted user state
- real-time notifications are protected by SignalR access token factory

## Entry Points

- `src/main.ts` - bootstraps the Angular standalone application
- `src/app/app.ts` - root application component
- `src/app/app.config.ts` - sets up providers: router, HTTP client, interceptors, toastr
- `src/app/app.routes.ts` - defines top-level routing and lazy-loaded feature modules

## Notes

- The app is configured to use `https://localhost:7240` as the backend API in development.
- The project uses lazy-loading extensively for feature modules and route-level access control.
- The `Core/` folder currently exists as a placeholder with no content.
