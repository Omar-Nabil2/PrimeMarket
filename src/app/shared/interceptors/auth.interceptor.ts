import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../Services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const publicUrls = [
    '/api/Products',
    '/api/auth',
    '/api/Categories'
  ];

 const isBrandsPublic = req.url.toLowerCase().includes('/api/brands') && req.method === 'GET';
 const isPublic = isBrandsPublic || publicUrls.some(url => req.url.toLowerCase().includes(url.toLowerCase()));

  if (isPublic) return next(req);

  const token = authService.getToken();
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && authService.getRefreshToken() && !req.url.includes('new-refresh')) {
        return authService.refreshToken().pipe(
          switchMap((response) => {
            const retryReq = req.clone({ setHeaders: { Authorization: `Bearer ${response.token}` } });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            authService.logout();
            router.navigate(['/auth']);
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};