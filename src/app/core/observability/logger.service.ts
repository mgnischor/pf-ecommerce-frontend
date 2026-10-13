import { Injectable } from '@angular/core';

/**
 * Structured logger for the storefront. Info/debug stay in development only;
 * warn/error carry correlation IDs, never secrets, tokens, or full PII
 * (backend ai/SECURITY.md section 11.2, ai/OBSERVABILITY.md section 14).
 */
@Injectable({ providedIn: 'root' })
export class Logger {
    warn(message: string, context?: Record<string, string>): void {
        console.warn(message, context ?? {});
    }

    error(message: string, context?: Record<string, string>): void {
        console.error(message, context ?? {});
    }
}
