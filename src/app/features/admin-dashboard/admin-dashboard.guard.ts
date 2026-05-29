import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../shared/Services/auth.service';
import { ToastService } from '../../shared/Services/toast-service';

export const adminDashboardGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastService = inject(ToastService);

  if (!authService.isAuthenticated()) {
    toastService.error('Please sign in to access the admin dashboard.');
    router.navigate(['/auth']);
    return false;
  }

  if (!authService.isAdmin()) {
    toastService.error('You do not have permission to access the admin dashboard.');
    router.navigate(['/']);
    return false;
  }

  return true;
};
