import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { LocalStorageService } from '../Service/Local/local-storage';

export const logadoGuard: CanActivateFn = () => {
  const localStorageService = inject(LocalStorageService);
  const router = inject(Router);

  if (!localStorageService.isAutenticado()) {
    router.navigate(['/auth']);
    return false;
  }

  return true;
};