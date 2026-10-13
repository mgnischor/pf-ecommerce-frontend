import { inject, Injectable, signal } from '@angular/core';

/**
 * Minimal locale state. The active locale drives Accept-Language (see
 * languageInterceptor) and locale-aware pipes. Catalog content falls back
 * through the configured chain; formatting itself is the client's job
 * (backend ai/API_CONTRACTS.md section 7).
 */
@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly current = signal('en');

  readonly locale = this.current.asReadonly();

  setLocale(locale: string): void {
    this.current.set(locale);
  }
}

export function injectLocale(): LocaleService {
  return inject(LocaleService);
}
