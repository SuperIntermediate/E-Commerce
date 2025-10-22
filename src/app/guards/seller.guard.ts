import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const sellerGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isSeller()) return true;
  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login'], { queryParams: { redirectUrl: state.url } });
  }
  return router.createUrlTree(['/account']);
};