import { Injectable, inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuthenticated()) return true;
  router.navigate(['/auth/login']);
  return false;
};

export const loginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (!auth.isAuthenticated()) return true;
  inject(Router).navigate(['/dashboard']);
  return false;
};

export const onboardingGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const user = auth.state().user;
  if (!user) return true;
  if (!user.onboardingComplete) return true;
  inject(Router).navigate(['/dashboard']);
  return false;
};

export const dashboardGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const user = auth.state().user;
  if (!user) return true;
  if (user.onboardingComplete) return true;
  inject(Router).navigate(['/onboarding']);
  return false;
};
