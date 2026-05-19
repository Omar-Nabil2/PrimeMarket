import { Routes } from '@angular/router';
import { Mainlayout } from './layouts/main-layout/mainlayout/mainlayout';
import { Authlayout } from './layouts/auth-layout/authlayout/authlayout';
import { Notfound } from './shared/components/notfound/notfound';

export const routes: Routes = [
  {
    path: '',
    component: Mainlayout,
    children: [
      { path:'', loadChildren: () => import('./features/home/home.routes').then(m => m.HOME_ROUTES)},
      { path: 'products', loadChildren: () => import('./features/Product-Details/productDetails.routes').then(m => m.PRODUCT_DETAILS_ROUTES) },
      { path: 'wishlist',loadChildren: () => import('./features/WishList/wishlist.route').then( w => w.WISHLIST_ROUTES)},
      { path: 'cart', loadChildren: () => import('./features/Cart/Cart.routes').then(m => m.CART_ROUTES) }
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
    path:'**',
    component: Notfound
  }
];
