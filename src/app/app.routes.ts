import { Routes } from '@angular/router';
import { authGuard, loginGuard, onboardingGuard, dashboardGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'auth',
    canActivate: [loginGuard],
    children: [
      { path: 'login', loadComponent: () => import('./pages/auth/login.page').then(c => c.LoginPage) },
      { path: 'register', loadComponent: () => import('./pages/register/index.page').then(c => c.RegisterPage) },
      { path: 'forgot-password', loadComponent: () => import('./pages/forgot-password/index.page').then(c => c.ForgotPasswordPage) },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: 'onboarding',
    canActivate: [authGuard, onboardingGuard],
    loadComponent: () => import('./pages/onboarding/onboarding.page').then(c => c.OnboardingPage),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard, dashboardGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(c => c.DashboardPage),
  },
  {
    path: 'plan',
    canActivate: [authGuard, dashboardGuard],
    loadComponent: () => import('./pages/plan/plan.page').then(c => c.PlanPage),
  },
  {
    path: 'family',
    canActivate: [authGuard, dashboardGuard],
    loadComponent: () => import('./pages/family/family.page').then(c => c.FamilyPage),
  },
  {
    path: 'progress',
    canActivate: [authGuard, dashboardGuard],
    loadComponent: () => import('./pages/progress/progress.page').then(c => c.ProgressPage),
  },
  {
    path: 'profile',
    canActivate: [authGuard, dashboardGuard],
    loadComponent: () => import('./pages/profile/profile.page').then(c => c.ProfilePage),
  },
  { path: '', redirectTo: 'auth', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth' },
];
