import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { DEFAULT_LOCALE } from '../api/api.tokens';

/** Sends Accept-Language so backend messages localize; falls back to the default locale. */
export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  const locale = inject(DEFAULT_LOCALE, { optional: true }) ?? 'en';
  if (req.headers.has('Accept-Language')) {
    return next(req);
  }
  return next(req.clone({ setHeaders: { 'Accept-Language': locale } }));
};
