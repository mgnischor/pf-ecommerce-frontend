import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { API_BASE_URL } from '../../core/api/api.tokens';
import { AuthStore } from '../../core/auth/auth.store';
import { SignIn } from './sign-in';

const BASE = 'http://localhost:5223/api/v1';

describe('SignIn', () => {
    let http: HttpTestingController;
    let fixture: ComponentFixture<SignIn>;
    let navigateByUrl: ReturnType<typeof vi.spyOn>;

    const root = (): HTMLElement => fixture.nativeElement as HTMLElement;
    const text = (): string => (root().textContent ?? '').replace(/\s+/g, ' ');

    async function settle(): Promise<void> {
        await fixture.whenStable();
        fixture.detectChanges();
    }

    function fill(email: string, password: string): void {
        fixture.componentInstance.form.setValue({ email, password });
    }

    function submitButton(): HTMLButtonElement {
        const button = root().querySelector<HTMLButtonElement>('button[type="submit"]');
        if (button === null) {
            throw new Error('Submit button not rendered.');
        }
        return button;
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: API_BASE_URL, useValue: BASE },
                {
                    provide: ActivatedRoute,
                    useValue: { snapshot: { queryParamMap: convertToParamMap({ returnUrl: '/orders' }) } },
                },
            ],
        });
        http = TestBed.inject(HttpTestingController);
        navigateByUrl = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
        fixture = TestBed.createComponent(SignIn);
    });

    afterEach(() => {
        http.verify();
        vi.restoreAllMocks();
    });

    it('should keep submit disabled until the form is valid', async () => {
        await settle();
        expect(submitButton().disabled).toBe(true);

        fill('ana@example.com', 'a-long-passphrase');
        await settle();
        expect(submitButton().disabled).toBe(false);
    });

    it('should sign in, load the profile and go back to the return URL', async () => {
        await settle();
        fill('ana@example.com', 'a-long-passphrase');
        fixture.componentInstance.submit();

        const tokens = http.expectOne(`${BASE}/auth/tokens`);
        expect(tokens.request.body).toEqual({ email: 'ana@example.com', password: 'a-long-passphrase' });
        tokens.flush({ accessToken: 'at', refreshToken: 'rt', expiresIn: 900 });
        http.expectOne(`${BASE}/auth/me`).flush({ id: 'u1', accessLevel: 'manager' });
        await settle();

        const store = TestBed.inject(AuthStore);
        expect(store.isAuthenticated()).toBe(true);
        expect(store.accessLevel()).toBe('manager');
        expect(navigateByUrl).toHaveBeenCalledWith('/orders');
    });

    it('should render the problem, stay signed out and allow another attempt on failure', async () => {
        await settle();
        fill('ana@example.com', 'wrong-passphrase');
        fixture.componentInstance.submit();
        http.expectOne(`${BASE}/auth/tokens`).flush(
            {
                type: 'https://errors.example.com/unauthorized',
                title: 'Authentication is required or failed.',
                status: 401,
                instance: '/api/v1/auth/tokens',
                traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
                errors: [{ ruleId: null, field: null, code: 'INVALID_CREDENTIALS', params: null }],
            },
            { status: 401, statusText: 'Unauthorized' }
        );
        await settle();

        expect(text()).toContain('Authentication is required or failed.');
        expect(text()).toContain('INVALID_CREDENTIALS');
        expect(TestBed.inject(AuthStore).isAuthenticated()).toBe(false);
        expect(navigateByUrl).not.toHaveBeenCalled();
        expect(submitButton().disabled).toBe(false);
    });
});
