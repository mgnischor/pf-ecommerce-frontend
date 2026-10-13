import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { API_BASE_URL } from '../../core/api/api.tokens';
import { ProductService } from './product.service';

function setup(): { service: ProductService; http: HttpTestingController } {
    TestBed.configureTestingModule({
        providers: [
            provideHttpClient(),
            provideHttpClientTesting(),
            { provide: API_BASE_URL, useValue: 'http://localhost:5223/api/v1' },
        ],
    });
    return { service: TestBed.inject(ProductService), http: TestBed.inject(HttpTestingController) };
}

describe('ProductService', () => {
    it('should list products anonymously with cursor pagination', () => {
        const { service, http } = setup();
        service.list({ limit: 20, q: 'cafeteira', sort: '-createdAt' }).subscribe((page) => {
            expect(page.items).toHaveLength(1);
            expect(page.hasMore).toBe(false);
        });
        const req = http.expectOne(
            (r) =>
                r.url === 'http://localhost:5223/api/v1/products' &&
                r.params.get('limit') === '20' &&
                r.params.get('q') === 'cafeteira'
        );
        expect(req.request.headers.get('X-Skip-Auth')).toBe('1');
        req.flush({ items: [{ id: 'p1' }], nextCursor: null, hasMore: false });
        http.verify();
    });

    it('should send Idempotency-Key on create and If-Match on rename', () => {
        const { service, http } = setup();

        service
            .create({ name: 'Cafeteira', sku: 'CAF-600-PRT', price: { amount: '189.90', currency: 'BRL' } })
            .subscribe();
        const create = http.expectOne('http://localhost:5223/api/v1/products');
        expect(create.request.headers.has('Idempotency-Key')).toBe(true);
        create.flush({});

        service.rename('p1', { name: 'Cafeteira Premium' }, 3).subscribe();
        const rename = http.expectOne('http://localhost:5223/api/v1/products/p1');
        expect(rename.request.headers.get('If-Match')).toBe('"3"');
        expect(rename.request.headers.get('Content-Type')).toContain('merge-patch');
        rename.flush({});
        http.verify();
    });
});
