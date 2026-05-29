import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../Services/auth.service';
import { inject } from '@angular/core';
import { ToastService } from '../Services/toast-service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toast = inject(ToastService);
  

  if (authService.isAuthenticated()) {
    return true;
  }

  toast.error('You need to be logged in to access this page.');
  return router.createUrlTree(['/auth']);
};
