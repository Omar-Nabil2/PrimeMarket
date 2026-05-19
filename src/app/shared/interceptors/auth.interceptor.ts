// src/app/core/auth.interceptor.ts  ← wherever your teammate put it
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../Services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const publicUrls = [
      '/api/Products/all',
      '/api/Products/',
      '/api/Auth'
    ];

    const isPublic = publicUrls.some(url => req.url.includes(url));

    if (isPublic) {
      return next.handle(req);
    }

    const token = this.authService.getToken();

    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(req);
  }
}