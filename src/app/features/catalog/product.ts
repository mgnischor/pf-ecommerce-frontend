import type { Money } from '../../core/api/api.models';

/** Product lifecycle. Anonymous callers only see active products (backend BR-CAT-003). */
export type ProductStatus = 'draft' | 'active' | 'discontinued';

/** Catalog product as returned by the API. Server owns price and status. */
export interface Product {
    readonly id: string;
    readonly name: string;
    readonly sku: string;
    readonly price: Money;
    readonly description: string | null;
    readonly status: ProductStatus;
    readonly version: number;
    readonly allowedActions: readonly string[];
}

export interface CreateProductInput {
    readonly name: string;
    readonly sku: string;
    readonly price: Money;
    readonly description?: string | null;
}

export interface UpdateProductInput {
    readonly name?: string | null;
    readonly description?: string | null;
}

export interface ProductListQuery {
    readonly limit?: number;
    readonly cursor?: string | null;
    readonly q?: string | null;
    readonly sort?: string | null;
    readonly status?: string | null;
}
