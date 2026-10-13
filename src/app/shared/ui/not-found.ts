import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-not-found',
    standalone: true,
    imports: [RouterLink],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section class="mx-auto max-w-xl px-4 py-16 text-center">
            <h1 class="text-2xl font-bold">Page not found</h1>
            <p class="mt-2 text-sm text-slate-600">The page does not exist.</p>
            <a
                routerLink="/products"
                class="mt-6 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
                Back to products
            </a>
        </section>
    `,
})
export class NotFound {}
