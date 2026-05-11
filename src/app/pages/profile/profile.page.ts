import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SubscriptionService } from '../../services/subscription.service';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [RouterLink],
  template: `
  <div class="page">
    <div class="page-header">
      <div class="page-brand">
        <svg class="leaf-icon" viewBox="0 0 24 24"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>
        NutriCasa
      </div>
      <div class="page-actions">
        <button class="icon-btn" (click)="logout()">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </div>

    <div class="profile-card">
      <div class="profile-avatar">
        <div class="profile-avatar-fallback">{{ initials() }}</div>
      </div>
      <h1 class="profile-name">{{ user().user?.fullName || 'Usuario' }}</h1>
      <div class="profile-email">{{ user().user?.email }}</div>
      <div class="profile-badge">{{ planName() }}</div>
    </div>

    <div class="profile-stats">
      <div class="ps-item">
        <div class="ps-value">{{ daysActive }}</div>
        <div class="ps-label">Días activo</div>
      </div>
      <div class="ps-item">
        <div class="ps-value">--</div>
        <div class="ps-label">Adherencia</div>
      </div>
      <div class="ps-item">
        <div class="ps-value">--</div>
        <div class="ps-label">kg perdidos</div>
      </div>
      <div class="ps-item">
        <div class="ps-value">--</div>
        <div class="ps-label">Ahorrado</div>
      </div>
    </div>

    <div class="settings">
      <div class="settings-head">Ajustes</div>

      <div class="settings-item" routerLink="/profile/metrics">
        <div class="si-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
        </div>
        <div class="si-content">
          <div class="si-title">Mis métricas</div>
          <div class="si-meta">Peso, medidas, metas</div>
        </div>
        <svg class="si-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </div>

      <div class="settings-item" routerLink="/profile/medical">
        <div class="si-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
        </div>
        <div class="si-content">
          <div class="si-title">Mi perfil médico</div>
          <div class="si-meta">Condiciones, alergias, medicamentos</div>
        </div>
        <svg class="si-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </div>

      <div class="settings-item" routerLink="/profile/family-group">
        <div class="si-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
        <div class="si-content">
          <div class="si-title">Mi grupo familiar</div>
          <div class="si-meta">Miembros, racha, adherencia</div>
        </div>
        <svg class="si-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </div>

      @if (isAdmin()) {
        <div class="settings-item" routerLink="/admin/dashboard">
          <div class="si-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div class="si-content">
            <div class="si-title">Panel Admin</div>
            <div class="si-meta">Dashboard, usuarios, publicaciones</div>
          </div>
          <svg class="si-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </div>
      }

      <div class="settings-item" routerLink="/profile/subscription">
        <div class="si-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <div class="si-content">
          <div class="si-title">Mi suscripción</div>
          <div class="si-meta">Plan, facturación, cancelar</div>
        </div>
        <svg class="si-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </div>

      <div class="settings-item" routerLink="/profile/preferences">
        <div class="si-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </div>
        <div class="si-content">
          <div class="si-title">Preferencias</div>
          <div class="si-meta">Notificaciones, privacidad, modo de presupuesto</div>
        </div>
        <svg class="si-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </div>

      <div class="settings-item" routerLink="/profile/notifications">
        <div class="si-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        </div>
        <div class="si-content">
          <div class="si-title">Notificaciones</div>
          <div class="si-meta">Recordatorios, tranquilidad, muro familiar</div>
        </div>
        <svg class="si-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
      </div>
    </div>

    <div class="logout-section">
      <button class="logout-btn" (click)="logout()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Cerrar sesión
      </button>
    </div>

    <div class="version">NutriCasa v1.0.0</div>
  </div>

  `,
  styles: [`
    :host { display: contents; }
    .page {
      max-width: 480px; margin: 0 auto;
      padding: 0 20px 120px;
      background: var(--cream);
      position: relative; z-index: 1;
    }
    .page-header {
      padding: 24px 0 20px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .page-brand {
      font-family: var(--display); font-size: 22px; font-weight: 500;
      color: var(--pine);
      display: flex; align-items: center; gap: 8px;
    }
    .page-brand svg { width: 22px; height: 22px; fill: var(--mint); }
    .page-actions { display: flex; gap: 10px; }
    .icon-btn {
      width: 42px; height: 42px;
      background: var(--paper); border-radius: var(--r-pill);
      display: flex; align-items: center; justify-content: center;
      color: var(--ink); box-shadow: var(--shadow-sm);
    }

    .profile-card {
      display: flex; flex-direction: column;
      align-items: center; padding: 24px 0 20px;
    }
    .profile-avatar { margin-bottom: 16px; }
    .profile-avatar-fallback {
      width: 72px; height: 72px; border-radius: 50%;
      background: linear-gradient(135deg, var(--mint), var(--lake));
      display: flex; align-items: center; justify-content: center;
      color: var(--pine-darker); font-weight: 700; font-size: 28px;
    }
    .profile-name {
      font-family: var(--display); font-size: 24px; font-weight: 500;
      color: var(--ink); letter-spacing: -0.01em;
    }
    .profile-email { font-size: 13px; color: var(--ink-muted); margin-bottom: 12px; }
    .profile-badge {
      font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
      background: var(--mint-soft); color: var(--pine);
      padding: 6px 16px; border-radius: var(--r-pill);
    }

    .profile-stats {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;
      margin-bottom: 28px;
    }
    .ps-item {
      background: var(--paper); border: 1px solid var(--line);
      border-radius: var(--r-lg); padding: 14px 8px;
      text-align: center;
    }
    .ps-value {
      font-family: var(--display); font-size: 20px; font-weight: 500;
      color: var(--pine); line-height: 1;
    }
    .ps-label {
      font-size: 9px; font-weight: 600; color: var(--ink-muted);
      letter-spacing: 0.04em; margin-top: 4px;
    }

    .settings-head {
      font-size: 11px; font-weight: 700; letter-spacing: 0.18em;
      text-transform: uppercase; color: var(--mint);
      margin-bottom: 12px;
    }
    .settings { margin-bottom: 24px; display: flex; flex-direction: column; gap: 2px; }
    .settings-item {
      background: var(--paper); border: 1px solid var(--line);
      border-radius: var(--r-lg); padding: 16px;
      display: flex; align-items: center; gap: 14px;
      margin-bottom: 8px; cursor: pointer;
      transition: all 0.2s var(--ease-out);
    }
    .settings-item:hover { border-color: var(--mint); }
    .si-icon {
      width: 38px; height: 38px; border-radius: 10px;
      background: var(--cream-warm); color: var(--pine);
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .si-content { flex: 1; }
    .si-title { font-size: 14px; font-weight: 600; color: var(--ink); }
    .si-meta { font-size: 11px; color: var(--ink-muted); margin-top: 2px; }
    .si-arrow { color: var(--ink-muted); }

    .logout-section { margin-bottom: 16px; }
    .logout-btn {
      width: 100%; padding: 14px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      background: var(--paper); border: 1px solid var(--coral-soft);
      border-radius: var(--r-lg);
      color: var(--coral); font-size: 14px; font-weight: 600;
      transition: all 0.2s var(--ease-out);
    }
    .logout-btn:hover { background: var(--coral-bg); border-color: var(--coral); }

    .version {
      text-align: center; font-size: 11px; color: var(--ink-muted);
      margin-bottom: 16px;
    }

    .page-header { animation: slideDown 0.5s var(--ease-out); }
    .profile-card { animation: slideUp 0.7s var(--ease-out) 0.05s both; }
    .profile-stats { animation: slideUp 0.7s var(--ease-out) 0.1s both; }
    .settings { animation: slideUp 0.7s var(--ease-out) 0.15s both; }
    .logout-section { animation: slideUp 0.7s var(--ease-out) 0.2s both; }
    .version { animation: slideUp 0.5s var(--ease-out) 0.25s both; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ProfilePage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly subscriptionService = inject(SubscriptionService);

  readonly user = this.auth.state;
  readonly isAdmin = computed(() => this.auth.isAdmin());
  readonly subName = signal<string>('Cargando...');

  constructor() {
    this.subscriptionService.getMySubscription().subscribe({
      next: (sub) => this.subName.set(sub?.planName ?? 'Gratis'),
      error: () => this.subName.set('Gratis'),
    });
  }

  readonly planName = this.subName.asReadonly();

  initials(): string {
    const name = this.user().user?.fullName || 'U';
    return name.split(' ').map((s: string) => s[0]).join('').slice(0, 2).toUpperCase();
  }

  get daysActive() {
    const lastLogin = this.user().user?.lastLoginAt;
    if (!lastLogin) return 0;
    const start = new Date(lastLogin);
    return Math.floor((Date.now() - start.getTime()) / 86400000) || 1;
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login']),
    });
  }
}
