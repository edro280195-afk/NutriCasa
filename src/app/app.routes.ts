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
    path: '',
    canActivate: [authGuard, dashboardGuard],
    loadComponent: () => import('./layouts/main-layout').then(c => c.MainLayout),
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.page').then(c => c.DashboardPage) },
      { path: 'plan', loadComponent: () => import('./pages/plan/plan.page').then(c => c.PlanPage) },
      { path: 'family', loadComponent: () => import('./pages/family/family.page').then(c => c.FamilyPage) },
      { path: 'progress', loadComponent: () => import('./pages/progress/progress.page').then(c => c.ProgressPage) },
      { path: 'profile', loadComponent: () => import('./pages/profile/profile.page').then(c => c.ProfilePage) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  {
    path: 'legal',
    children: [
      { path: 'terms', loadComponent: () => import('./pages/legal/terms.page').then(c => c.TermsPage) },
      { path: 'privacy', loadComponent: () => import('./pages/legal/privacy.page').then(c => c.PrivacyPage) },
      { path: '', redirectTo: 'terms', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'auth' },
];
