/**
 * HTTP contract primitives shared by every bounded context.
 *
 * Mirrors the backend conventions (pf-ecommerce-backend ai/API_CONTRACTS.md):
 * camelCase JSON, money as a decimal string plus ISO 4217 currency, cursor
 * pagination, and RFC 9457 Problem Details with stable machine-readable codes.
 * All types are client-side contracts, never domain entities.
 */

/** Money value as transported by the API: decimal string, never a JSON number. */
export interface Money {
    readonly amount: string;
    readonly currency: string;
}

/** One field-level failure inside a Problem Details response. */
export interface FieldError {
    readonly ruleId: string | null;
    readonly field: string | null;
    readonly code: string;
    readonly message: string;
    readonly params: Record<string, string> | null;
}

/**
 * RFC 9457 Problem Details extended by the backend with traceId and errors[].
 * Clients branch on `errors[].code`, never on `message`.
 */
export interface ProblemDetails {
    readonly type: string;
    readonly title: string;
    readonly status: number;
    readonly detail: string;
    readonly instance: string;
    readonly traceId: string;
    readonly errors: readonly FieldError[];
}

/** Cursor page returned by every collection endpoint. Empty result is 200 with []. */
export interface PagedResult<T> {
    readonly items: readonly T[];
    readonly nextCursor: string | null;
    readonly hasMore: boolean;
}

/** Query arguments accepted by every collection endpoint. */
export interface PageQuery {
    readonly limit?: number;
    readonly cursor?: string | null;
    readonly q?: string | null;
    readonly sort?: string | null;
}

export const DEFAULT_PAGE_LIMIT = 20;
export const MAX_PAGE_LIMIT = 100;

/** Type guard for Problem Details payloads. */
export function isProblemDetails(value: unknown): value is ProblemDetails {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const candidate = value as Record<string, unknown>;
    return (
        typeof candidate['type'] === 'string' &&
        typeof candidate['title'] === 'string' &&
        typeof candidate['status'] === 'number' &&
        Array.isArray(candidate['errors'])
    );
}
