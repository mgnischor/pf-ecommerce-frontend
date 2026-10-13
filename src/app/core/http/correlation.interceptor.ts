import type { HttpInterceptorFn } from '@angular/common/http';

/**
 * Adds an X-Request-ID to every request for log correlation with the backend
 * (which echoes traceId in Problem Details). Uses crypto.randomUUID, the only
 * randomness source needed on the client; no Math.random anywhere.
 */
export const correlationInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.headers.has('X-Request-ID')) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { 'X-Request-ID': crypto.randomUUID() } }));
};
