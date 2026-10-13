import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Placeholder for slices not wired yet. Mirrors the backend convention where
 * mapped but unwired endpoints answer 501 ENDPOINT_NOT_IMPLEMENTED: the route
 * exists, the work is tracked, nothing pretends to work.
 */
@Component({
    selector: 'app-not-implemented',
    standalone: true,
    imports: [RouterLink],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <section class="mx-auto max-w-xl px-4 py-16 text-center">
            <p class="font-mono text-xs uppercase tracking-widest text-slate-500">Not implemented yet</p>
            <h1 class="mt-2 text-2xl font-bold">{{ title() }}</h1>
            <p class="mt-2 text-sm text-slate-600">
                This slice is mapped in the router but not wired to a use case yet. Tracked in
                <span class="font-mono">ai/TASKS.md</span>.
            </p>
            <a
                routerLink="/products"
                class="mt-6 inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white"
            >
                Back to products
            </a>
        </section>
    `,
})
export class NotImplemented {
    readonly title = input.required<string>();
}
