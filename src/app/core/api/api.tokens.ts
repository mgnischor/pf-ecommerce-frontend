import { InjectionToken } from '@angular/core';

/**
 * Base URL of the versioned backend API (e.g. http://localhost:5223/api/v1).
 * Injected so tests and stories can substitute it. Never hardcode hosts in services.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

/** Default locale sent as Accept-Language (e.g. en, pt-BR). */
export const DEFAULT_LOCALE = new InjectionToken<string>('DEFAULT_LOCALE');
