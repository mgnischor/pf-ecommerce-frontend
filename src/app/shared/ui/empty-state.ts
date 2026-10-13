import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Empty-collection view. Collections return 200 with [] (never 404), so this
 * is the success-empty state, not an error (backend ai/API_CONTRACTS.md section 5).
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-md border border-dashed border-slate-300 p-8 text-center text-slate-600">
      <p class="text-lg font-medium">{{ title() }}</p>
      @if (hint()) {
        <p class="mt-1 text-sm">{{ hint() }}</p>
      }
      @if (actionLabel()) {
        <button
          type="button"
          (click)="action.emit()"
          class="mt-4 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          {{ actionLabel() }}
        </button>
      }
    </div>
  `,
})
export class EmptyState {
  readonly title = input.required<string>();
  readonly hint = input<string | null>(null);
  readonly actionLabel = input<string | null>(null);
  readonly action = output<void>();
}
