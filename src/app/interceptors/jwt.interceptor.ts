// src/app/interceptors/jwt.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const isUnauthenticatedRoute = req.url.includes('/auth/signup') || req.url.includes('/auth/login');

  if (!isUnauthenticatedRoute) {
    // Retrieve the token from local storage
    const token = authService.getToken();
    if (token) {
      // Clone the request and attach the Bearer token
      const clonedRequest = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      });
      return next(clonedRequest);
    }
  }

  // Proceed without modifying the request if no token or unauthenticated route
  return next(req);
};
