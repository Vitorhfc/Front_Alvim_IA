import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { LocalStorageService } from '../Service/Local/local-storage';

export const deslogadoGuard: CanActivateFn = () => {
  const localStorageService = inject(LocalStorageService);
  const router = inject(Router);

  if (localStorageService.isAutenticado()) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};