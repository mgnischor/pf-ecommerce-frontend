import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthStore } from './core/auth/auth.store';
import { AuthService } from './core/auth/auth.service';

/** Storefront shell: header, navigation, and routed content. No business logic here. */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="border-b border-slate-200 bg-white">
      <nav class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3" aria-label="Main">
        <a routerLink="/products" class="text-lg font-bold tracking-tight">pf-ecommerce</a>
        <div class="flex items-center gap-4 text-sm">
          <a routerLink="/products" class="hover:underline">Products</a>
          <a routerLink="/cart" class="hover:underline">Cart</a>
          <a routerLink="/orders" class="hover:underline">Orders</a>
          @if (store.isAuthenticated()) {
            <span class="hidden text-slate-600 sm:inline">{{ store.email() }}</span>
            <button type="button" (click)="signOut()" class="rounded-md border px-3 py-1 hover:bg-slate-100">
              Sign out
            </button>
          } @else {
            <a routerLink="/sign-in" class="rounded-md bg-slate-900 px-3 py-1 text-white">Sign in</a>
          }
        </div>
      </nav>
    </header>
    <main>
      <router-outlet />
    </main>
    <footer class="mt-16 border-t border-slate-200">
      <p class="mx-auto max-w-6xl px-4 py-6 text-xs text-slate-500">
        Portfolio storefront. Prices and totals are computed by the API; the client never sends authoritative amounts.
      </p>
    </footer>
  `,
})
export class App {
  protected readonly store = inject(AuthStore);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  signOut(): void {
    this.auth.signOut().subscribe({
      next: () => void this.router.navigate(['/products']),
      error: () => void this.router.navigate(['/products']),
    });
  }
}
