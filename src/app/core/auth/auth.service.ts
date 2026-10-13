import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { catchError, map, switchMap, tap, throwError } from 'rxjs';
import { ApiClient } from '../api/api-client.service';
import { AuthStore } from './auth.store';
import type { AccessLevel } from './access-level';

interface TokenResponse {
    readonly accessToken: string;
    readonly refreshToken: string;
    readonly expiresIn: number;
}

interface MeResponse {
    readonly id: string;
    readonly accessLevel: AccessLevel;
}

interface RegistrationResponse {
    readonly id: string;
    readonly accessLevel: AccessLevel;
}

/**
 * Identity use cases against /auth/*. Every method returns a cold Observable;
 * components subscribe once (async pipe) and the store update happens in tap.
 * Failures propagate as Problem Details errors; this service never swallows
 * them (fail closed, backend AGENTS.md rule).
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly api = inject(ApiClient);
    private readonly store = inject(AuthStore);

    register(input: {
        email: string;
        password: string;
        fullName?: string | undefined;
        phone?: string | undefined;
        locale?: string | undefined;
        timeZone?: string | undefined;
    }): Observable<void> {
        return this.api
            .post<typeof input, RegistrationResponse>('/auth/registrations', input)
            .pipe(map(() => undefined));
    }

    signIn(email: string, password: string): Observable<void> {
        return this.api
            .post<{ email: string; password: string }, TokenResponse>('/auth/tokens', {
                email,
                password,
            })
            .pipe(
                tap((tokens) => {
                    this.store.setSession({
                        accessToken: tokens.accessToken,
                        refreshToken: tokens.refreshToken,
                        accessLevel: 'public',
                        email,
                    });
                }),
                // The access level is authoritative from GET /auth/me, never from the token alone.
                switchMap(() => this.loadProfile()),
                map(() => undefined),
                catchError((error: unknown) => {
                    this.store.clear();
                    return throwError(() => error);
                })
            );
    }

    refresh(): Observable<void> {
        const refreshToken = this.store.refreshToken();
        if (refreshToken === null) {
            return throwError(() => new Error('No refresh token available.'));
        }
        return this.api.post<{ refreshToken: string }, TokenResponse>('/auth/tokens/refresh', { refreshToken }).pipe(
            tap((tokens) => {
                this.store.updateAccessToken(tokens.accessToken, tokens.refreshToken);
            }),
            map(() => undefined)
        );
    }

    loadProfile(): Observable<MeResponse> {
        return this.api.get<MeResponse>('/auth/me').pipe(
            tap((me) => {
                const accessToken = this.store.accessToken();
                const refreshToken = this.store.refreshToken();
                const email = this.store.email();
                // GET /auth/me returns { id, accessLevel } only; the e-mail stays the one used at sign-in.
                if (accessToken !== null && refreshToken !== null && email !== null) {
                    this.store.setSession({
                        accessToken,
                        refreshToken,
                        accessLevel: me.accessLevel,
                        email,
                    });
                }
            })
        );
    }

    signOut(): Observable<void> {
        const refreshToken = this.store.refreshToken();
        return this.api
            .post<{ refreshToken: string }, void>('/auth/tokens/revocation', {
                refreshToken: refreshToken ?? '',
            })
            .pipe(
                tap(() => this.store.clear()),
                catchError((error: unknown) => {
                    this.store.clear();
                    return throwError(() => error);
                })
            );
    }
}
