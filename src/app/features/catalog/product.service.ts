import type { HttpParams } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { ApiClient } from '../../core/api/api-client.service';
import type { Money, PagedResult } from '../../core/api/api.models';
import { newIdempotencyKey } from '../../shared/utils/idempotency-key';
import type { CreateProductInput, Product, ProductListQuery, UpdateProductInput } from './product';

/**
 * Catalog API surface (backend src/Catalog). Reads are anonymous; writes need
 * staff levels and concurrency preconditions. Totals and prices are computed
 * server-side; the client never sends authoritative totals.
 */
@Injectable({ providedIn: 'root' })
export class ProductService {
    private readonly api = inject(ApiClient);

    list(query: ProductListQuery = {}): Observable<PagedResult<Product>> {
        let params: HttpParams = this.api.pageParams(query);
        if (query.status) {
            params = params.set('status', query.status);
        }
        return this.api.get<PagedResult<Product>>('/products', {
            headers: new HttpHeaders({ 'X-Skip-Auth': '1' }),
            params,
        });
    }

    getById(id: string): Observable<Product> {
        return this.api.get<Product>(`/products/${encodeURIComponent(id)}`, {
            headers: new HttpHeaders({ 'X-Skip-Auth': '1' }),
        });
    }

    create(input: CreateProductInput): Observable<Product> {
        return this.api.post<CreateProductInput, Product>('/products', input, {
            headers: new HttpHeaders({ 'Idempotency-Key': newIdempotencyKey() }),
        });
    }

    rename(id: string, input: UpdateProductInput, version: number): Observable<Product> {
        return this.api.patch<UpdateProductInput, Product>(`/products/${encodeURIComponent(id)}`, input, {
            headers: new HttpHeaders({
                'Content-Type': 'application/merge-patch+json',
                'If-Match': `"${version}"`,
            }),
        });
    }

    changePrice(id: string, price: Money, version: number): Observable<Product> {
        return this.api.put<{ price: Money }, Product>(
            `/products/${encodeURIComponent(id)}/price`,
            { price },
            { headers: new HttpHeaders({ 'If-Match': `"${version}"` }) }
        );
    }

    activate(id: string, version: number): Observable<Product> {
        return this.api.post<Record<string, never>, Product>(
            `/products/${encodeURIComponent(id)}/activation`,
            {},
            { headers: new HttpHeaders({ 'If-Match': `"${version}"` }) }
        );
    }

    discontinue(id: string, version: number): Observable<Product> {
        return this.api.post<Record<string, never>, Product>(
            `/products/${encodeURIComponent(id)}/discontinuation`,
            {},
            { headers: new HttpHeaders({ 'If-Match': `"${version}"` }) }
        );
    }

    remove(id: string, version: number): Observable<void> {
        return this.api.delete<void>(`/products/${encodeURIComponent(id)}`, {
            headers: new HttpHeaders({
                'Idempotency-Key': newIdempotencyKey(),
                'If-Match': `"${version}"`,
            }),
        });
    }
}
