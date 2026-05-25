import { Routes } from '@angular/router';
import { AdminDashboardLayout } from './layout/admin-dashboard-layout/admin-dashboard-layout';
import { AdminDashboardOverview } from './Pages/admin-dashboard-overview/admin-dashboard-overview';
import { AdminUsers } from './Pages/admin-users/admin-users';
import { AdminProducts } from './Pages/admin-products/admin-products';
import { AdminOrders } from './Pages/admin-orders/admin-orders';
import { AdminCategories } from './Pages/admin-categories/admin-categories';
import { AdminPromoCode } from './Pages/admin-promo-code/admin-promo-code';

export const ADMIN_DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: AdminDashboardLayout,
    children: [
      {
        path: '',
        component: AdminDashboardOverview
      },
      {
        path: 'users',
        component: AdminUsers
      },
      {
        path: 'products',
        component: AdminProducts
      },
      {
        path: 'orders',
        component: AdminOrders
      },
      {
        path: 'categories',
        component: AdminCategories
      },
      {
        path: 'promo-code',
        component: AdminPromoCode
      }
    ]
  }
];
