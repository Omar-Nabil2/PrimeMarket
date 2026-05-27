import { Routes } from '@angular/router';
import { Mainlayout } from './layouts/main-layout/mainlayout/mainlayout';
import { Authlayout } from './layouts/auth-layout/authlayout/authlayout';
import { Notfound } from './shared/components/notfound/notfound';
import { becomeSellerGuard } from './features/SellerRequest/BecomeSeller.guard';

export const routes: Routes = [
  {
    path: '',
    component: Mainlayout,
    children: [
      { path:'',loadChildren: () => import('./features/home/home.routes').then(m => m.HOME_ROUTES)},
      { path: 'products', data: { breadcrumb: 'Products' },loadChildren: () => import('./features/Product-Details/productDetails.routes').then(m => m.PRODUCT_DETAILS_ROUTES) },
      { path: 'wishlist',data: { breadcrumb: 'wishlist' },loadChildren: () => import('./features/WishList/wishlist.route').then( w => w.WISHLIST_ROUTES)},
      { path: 'cart', data: { breadcrumb: 'cart' },loadChildren: () => import('./features/Cart/Cart.routes').then(m => m.CART_ROUTES) },
      { path: 'checkout', data: { breadcrumb: 'checkout' },loadChildren: () => import('./features/Checkout/Checkout.routes').then(m => m.CHECKOUT_ROUTES) },
      { path: 'order-confirmation',data: { breadcrumb: 'order-confirmation' }, loadChildren: () => import('./features/order-confirmation/orderConfirmation.routes').then(m => m.ORDER_CONFIRMATION_ROUTES) },
      { path: 'brands', data: { breadcrumb: 'Brands' }, loadChildren: () => import('./features/Brands/Brands.routes').then(m => m.BRAND_ROUTES) },
      { path: 'become-seller',canActivate:[becomeSellerGuard] ,data: { breadcrumb: 'Register Brand' }, loadChildren: () => import('./features/SellerRequest/SellerRequest.routes').then(m => m.BECOME_SELLER_ROUTES) },
      { path: 'account', loadComponent: () => import('./features/auth/pages/user-info/user-info').then(m => m.UserInfoComponent) }
    ]
  },
  {
    path:'auth',
    component: Authlayout,
    children: [
      {path:'', loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)}
    ]
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then(m => m.DASHBOARD_ROUTES),
  },
  {
    path: 'admin-dashboard',
    loadChildren: () =>
      import('./features/admin-dashboard/admin-dashboard.routes').then(m => m.ADMIN_DASHBOARD_ROUTES),
  },
  {
    path:'**',
    component: Notfound
  }
];
