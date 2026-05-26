import { Routes } from '@angular/router';

export const BRAND_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./Pages/brand-list/brand-list').then(m => m.BrandList), data: { breadcrumb: 'Brands' } },
  { path: ':id', loadComponent: () => import('./Pages/brand-details/brand-details').then(m => m.BrandDetails), data: { breadcrumb: 'Brand Details' } },
];