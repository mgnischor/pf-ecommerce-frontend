import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { API_BASE_URL } from '../../core/api/api.tokens';
import { Register } from './register';

const BASE = 'http://localhost:5223/api/v1';

describe('Register', () => {
    let http: HttpTestingController;
    let fixture: ComponentFixture<Register>;
    let navigate: ReturnType<typeof vi.spyOn>;

    const text = (): string => ((fixture.nativeElement as HTMLElement).textContent ?? '').replace(/\s+/g, ' ');

    async function settle(): Promise<void> {
        await fixture.whenStable();
        fixture.detectChanges();
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: API_BASE_URL, useValue: BASE },
            ],
        });
        http = TestBed.inject(HttpTestingController);
        navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
        fixture = TestBed.createComponent(Register);
    });

    afterEach(() => {
        http.verify();
        vi.restoreAllMocks();
    });

    it('should reject passwords shorter than 12 characters on the client', async () => {
        await settle();
        const form = fixture.componentInstance.form;
        form.patchValue({ email: 'ana@example.com', password: 'short' });
        expect(form.invalid).toBe(true);

        fixture.componentInstance.submit();
        http.expectNone(`${BASE}/auth/registrations`);
    });

    it('should register without an empty full name and continue to sign-in', async () => {
        await settle();
        fixture.componentInstance.form.patchValue({
            email: 'ana@example.com',
            password: 'a-long-unique-passphrase',
            fullName: '',
        });
        fixture.componentInstance.submit();

        const req = http.expectOne(`${BASE}/auth/registrations`);
        expect(req.request.body).toEqual({ email: 'ana@example.com', password: 'a-long-unique-passphrase' });
        req.flush({ id: 'u1', accessLevel: 'public' }, { status: 201, statusText: 'Created' });
        await settle();

        expect(navigate).toHaveBeenCalledWith(['/sign-in']);
    });

    it('should render the problem returned by the API and let the user retry', async () => {
        await settle();
        fixture.componentInstance.form.patchValue({ email: 'ana@example.com', password: 'a-long-unique-passphrase' });
        fixture.componentInstance.submit();
        http.expectOne(`${BASE}/auth/registrations`).flush(
            {
                type: 'https://errors.example.com/business-rule-violation',
                title: 'The request violates a business rule.',
                status: 422,
                instance: '/api/v1/auth/registrations',
                traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
                errors: [{ ruleId: null, field: '/email', code: 'EMAIL_ALREADY_REGISTERED', params: null }],
            },
            { status: 422, statusText: 'Unprocessable Entity' }
        );
        await settle();

        expect(text()).toContain('EMAIL_ALREADY_REGISTERED');
        expect(navigate).not.toHaveBeenCalled();
        expect(fixture.componentInstance.isSubmitting()).toBe(false);
    });
});
