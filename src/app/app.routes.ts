import { Routes } from '@angular/router';
import { Mainlayout } from './layouts/main-layout/mainlayout/mainlayout';
import { Home } from './features/home/pages/home/home';
import { Authlayout } from './layouts/auth-layout/authlayout/authlayout';
import { AUTH_ROUTES } from './features/auth/auth.routes';
import { Notfound } from './shared/components/notfound/notfound';

export const routes: Routes = [
  {
    path: '',
    component: Mainlayout,
    children: [
      {path:'', loadChildren: () => import('./features/home/home.routes').then(m => m.HOME_ROUTES)}
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
