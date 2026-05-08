import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
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

      <div class="form-eyebrow">Recuperar acceso</div>
      <h2 class="form-title">¿Olvidaste tu <span class="italic">contraseña?</span></h2>
      <p class="form-subtitle">Te enviaremos un enlace para restablecerla a tu correo.</p>

      @if (sent()) {
        <div class="success-box">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--mint)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <div>
            <strong>Revisa tu bandeja de entrada</strong>
            <p>Si existe una cuenta con ese correo, recibirás las instrucciones en unos minutos.</p>
          </div>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="field" [class.input-error]="form.get('email')?.invalid && form.get('email')?.touched">
            <label for="email">Correo electrónico</label>
            <div class="field-input-wrap">
              <input id="email" type="email" formControlName="email" placeholder="tu@correo.com" autocomplete="email">
            </div>
          </div>

          @if (error()) {
            <div class="field-error" style="margin-bottom: 16px;">{{ error() }}</div>
          }

          <button type="submit" class="btn-primary" [disabled]="loading()">
            @if (loading()) { <span class="spinner"></span> }
            Enviar enlace
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
      display: flex; gap: 14px; align-items: flex-start;
      background: var(--mint-soft); padding: 16px; border-radius: var(--r-md);
      font-size: 14px; line-height: 1.5; color: var(--pine);
    }
    .success-box strong { display: block; margin-bottom: 4px; }
    .success-box p { font-size: 13px; color: var(--ink-soft); margin: 0; }
    .spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class ForgotPasswordPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });
  readonly loading = signal(false);
  readonly sent = signal(false);
  readonly error = signal('');

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    this.auth.forgotPassword({ email: this.form.value.email! }).subscribe({
      next: () => {
        this.sent.set(true);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Error al enviar el enlace. Intenta de nuevo.');
        this.loading.set(false);
      },
    });
  }
}
