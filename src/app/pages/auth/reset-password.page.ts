import { Component, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
  <div class="wrap">
    <div class="card">
      <a routerLink="/auth/login" class="back-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        Volver
      </a>

      <div class="form-eyebrow">Restablecer contraseña</div>
      <h2 class="form-title">Elige tu nueva <span class="italic">contraseña</span></h2>
      <p class="form-subtitle">Debe tener al menos 8 caracteres.</p>

      @if (invalidLink()) {
        <div class="error-box">
          <strong>Enlace inválido o expirado</strong>
          <p>El enlace de restablecimiento no es válido o ya expiró. Solicita uno nuevo.</p>
          <a routerLink="/auth/forgot-password" class="btn-primary" style="margin-top:16px;display:inline-flex;">Solicitar nuevo enlace</a>
        </div>
      } @else if (done()) {
        <div class="success-box">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--mint)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <div>
            <strong>Contraseña actualizada</strong>
            <p>Tu contraseña se ha restablecido correctamente.</p>
          </div>
          <a routerLink="/auth/login" class="btn-primary" style="margin-top:16px;display:inline-flex;">Iniciar sesión</a>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="field" [class.input-error]="form.get('newPassword')?.invalid && form.get('newPassword')?.touched">
            <label for="newPassword">Nueva contraseña</label>
            <div class="field-input-wrap">
              <input id="newPassword" type="password" formControlName="newPassword" placeholder="••••••••" autocomplete="new-password">
            </div>
            @if (form.get('newPassword')?.invalid && form.get('newPassword')?.touched) {
              <div class="field-error">Mínimo 8 caracteres</div>
            }
          </div>

          <div class="field" [class.input-error]="form.get('confirmPassword')?.invalid && form.get('confirmPassword')?.touched">
            <label for="confirmPassword">Confirmar contraseña</label>
            <div class="field-input-wrap">
              <input id="confirmPassword" type="password" formControlName="confirmPassword" placeholder="••••••••" autocomplete="new-password">
            </div>
            @if (form.errors?.['mismatch'] && form.get('confirmPassword')?.touched) {
              <div class="field-error">Las contraseñas no coinciden</div>
            }
          </div>

          @if (error()) {
            <div class="field-error" style="margin-bottom:16px;">{{ error() }}</div>
          }

          <button type="submit" class="btn-primary" [disabled]="loading()">
            @if (loading()) { <span class="spinner"></span> }
            Restablecer contraseña
          </button>
        </form>
      }

      <div class="form-foot">
        <a routerLink="/auth/login">Regresar al inicio de sesión</a>
      </div>
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
      padding: 40px 32px;
      max-width: 440px;
      width: 100%;
      box-shadow: var(--shadow-lg);
    }
    .back-link {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 13px; font-weight: 600; color: var(--ink-light);
      margin-bottom: 24px;
    }
    .back-link:hover { color: var(--pine); }
    .form-eyebrow {
      font-size: 12px; font-weight: 600; letter-spacing: 0.16em;
      text-transform: uppercase; color: var(--mint); margin-bottom: 8px;
    }
    .form-title {
      font-family: var(--display); font-size: 32px; font-weight: 400;
      letter-spacing: -0.02em; line-height: 1.1;
      color: var(--ink); margin-bottom: 8px;
    }
    .form-title .italic { color: var(--pine); }
    .form-subtitle { font-size: 15px; color: var(--ink-light); margin-bottom: 28px; }
    .form-foot { margin-top: 24px; text-align: center; }
    .form-foot a { font-size: 13px; color: var(--pine); font-weight: 600; }
    .success-box {
      display: flex; flex-direction:column; gap: 14px;
      background: var(--mint-soft); padding: 16px; border-radius: var(--r-md);
      font-size: 14px; line-height: 1.5; color: var(--pine);
    }
    .success-box strong { display: block; margin-bottom: 4px; }
    .success-box p { font-size: 13px; color: var(--ink-soft); margin: 0; }
    .error-box {
      display: flex; flex-direction:column; gap: 8px;
      background: var(--coral-bg); padding: 16px; border-radius: var(--r-md);
      font-size: 14px; line-height: 1.5; color: var(--coral);
    }
    .error-box p { font-size: 13px; color: var(--ink-soft); margin: 0; }
    .spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class ResetPasswordPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: (g) => g.value.newPassword === g.value.confirmPassword ? null : { mismatch: true } });
  readonly loading = signal(false);
  readonly done = signal(false);
  readonly invalidLink = signal(false);
  readonly error = signal('');

  private email = '';
  private token = '';

  constructor() {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.token = params['token'] || '';
      if (!this.email || !this.token) {
        this.invalidLink.set(true);
      }
    });
  }

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    this.auth.resetPassword({
      email: this.email,
      token: this.token,
      newPassword: this.form.value.newPassword!,
    }).subscribe({
      next: () => {
        this.done.set(true);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('El enlace no es válido o ya expiró.');
        this.loading.set(false);
      },
    });
  }
}
