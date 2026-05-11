import { Routes } from '@angular/router';
import { authGuard, loginGuard, onboardingGuard, dashboardGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';

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
    path: 'auth',
    children: [
      { path: 'reset-password', loadComponent: () => import('./pages/auth/reset-password.page').then(c => c.ResetPasswordPage) },
      { path: 'verify-email', loadComponent: () => import('./pages/auth/verify-email.page').then(c => c.VerifyEmailPage) },
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
      { path: 'profile/metrics', loadComponent: () => import('./pages/profile/metrics.page').then(c => c.MetricsPage) },
      { path: 'profile/family-group', loadComponent: () => import('./pages/profile/family-group.page').then(c => c.FamilyGroupPage) },
      { path: 'profile/medical', loadComponent: () => import('./pages/profile/medical-profile.page').then(c => c.MedicalProfilePage) },
      { path: 'profile/preferences', loadComponent: () => import('./pages/profile/preferences.page').then(c => c.PreferencesPage) },
      { path: 'profile/notifications', loadComponent: () => import('./pages/profile/notifications.page').then(c => c.NotificationsPage) },
      { path: 'profile/subscription', loadComponent: () => import('./pages/profile/subscription.page').then(c => c.SubscriptionPage) },
      { path: 'profile/:section', loadComponent: () => import('./pages/profile/coming-soon.page').then(c => c.ComingSoonPage) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadComponent: () => import('./layouts/admin-layout').then(c => c.AdminLayout),
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/admin/admin-dashboard.page').then(c => c.AdminDashboardPage) },
      { path: 'users', loadComponent: () => import('./pages/admin/admin-users.page').then(c => c.AdminUsersPage) },
      { path: 'posts', loadComponent: () => import('./pages/admin/admin-posts.page').then(c => c.AdminPostsPage) },
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
