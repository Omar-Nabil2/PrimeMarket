import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../Services/auth.service';
import { ToastService } from '../Services/toast-service';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);
  

  if (!authService.isAuthenticated()) {
    return true;
  }

  toast.error('You are already logged in.');
  return router.createUrlTree(['/']);
};
