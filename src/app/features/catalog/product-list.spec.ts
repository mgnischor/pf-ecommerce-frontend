import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { API_BASE_URL } from '../../core/api/api.tokens';
import { ProductList } from './product-list';

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

function page(items: Record<string, unknown>[], nextCursor: string | null = null): Record<string, unknown> {
    return { items, nextCursor, hasMore: nextCursor !== null };
}

describe('ProductList', () => {
    let http: HttpTestingController;
    let fixture: ComponentFixture<ProductList>;

    const root = (): HTMLElement => fixture.nativeElement as HTMLElement;
    const text = (): string => (root().textContent ?? '').replace(/\s+/g, ' ');

    async function settle(): Promise<void> {
        await fixture.whenStable();
        fixture.detectChanges();
    }

    const listRequests = (): ReturnType<HttpTestingController['match']> =>
        http.match((r) => r.url === `${BASE}/products`);

    beforeEach(() => {
        vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        TestBed.configureTestingModule({
            providers: [
                provideRouter([]),
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: API_BASE_URL, useValue: BASE },
            ],
        });
        http = TestBed.inject(HttpTestingController);
        fixture = TestBed.createComponent(ProductList);
    });

    afterEach(() => {
        http.verify();
        vi.restoreAllMocks();
    });

    it('should load the first page anonymously with the default sort and render it', async () => {
        await settle();
        expect(text()).toContain('Loading products');

        const req = http.expectOne((r) => r.url === `${BASE}/products`);
        expect(req.request.params.get('limit')).toBe('20');
        expect(req.request.params.get('sort')).toBe('-createdAt');
        expect(req.request.headers.get('X-Skip-Auth')).toBe('1');
        req.flush(page([product('p1', 'Cafeteira Italiana'), product('p2', 'Moedor Elétrico')]));
        await settle();

        expect(text()).not.toContain('Loading products');
        expect(text()).toContain('Cafeteira Italiana');
        expect(text()).toContain('Moedor Elétrico');
        expect(text()).not.toContain('Load more');
    });

    it('should render the empty state, not an error, for an empty page', async () => {
        await settle();
        http.expectOne((r) => r.url === `${BASE}/products`).flush(page([]));
        await settle();

        expect(text()).toContain('No products found');
    });

    it('should render the problem and stop loading when the request fails', async () => {
        await settle();
        http.expectOne((r) => r.url === `${BASE}/products`).flush(
            {
                type: 'https://errors.example.com/internal-error',
                title: 'An unexpected error occurred.',
                status: 500,
                instance: '/api/v1/products',
                traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
                errors: [{ ruleId: null, field: null, code: 'INTERNAL_ERROR', params: null }],
            },
            { status: 500, statusText: 'Internal Server Error' }
        );
        await settle();

        expect(text()).not.toContain('Loading products');
        expect(text()).toContain('An unexpected error occurred.');
    });

    it('should append the next page using the cursor and hide load more at the end', async () => {
        await settle();
        http.expectOne((r) => r.url === `${BASE}/products`).flush(page([product('p1', 'Cafeteira Italiana')], 'c1'));
        await settle();
        expect(text()).toContain('Load more');

        const button = Array.from(root().querySelectorAll('button')).find((b) => b.textContent?.includes('Load more'));
        button?.click();
        await settle();

        const next = http.expectOne((r) => r.url === `${BASE}/products`);
        expect(next.request.params.get('cursor')).toBe('c1');
        next.flush(page([product('p2', 'Moedor Elétrico')]));
        await settle();

        expect(text()).toContain('Cafeteira Italiana');
        expect(text()).toContain('Moedor Elétrico');
        expect(text()).not.toContain('Load more');
    });

    it('should cancel the in-flight request and ignore its response when the sort changes', async () => {
        await settle();
        const first = http.expectOne((r) => r.url === `${BASE}/products`);

        const select = root().querySelector('select');
        if (select === null) {
            throw new Error('Sort select not rendered.');
        }
        select.value = 'name';
        select.dispatchEvent(new Event('change'));
        await settle();

        expect(first.cancelled).toBe(true);
        const [second, ...others] = listRequests();
        expect(others).toHaveLength(0);
        expect(second?.request.params.get('sort')).toBe('name');
        second?.flush(page([product('p2', 'Moedor Elétrico')]));
        await settle();

        expect(text()).toContain('Moedor Elétrico');
        expect(text()).not.toContain('Cafeteira Italiana');
    });

    it('should reload once when clearing an already empty search', async () => {
        await settle();
        http.expectOne((r) => r.url === `${BASE}/products`).flush(page([]));
        await settle();

        const clear = Array.from(root().querySelectorAll('button')).find((b) =>
            b.textContent?.includes('Clear search')
        );
        clear?.click();
        await settle();

        expect(listRequests()).toHaveLength(1);
    });
});
