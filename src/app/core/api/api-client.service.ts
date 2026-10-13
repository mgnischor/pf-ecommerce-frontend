import type { HttpHeaders } from '@angular/common/http';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { API_BASE_URL } from './api.tokens';
import type { PageQuery } from './api.models';
import { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from './api.models';

/**
 * Thin typed wrapper over HttpClient. One place owns base-URL joining,
 * cursor-query encoding, and JSON defaults. Business mapping lives in the
 * feature services, never here. All timestamps stay UTC strings; money stays
 * a decimal string (backend ai/API_CONTRACTS.md section 3).
 *
 * Options are assembled without explicit `undefined` values because the
 * project enables `exactOptionalPropertyTypes`.
 */
@Injectable({ providedIn: 'root' })
export class ApiClient {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = inject(API_BASE_URL);

    get<T>(path: string, options?: { headers?: HttpHeaders; params?: HttpParams }): Observable<T> {
        if (options?.params !== undefined && options?.headers !== undefined) {
            return this.http.get<T>(this.join(path), {
                headers: options.headers,
                params: options.params,
            });
        }
        if (options?.params !== undefined) {
            return this.http.get<T>(this.join(path), { params: options.params });
        }
        if (options?.headers !== undefined) {
            return this.http.get<T>(this.join(path), { headers: options.headers });
        }
        return this.http.get<T>(this.join(path));
    }

    post<TRequest, TResponse>(
        path: string,
        body: TRequest,
        options?: { headers?: HttpHeaders }
    ): Observable<TResponse> {
        if (options?.headers !== undefined) {
            return this.http.post<TResponse>(this.join(path), body, { headers: options.headers });
        }
        return this.http.post<TResponse>(this.join(path), body);
    }

    put<TRequest, TResponse>(path: string, body: TRequest, options?: { headers?: HttpHeaders }): Observable<TResponse> {
        if (options?.headers !== undefined) {
            return this.http.put<TResponse>(this.join(path), body, { headers: options.headers });
        }
        return this.http.put<TResponse>(this.join(path), body);
    }

    patch<TRequest, TResponse>(
        path: string,
        body: TRequest,
        options?: { headers?: HttpHeaders }
    ): Observable<TResponse> {
        if (options?.headers !== undefined) {
            return this.http.patch<TResponse>(this.join(path), body, { headers: options.headers });
        }
        return this.http.patch<TResponse>(this.join(path), body);
    }

    delete<TResponse>(path: string, options?: { headers?: HttpHeaders }): Observable<TResponse> {
        if (options?.headers !== undefined) {
            return this.http.delete<TResponse>(this.join(path), { headers: options.headers });
        }
        return this.http.delete<TResponse>(this.join(path));
    }

    /** Encodes a cursor page query, clamping limit to the documented default/max. */
    pageParams(query: PageQuery = {}): HttpParams {
        const limit = Math.min(Math.max(query.limit ?? DEFAULT_PAGE_LIMIT, 1), MAX_PAGE_LIMIT);
        let params = new HttpParams().set('limit', String(limit));
        if (query.cursor) {
            params = params.set('cursor', query.cursor);
        }
        if (query.q) {
            params = params.set('q', query.q);
        }
        if (query.sort) {
            params = params.set('sort', query.sort);
        }
        return params;
    }

    private join(path: string): string {
        const base = this.baseUrl.replace(/\/+$/, '');
        const suffix = path.startsWith('/') ? path : `/${path}`;
        return `${base}${suffix}`;
    }
}
