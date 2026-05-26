import { Routes } from '@angular/router';

export const BECOME_SELLER_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./become-aseller/become-aseller').then(m => m.BecomeASeller) }
];