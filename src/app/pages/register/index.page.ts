import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
  <div class="login-wrap">
    <div class="login-hero">
      <div class="brand">
        <div class="brand-mark"></div>
        <div class="brand-name">NutriCasa</div>
      </div>
      <div class="hero-content">
        <div class="hero-eyebrow">Comienza tu viaje</div>
        <h1 class="hero-title">
          Tu familia, <span class="accent italic">un solo reto.</span>
        </h1>
        <p class="hero-subtitle">
          Regístrate y únete a tu grupo familiar para empezar su transformación juntos.
        </p>
      </div>
    </div>

    <div class="login-form">
      <div class="form-eyebrow">Crear cuenta</div>
      <h2 class="form-title">Comencemos, <span class="italic">¿cómo te llamas?</span></h2>
      <p class="form-subtitle">Tus datos están seguros y nunca los compartiremos.</p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="field" [class.input-error]="form.get('fullName')?.invalid && form.get('fullName')?.touched">
          <label for="fullName">Nombre completo</label>
          <div class="field-input-wrap">
            <input id="fullName" type="text" formControlName="fullName" placeholder="Ej. Eduardo Rodríguez" autocomplete="name">
          </div>
        </div>

        <div class="field" [class.input-error]="form.get('email')?.invalid && form.get('email')?.touched">
          <label for="email">Correo electrónico</label>
          <div class="field-input-wrap">
            <input id="email" type="email" formControlName="email" placeholder="tu@correo.com" autocomplete="email">
          </div>
        </div>

        <div class="field" [class.input-error]="form.get('password')?.invalid && form.get('password')?.touched">
          <label for="password">Contraseña</label>
          <div class="field-input-wrap">
            <input id="password" type="password" formControlName="password" placeholder="Mínimo 8 caracteres" autocomplete="new-password">
          </div>
          @if (form.get('password')?.hasError('minlength')) {
            <div class="field-error">Mínimo 8 caracteres</div>
          }
        </div>

        <div class="field" [class.input-error]="form.get('confirmPassword')?.invalid && form.get('confirmPassword')?.touched">
          <label for="confirmPassword">Confirmar contraseña</label>
          <div class="field-input-wrap">
            <input id="confirmPassword" type="password" formControlName="confirmPassword" placeholder="Repite la contraseña" autocomplete="new-password">
          </div>
          @if (form.hasError('mismatch') && form.get('confirmPassword')?.touched) {
            <div class="field-error">Las contraseñas no coinciden</div>
          }
        </div>

        <div class="field">
          <label for="groupCode">¿Tienes código de grupo? <span class="field-hint">(opcional)</span></label>
          <div class="field-input-wrap">
            <input id="groupCode" type="text" formControlName="groupCode" placeholder="Ej. FAMILIA01" style="text-transform: uppercase; letter-spacing: 0.06em;">
          </div>
        </div>

        @if (error()) {
          <div class="field-error" style="margin-bottom: 16px; text-align: center;">{{ error() }}</div>
        }

        <button type="submit" class="btn-primary" [disabled]="loading()">
          @if (loading()) { <span class="spinner"></span> }
          Crear mi cuenta
          <svg class="arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </form>

      <div class="form-foot">
        ¿Ya tienes cuenta? <a routerLink="/auth/login">Inicia sesión</a>
      </div>

      <div class="terms">
        Al registrarte aceptas los <a href="#">términos de servicio</a> y el <a href="#">aviso de privacidad</a>.
      </div>
    </div>
  </div>
  `,
  styles: [`
    :host { display: contents; }
    .login-wrap {
      display: grid;
      grid-template-columns: 1.1fr 1fr;
      min-height: 100vh;
      background: var(--cream);
    }
    @media (max-width: 880px) {
      .login-wrap {
        grid-template-columns: 1fr;
        grid-template-rows: 240px 1fr;
      }
    }
    .login-hero {
      position: relative;
      background: linear-gradient(160deg, var(--pine) 0%, var(--pine-soft) 100%);
      color: var(--cream);
      padding: 48px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      border-bottom-right-radius: 80px;
    }
    @media (max-width: 880px) {
      .login-hero { padding: 24px; border-bottom-right-radius: 0; border-bottom-left-radius: 60px; border-bottom-right-radius: 60px; }
    }
    .brand { display: flex; align-items: center; gap: 10px; position: relative; z-index: 2; }
    .brand-mark {
      width: 36px; height: 36px;
      background: var(--mint); border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
    }
    .brand-mark::after {
      content: '';
      position: absolute;
      inset: 7px;
      background: var(--pine);
      clip-path: path('M14 0 Q18 8 14 22 Q10 8 14 0 Z');
    }
    .brand-name { font-family: var(--display); font-size: 22px; font-weight: 500; letter-spacing: -0.02em; }
    .hero-content { position: relative; z-index: 2; max-width: 460px; }
    .hero-eyebrow {
      font-size: 13px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase;
      color: var(--mint-light); margin-bottom: 20px;
      display: inline-flex; align-items: center; gap: 8px;
    }
    .hero-eyebrow::before { content: ''; width: 28px; height: 1px; background: var(--mint); }
    .hero-title {
      font-family: var(--display);
      font-size: clamp(32px, 4vw, 48px);
      font-weight: 400; line-height: 1.05;
      letter-spacing: -0.025em; margin-bottom: 20px;
    }
    .hero-title .accent { font-style: italic; color: var(--mint-light); }
    .hero-subtitle { font-size: 16px; line-height: 1.55; color: rgba(248, 244, 236, 0.82); max-width: 380px; }
    .login-form {
      display: flex; flex-direction: column; justify-content: center;
      padding: 48px 40px; max-width: 520px; width: 100%; margin: 0 auto;
    }
    @media (max-width: 880px) { .login-form { padding: 32px 20px; } }
    .form-eyebrow {
      font-size: 12px; font-weight: 600; letter-spacing: 0.16em;
      text-transform: uppercase; color: var(--mint); margin-bottom: 12px;
    }
    .form-title {
      font-family: var(--display); font-size: 34px; font-weight: 400;
      letter-spacing: -0.02em; line-height: 1.1; color: var(--ink); margin-bottom: 8px;
    }
    .form-title .italic { color: var(--pine); }
    .form-subtitle { font-size: 15px; color: var(--ink-light); margin-bottom: 32px; }
    .form-foot { margin-top: 24px; text-align: center; font-size: 14px; color: var(--ink-light); }
    .form-foot a { color: var(--pine); font-weight: 600; text-decoration: underline; text-underline-offset: 4px; }
    .terms { margin-top: 24px; font-size: 12px; color: var(--ink-muted); text-align: center; line-height: 1.5; }
    .terms a { color: var(--ink-light); text-decoration: underline; text-underline-offset: 3px; }
    .spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    fullName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    groupCode: [''],
  }, { validators: (group) => {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }});
  readonly loading = signal(false);
  readonly error = signal('');

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    this.auth.register({
      fullName: this.form.value.fullName!,
      email: this.form.value.email!,
      password: this.form.value.password!,
      groupCode: this.form.value.groupCode || undefined,
    }).subscribe({
      next: () => this.router.navigate(['/onboarding']),
      error: (err) => {
        this.error.set(err.error?.message || 'Error al crear cuenta');
        this.loading.set(false);
      },
    });
  }
}
