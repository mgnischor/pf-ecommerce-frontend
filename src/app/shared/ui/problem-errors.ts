import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { ProblemDetails } from '../../core/api/api.models';

/**
 * Renders a Problem Details failure: one summary plus every field error at
 * once, each addressable by its field pointer so assistive tech can move
 * focus to the right input (backend ai/API_CONTRACTS.md section 4).
 */
@Component({
    selector: 'app-problem-errors',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        @if (problem(); as p) {
            <div role="alert" class="rounded-md border border-red-300 bg-red-50 p-4 text-red-900">
                <p class="font-semibold">{{ p.title }}</p>
                <p class="mt-1 text-sm">{{ p.detail }}</p>
                @if (p.errors.length > 0) {
                    <ul class="mt-2 list-disc space-y-1 pl-5 text-sm">
                        @for (e of p.errors; track e.code + (e.field ?? '')) {
                            <li>
                                <span class="font-mono text-xs">{{ e.code }}</span>
                                @if (e.field) {
                                    <span class="font-mono text-xs"> ({{ e.field }})</span>
                                }
                                <span> — {{ e.message }}</span>
                            </li>
                        }
                    </ul>
                }
            </div>
        }
    `,
})
export class ProblemErrors {
    readonly problem = input<ProblemDetails | null>(null);
}
