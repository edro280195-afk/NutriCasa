import { Injectable, inject } from '@angular/core';
import type { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getAccessToken();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError(error => {
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        return auth.refreshToken().pipe(
          switchMap(() => {
            const newToken = auth.getAccessToken();
            if (newToken) {
              req = req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` }
              });
            }
            return next(req);
          }),
          catchError(() => {
            auth.clearSession();
            return throwError(() => error);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
