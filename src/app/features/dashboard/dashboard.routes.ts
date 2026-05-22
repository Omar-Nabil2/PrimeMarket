import { Routes } from '@angular/router';
import { DashboardLayout } from './layout/dashboard-layout/dashboard-layout';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: DashboardLayout,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/dashboard-home/dashboard-home').then(m => m.DashboardHome),
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/orders-section/orders-section').then(m => m.Orders),
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./pages/product-list/product-list').then(m => m.ProductList),
      },
      {
        path: 'products/create',
        loadComponent: () =>
          import('./pages/product-form/product-form').then(m => m.ProductForm),
      },
      {
        path: 'products/edit/:id',
        loadComponent: () =>
          import('./pages/product-form/product-form').then(m => m.ProductForm),
      },
      {
        path: 'inventory',
        loadComponent: () =>
          import('./pages/inventory/inventory').then(m => m.Inventory),
      },
      {
        path: 'inventory/:productId',
        loadComponent: () =>
          import('./pages/inventory/inventory').then(m => m.Inventory),
      },
    ],
  },
];