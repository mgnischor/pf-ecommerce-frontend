import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthStore } from './auth.store';
import { satisfiesAccessLevel } from './access-level';
import type { AccessLevel } from './access-level';

/** Redirects anonymous users to /sign-in, preserving the return URL. */
export const authGuard: CanActivateFn = (_route, state) => {
  const store = inject(AuthStore);
  const router = inject(Router);
  if (store.isAuthenticated()) {
    return true;
  }
  return router.createUrlTree(['/sign-in'], { queryParams: { returnUrl: state.url } });
};

/** Requires at least `minimum` access level; anonymous users go to /sign-in. */
export function requireLevel(minimum: AccessLevel): CanActivateFn {
  return (_route, state) => {
    const store = inject(AuthStore);
    const router = inject(Router);
    if (satisfiesAccessLevel(store.accessLevel(), minimum)) {
      return true;
    }
    if (!store.isAuthenticated()) {
      return router.createUrlTree(['/sign-in'], { queryParams: { returnUrl: state.url } });
    }
    return router.createUrlTree(['/forbidden']);
  };
}
