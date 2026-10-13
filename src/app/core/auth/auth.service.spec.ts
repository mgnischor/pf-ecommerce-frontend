import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { API_BASE_URL } from '../api/api.tokens';
import { AuthStore } from './auth.store';
import { AuthService } from './auth.service';

function setup(): { service: AuthService; store: AuthStore; http: HttpTestingController } {
    TestBed.configureTestingModule({
        providers: [
            provideHttpClient(),
            provideHttpClientTesting(),
            { provide: API_BASE_URL, useValue: 'http://localhost:28080/api/v1' },
        ],
    });
    return {
        service: TestBed.inject(AuthService),
        store: TestBed.inject(AuthStore),
        http: TestBed.inject(HttpTestingController),
    };
}

describe('AuthService', () => {
    it('should sign in and complete the session from GET /auth/me, keeping the sign-in e-mail', () => {
        const { service, store, http } = setup();
        service.signIn('ana.souza@example.com', 'replace-with-a-long-unique-passphrase').subscribe();

        const tokens = http.expectOne('http://localhost:28080/api/v1/auth/tokens');
        tokens.flush({ accessToken: 'access', tokenType: 'Bearer', expiresIn: 600, refreshToken: 'refresh' });

        // GET /auth/me returns { id, accessLevel } only (backend AuthController.Me).
        const me = http.expectOne('http://localhost:28080/api/v1/auth/me');
        me.flush({ id: 'user-1', accessLevel: 'developer' });

        expect(store.isAuthenticated()).toBe(true);
        expect(store.accessLevel()).toBe('developer');
        expect(store.email()).toBe('ana.souza@example.com');
        http.verify();
    });

    it('should clear a half-open session when sign-in fails', () => {
        const { service, store, http } = setup();
        service.signIn('ana.souza@example.com', 'wrong').subscribe({
            error: () => undefined,
        });
        const tokens = http.expectOne('http://localhost:28080/api/v1/auth/tokens');
        tokens.flush(
            {
                type: 'https://errors.example.com/invalid-credentials',
                title: 'Invalid credentials.',
                status: 401,
                detail: 'Invalid credentials.',
                instance: '/api/v1/auth/tokens',
                traceId: 'trace',
                errors: [],
            },
            { status: 401, statusText: 'Unauthorized' }
        );
        expect(store.isAuthenticated()).toBe(false);
        http.verify();
    });

    it('should map the 201 registration response to void', () => {
        const { service, http } = setup();
        let done = false;
        service
            .register({ email: 'ana.souza@example.com', password: 'replace-with-a-long-unique-passphrase' })
            .subscribe({
                next: () => {
                    done = true;
                },
            });
        const req = http.expectOne('http://localhost:28080/api/v1/auth/registrations');
        req.flush({ id: 'user-1', accessLevel: 'public' }, { status: 201, statusText: 'Created' });
        expect(done).toBe(true);
        http.verify();
    });
});
