import { computed, Injectable, signal } from '@angular/core';
import type { AccessLevel } from './access-level';

export interface Session {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly accessLevel: AccessLevel;
  readonly email: string;
}

/**
 * In-memory session store (signals). Tokens never touch localStorage or
 * sessionStorage: that keeps them out of persisted XSS exfiltration targets.
 * A page reload signs the user out by design; refresh rotation happens while
 * the app is alive. Never log tokens (backend ai/SECURITY.md section 11.2).
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly session = signal<Session | null>(null);

  readonly isAuthenticated = computed(() => this.session() !== null);
  readonly accessToken = computed(() => this.session()?.accessToken ?? null);
  readonly refreshToken = computed(() => this.session()?.refreshToken ?? null);
  readonly accessLevel = computed<AccessLevel | null>(() => this.session()?.accessLevel ?? null);
  readonly email = computed(() => this.session()?.email ?? null);

  setSession(session: Session): void {
    this.session.set(session);
  }

  updateAccessToken(accessToken: string, refreshToken: string): void {
    const current = this.session();
    if (current === null) {
      return;
    }
    this.session.set({ ...current, accessToken, refreshToken });
  }

  clear(): void {
    this.session.set(null);
  }
}
