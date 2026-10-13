import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, EMPTY, Subject, switchMap } from 'rxjs';
import { toProblemDetails, type ProblemDetails } from '../../core/http/http-errors';
import { Logger } from '../../core/observability/logger.service';
import { EmptyState } from '../../shared/ui/empty-state';
import { ProblemErrors } from '../../shared/ui/problem-errors';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { ProductService } from './product.service';
import type { Product } from './product';

/**
 * Public product discovery: search, sort, and cursor pagination.
 * Anonymous read; the backend filters to active products without a token.
 */
@Component({
    selector: 'app-product-list',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink, MoneyPipe, ProblemErrors, EmptyState],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section class="mx-auto max-w-6xl px-4 py-8">
            <header class="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 class="text-3xl font-bold tracking-tight">Products</h1>
                    <p class="mt-1 text-sm text-slate-600">Search the catalog. Prices are computed by the server.</p>
                </div>
                <div class="flex gap-2">
                    <input
                        [formControl]="search"
                        type="search"
                        placeholder="Search products"
                        aria-label="Search products"
                        class="w-64 rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                    <select
                        (change)="onSortChange($event)"
                        aria-label="Sort products"
                        class="rounded-md border border-slate-300 px-3 py-2 text-sm"
                    >
                        <option value="-createdAt">Newest</option>
                        <option value="name">Name A–Z</option>
                        <option value="price">Lowest price</option>
                        <option value="-price">Highest price</option>
                    </select>
                </div>
            </header>

            <app-problem-errors [problem]="problem()" />

            @if (isLoading() && products().length === 0) {
                <p class="mt-8 text-sm text-slate-600" role="status">Loading products…</p>
            } @else if (products().length === 0 && !isLoading()) {
                <div class="mt-8">
                    <app-empty-state
                        title="No products found"
                        hint="Try a different search term."
                        actionLabel="Clear search"
                        (action)="onClearSearch()"
                    />
                </div>
            } @else {
                <ul class="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    @for (p of products(); track p.id) {
                        <li class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                            <a [routerLink]="['/products', p.id]" class="block">
                                <h2 class="font-semibold hover:underline">{{ p.name }}</h2>
                            </a>
                            <p class="mt-1 font-mono text-xs text-slate-500">{{ p.sku }}</p>
                            <p class="mt-2 text-lg font-bold">{{ p.price | appMoney }}</p>
                            @if (p.description) {
                                <p class="mt-1 line-clamp-2 text-sm text-slate-600">{{ p.description }}</p>
                            }
                        </li>
                    }
                </ul>
                @if (hasMore()) {
                    <div class="mt-6 text-center">
                        <button
                            type="button"
                            (click)="loadMore()"
                            [disabled]="isLoading()"
                            class="rounded-md bg-slate-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
                        >
                            {{ isLoading() ? 'Loading…' : 'Load more' }}
                        </button>
                    </div>
                }
            }
        </section>
    `,
})
export class ProductList {
    private readonly productsService = inject(ProductService);
    private readonly logger = inject(Logger);
    private readonly destroy = inject(DestroyRef);
    /** Every load goes through one switchMap, so a newer query cancels the one in flight. */
    private readonly loads = new Subject<{ cursor: string | null; q: string | null; sort: string }>();

    readonly search = new FormControl('', { nonNullable: true });
    readonly products = signal<readonly Product[]>([]);
    readonly nextCursor = signal<string | null>(null);
    readonly hasMore = signal(false);
    readonly isLoading = signal(false);
    readonly problem = signal<ProblemDetails | null>(null);
    private sort = '-createdAt';

    constructor() {
        this.loads
            .pipe(
                switchMap((load) =>
                    this.productsService.list({ limit: 20, cursor: load.cursor, q: load.q, sort: load.sort }).pipe(
                        catchError((error: unknown) => {
                            const problem = toProblemDetails(error);
                            this.problem.set(problem);
                            this.isLoading.set(false);
                            this.logger.warn('Product list failed', { status: String(problem.status) });
                            return EMPTY;
                        })
                    )
                ),
                takeUntilDestroyed(this.destroy)
            )
            .subscribe((page) => {
                this.products.update((current) => [...current, ...page.items]);
                this.nextCursor.set(page.nextCursor);
                this.hasMore.set(page.hasMore);
                this.isLoading.set(false);
            });

        this.search.valueChanges
            .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroy))
            .subscribe(() => this.reload());
        this.reload();
    }

    onSortChange(event: Event): void {
        const select = event.target as HTMLSelectElement | null;
        this.sort = select?.value ?? '-createdAt';
        this.reload();
    }

    onClearSearch(): void {
        // A non-empty term goes through the debounced valueChanges path (one reload);
        // an already empty term emits nothing there, so reload directly.
        if (this.search.value === '') {
            this.reload();
            return;
        }
        this.search.setValue('');
    }

    reload(): void {
        this.products.set([]);
        this.nextCursor.set(null);
        this.hasMore.set(false);
        this.fetch(null);
    }

    loadMore(): void {
        if (!this.hasMore() || this.isLoading()) {
            return;
        }
        this.fetch(this.nextCursor());
    }

    private fetch(cursor: string | null): void {
        this.isLoading.set(true);
        this.problem.set(null);
        this.loads.next({ cursor, q: this.search.value || null, sort: this.sort });
    }
}
