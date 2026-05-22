import { Component, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [RouterLink],
  template: `
  <div class="wrap">
    <div class="card">
      <div class="brand">
        <div class="brand-mark"></div>
        <div class="brand-name">NutriCasa</div>
      </div>

      @if (loading()) {
        <div class="state">
          <span class="big-spinner"></span>
          <h2 class="state-title">Verificando tu <span class="italic">correo...</span></h2>
        </div>
      } @else if (verified()) {
        <div class="state">
          <svg class="check-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--mint)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <h2 class="state-title">Correo <span class="italic">verificado</span></h2>
          <p class="state-desc">Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesión.</p>
          <a routerLink="/auth/login" class="btn-primary">Iniciar sesión</a>
        </div>
      } @else {
        <div class="state error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--coral)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <h2 class="state-title">Enlace <span class="italic">inválido</span></h2>
          <p class="state-desc">{{ error() || 'El enlace de verificación no es válido o ya expiró.' }}</p>
          <a routerLink="/auth/login" class="btn-primary">Ir al inicio de sesión</a>
        </div>
      }
    </div>
  </div>
  `,
  styles: [`
    :host { display: contents; }
    .wrap {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      padding: 24px;
      background: var(--cream);
    }
    .card {
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: var(--r-xl);
      padding: 48px 32px;
      max-width: 420px;
      width: 100%;
      box-shadow: var(--shadow-lg);
      text-align: center;
    }
    .brand { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 32px; }
    .brand-mark {
      width: 36px; height: 36px;
      background: var(--mint); border-radius: 12px;
      position: relative;
    }
    .brand-mark::after {
      content: '';
      position: absolute; inset: 7px;
      background: var(--pine);
      clip-path: path('M14 0 Q18 8 14 22 Q10 8 14 0 Z');
    }
    .brand-name {
      font-family: var(--display);
      font-size: 22px; font-weight: 500;
      letter-spacing: -0.02em;
    }
    .state { display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .state-title {
      font-family: var(--display); font-size: 28px; font-weight: 400;
      color: var(--ink); margin: 0;
    }
    .state-title .italic { color: var(--pine); }
    .state-desc { font-size: 15px; color: var(--ink-light); margin: 0; }
    .big-spinner {
      width: 36px; height: 36px;
      border: 3px solid var(--mint-soft);
      border-top-color: var(--mint); border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class VerifyEmailPage {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(true);
  readonly verified = signal(false);
  readonly error = signal('');

  constructor() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'] || '';
      if (!token) {
        this.loading.set(false);
        this.error.set('Faltan parámetros de verificación.');
        return;
      }
      this.auth.verifyEmail({ token }).subscribe({
        next: () => {
          this.verified.set(true);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set('El enlace de verificación no es válido o ya expiró.');
        },
      });
    });
  }
}
