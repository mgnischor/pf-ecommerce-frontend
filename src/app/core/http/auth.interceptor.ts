import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../auth/auth.store';

/**
 * Attaches the in-memory bearer token. Anonymous endpoints (/auth/tokens,
 * /auth/registrations, public catalog reads) opt out by sending
 * X-Skip-Auth: 1, so the default stays authenticated (default-deny).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(AuthStore);
  if (req.headers.has('X-Skip-Auth')) {
    return next(req.clone({ headers: req.headers.delete('X-Skip-Auth') }));
  }
  const token = store.accessToken();
  if (token === null) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
