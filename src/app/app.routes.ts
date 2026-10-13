import type { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

/**
 * Route map, one lazy slice per bounded context. Anonymous routes are explicit;
 * everything else goes through authGuard (default-deny, backend parity).
 * Unwired slices render NotImplemented (the frontend mirror of 501
 * ENDPOINT_NOT_IMPLEMENTED) instead of pretending to work.
 */
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'products' },
  {
    path: 'products',
    loadComponent: () => import('./features/catalog/product-list').then((m) => m.ProductList),
  },
  {
    path: 'products/:id',
    loadComponent: () => import('./features/catalog/product-detail').then((m) => m.ProductDetail),
  },
  {
    path: 'sign-in',
    loadComponent: () => import('./features/identity/sign-in').then((m) => m.SignIn),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/identity/register').then((m) => m.Register),
  },
  {
    path: 'cart',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/ui/not-implemented').then((m) => m.NotImplemented),
    data: { title: 'Cart' },
  },
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/ui/not-implemented').then((m) => m.NotImplemented),
    data: { title: 'Checkout' },
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/ui/not-implemented').then((m) => m.NotImplemented),
    data: { title: 'Orders' },
  },
  {
    path: 'account',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/ui/not-implemented').then((m) => m.NotImplemented),
    data: { title: 'Account' },
  },
  {
    path: 'forbidden',
    loadComponent: () => import('./shared/ui/forbidden').then((m) => m.Forbidden),
  },
  {
    path: '**',
    loadComponent: () => import('./shared/ui/not-found').then((m) => m.NotFound),
  },
];
