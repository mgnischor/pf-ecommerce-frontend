import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, map, switchMap } from 'rxjs';
import { toProblemDetails, type ProblemDetails } from '../../core/http/http-errors';
import { Logger } from '../../core/observability/logger.service';
import { MoneyPipe } from '../../shared/pipes/money.pipe';
import { ProblemErrors } from '../../shared/ui/problem-errors';
import { ProductService } from './product.service';
import type { Product } from './product';

/** Public product detail. Draft/discontinued products answer 404 without a staff token. */
@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [RouterLink, MoneyPipe, ProblemErrors],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section class="mx-auto max-w-3xl px-4 py-8">
            <a routerLink="/products" class="text-sm text-slate-600 hover:underline">← Back to products</a>
            <app-problem-errors [problem]="problem()" />
            @if (isLoading()) {
                <p class="mt-6 text-sm text-slate-600" role="status">Loading product…</p>
            } @else if (product(); as p) {
                <h1 class="mt-4 text-3xl font-bold tracking-tight">{{ p.name }}</h1>
                <p class="mt-1 font-mono text-xs text-slate-500">{{ p.sku }} · {{ p.status }}</p>
                <p class="mt-4 text-2xl font-bold">{{ p.price | appMoney }}</p>
                @if (p.description) {
                    <p class="mt-4 text-slate-700">{{ p.description }}</p>
                }
            }
        </section>
    `,
})
export class ProductDetail {
    private readonly route = inject(ActivatedRoute);
    private readonly products = inject(ProductService);
    private readonly logger = inject(Logger);
    private readonly destroy = inject(DestroyRef);

    readonly product = signal<Product | null>(null);
    readonly isLoading = signal(true);
    readonly problem = signal<ProblemDetails | null>(null);

    constructor() {
        this.route.paramMap
            .pipe(
                map((params) => params.get('id') ?? ''),
                switchMap((id) => this.products.getById(id)),
                finalize(() => this.isLoading.set(false)),
                takeUntilDestroyed(this.destroy)
            )
            .subscribe({
                next: (product) => this.product.set(product),
                error: (error: unknown) => {
                    const problem = toProblemDetails(error);
                    this.problem.set(problem);
                    this.logger.warn('Product detail failed', { status: String(problem.status) });
                },
            });
    }
}
