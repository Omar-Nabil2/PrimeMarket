import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { EmailConfirmation } from './pages/email-confirmation/email-confirmation';
import { ForgetPassword } from './pages/forget-password/forget-password';
import { ResetPassword } from './pages/reset-password/reset-password';
import { UserInfoComponent } from './pages/user-info/user-info';


export const AUTH_ROUTES: Routes = [
  { path: '', component: Login },
  { path: 'signup', component: Register },
  { path: 'emailConfirmation', component: EmailConfirmation },
  { path: 'forget-password', component: ForgetPassword },
  { path: 'ForgetPassword', component: ResetPassword },
  { path: 'account', component: UserInfoComponent }
];
