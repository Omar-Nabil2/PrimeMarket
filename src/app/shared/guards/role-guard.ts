import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../Services/auth.service';
import { ToastService } from '../Services/toast-service';

function getRolesFromToken(token: string): string[] {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const roles =
      payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

    if (!roles) return [];
    return Array.isArray(roles) ? roles : [roles];
}

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const toast = inject(ToastService);

    if (!authService.isAuthenticated()) {
      toast.error('You need to be logged in to access this page.');
      return router.createUrlTree(['/auth']);
    }

    const token = authService.getToken();

    // Token may be null if expired but refresh token exists.
    // In that case, fall back to roles from the saved user/signal.
    const roles = token ? getRolesFromToken(token) : authService.getRoles();

    const hasRole = roles.some(role => allowedRoles.includes(role));

    if (hasRole) return true;

    toast.error('You do not have permission to access this page.');
    return router.createUrlTree(['/']);
  };
};