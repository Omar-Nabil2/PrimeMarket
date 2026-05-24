import { Routes } from '@angular/router';

export const ORDER_CONFIRMATION_ROUTES: Routes = [
  { path: ':id', loadComponent: () => import('./order-confirmation').then(m => m.OrderConfirmation) }
];