import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { API_BASE_URL } from '../../core/api/api.tokens';
import { ProductDetail } from './product-detail';

const BASE = 'http://localhost:5223/api/v1';

function product(id: string, name: string): Record<string, unknown> {
    return {
        id,
        name,
        sku: `SKU-${id}`,
        price: { amount: '189.90', currency: 'BRL' },
        description: null,
        status: 'active',
        version: 1,
        allowedActions: [],
    };
}

function problem(status: number, code: string): Record<string, unknown> {
    return {
        type: 'https://errors.example.com/not-found',
        title: 'The resource was not found.',
        status,
        instance: '/api/v1/products/p1',
        traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
        errors: [{ ruleId: null, field: null, code, params: null }],
    };
}

describe('ProductDetail', () => {
    let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
    let http: HttpTestingController;
    let fixture: ComponentFixture<ProductDetail>;

    const text = (): string => ((fixture.nativeElement as HTMLElement).textContent ?? '').replace(/\s+/g, ' ');

    async function settle(): Promise<void> {
        await fixture.whenStable();
        fixture.detectChanges();
    }

    beforeEach(() => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        params = new BehaviorSubject(convertToParamMap({ id: 'p1' }));
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: API_BASE_URL, useValue: BASE },
                { provide: ActivatedRoute, useValue: { paramMap: params } },
            ],
        });
        http = TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(ProductDetail);
    });

    afterEach(() => {
        http.verify();
        vi.restoreAllMocks();
    });

    it('should show a loading state until the product arrives, then render it', async () => {
        await settle();
        expect(text()).toContain('Loading product');

        http.expectOne(`${BASE}/products/p1`).flush(product('p1', 'Cafeteira Italiana'));
        await settle();

        expect(text()).not.toContain('Loading product');
        expect(text()).toContain('Cafeteira Italiana');
        expect(text()).toContain('SKU-p1');
    });

    it('should render the problem and stop loading when the product is not found', async () => {
        await settle();
        http.expectOne(`${BASE}/products/p1`).flush(problem(404, 'PRODUCT_NOT_FOUND'), {
            status: 404,
            statusText: 'Not Found',
        });
        await settle();

        expect(text()).not.toContain('Loading product');
        expect(text()).toContain('The resource was not found.');
        expect(text()).toContain('PRODUCT_NOT_FOUND');
    });

    it('should load the new product when the route parameter changes, even after a failure', async () => {
        await settle();
        http.expectOne(`${BASE}/products/p1`).flush(problem(404, 'PRODUCT_NOT_FOUND'), {
            status: 404,
            statusText: 'Not Found',
        });
        await settle();

        params.next(convertToParamMap({ id: 'p2' }));
        await settle();
        expect(text()).toContain('Loading product');
        expect(text()).not.toContain('PRODUCT_NOT_FOUND');

        http.expectOne(`${BASE}/products/p2`).flush(product('p2', 'Moedor Elétrico'));
        await settle();

        expect(text()).not.toContain('Loading product');
        expect(text()).toContain('Moedor Elétrico');
    });

    it('should ignore a superseded response when the route changes while loading', async () => {
        await settle();
        const first = http.expectOne(`${BASE}/products/p1`);

        params.next(convertToParamMap({ id: 'p2' }));
        await settle();

        expect(first.cancelled).toBe(true);
        http.expectOne(`${BASE}/products/p2`).flush(product('p2', 'Moedor Elétrico'));
        await settle();

        expect(text()).toContain('Moedor Elétrico');
    });
});
