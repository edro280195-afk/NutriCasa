import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
  <div class="login-wrap">
    <div class="login-hero">
      <svg class="leaf leaf-1" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 20 Q140 60 130 130 Q120 175 100 180 Q80 175 70 130 Q60 60 100 20 Z" fill="#5BC096"/>
        <path d="M100 30 L100 175" stroke="#0F3D2E" stroke-width="1.5" opacity="0.4"/>
      </svg>
      <svg class="leaf leaf-2" viewBox="0 0 200 200">
        <path d="M100 20 Q140 60 130 130 Q120 175 100 180 Q80 175 70 130 Q60 60 100 20 Z" fill="#5BC096"/>
      </svg>
      <svg class="leaf leaf-3" viewBox="0 0 200 200">
        <path d="M100 20 Q140 60 130 130 Q120 175 100 180 Q80 175 70 130 Q60 60 100 20 Z" fill="#B5E2CB"/>
      </svg>

      <div class="brand">
        <img src="icons/logonutricasa.jpeg" alt="Logo" class="brand-logo-img">
        <div class="brand-name">NutriCasa</div>
      </div>

      <div class="hero-content">
        <div class="hero-eyebrow">Coach Familiar Cetogénico</div>
        <h1 class="hero-title">
          Bienvenidos de regreso a su <span class="accent italic">reto compartido.</span>
        </h1>
        <p class="hero-subtitle">
          La plataforma donde tu familia se acompaña en su transformación. Planes
          personalizados que se adaptan a cada cuerpo, mientras cocinan los mismos
          ingredientes en casa.
        </p>
      </div>

      <div class="hero-foot">
        <span class="hero-foot-dot"></span>
        <span>Tu familia te espera</span>
      </div>
    </div>

    <div class="login-form">
      <div class="form-eyebrow">Iniciar sesión</div>
      <h2 class="form-title">Hola otra vez, <span class="italic">¿cómo amaneciste?</span></h2>
      <p class="form-subtitle">Entra para ver tu plan de hoy y los avances de tu familia.</p>

      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="field" [class.input-error]="form.get('email')?.invalid && form.get('email')?.touched">
          <label for="email">Correo electrónico</label>
          <div class="field-input-wrap">
            <input id="email" type="email" formControlName="email" placeholder="tu@correo.com" autocomplete="email">
          </div>
          @if (form.get('email')?.invalid && form.get('email')?.touched) {
            <div class="field-error">Correo electrónico requerido</div>
          }
        </div>

        <div class="field" [class.input-error]="form.get('password')?.invalid && form.get('password')?.touched">
          <label for="password">Contraseña</label>
          <div class="field-input-wrap">
            <input id="password" type="password" formControlName="password" placeholder="•••••••••" autocomplete="current-password">
          </div>
          @if (form.get('password')?.invalid && form.get('password')?.touched) {
            <div class="field-error">Contraseña requerida</div>
          }
        </div>

        <div class="field-row">
          <label class="checkbox">
            <input type="checkbox" formControlName="remember">
            Recordarme en este dispositivo
          </label>
          <a routerLink="/auth/forgot-password" class="link">¿Olvidaste tu contraseña?</a>
        </div>

        @if (error()) {
          <div class="field-error" style="margin-bottom: 16px; text-align: center;">{{ error() }}</div>
        }

        <button type="submit" class="btn-primary" [disabled]="loading()">
          @if (loading()) {
            <span class="spinner"></span>
          }
          Entrar a mi cuenta
          <svg class="arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </form>

      <div class="form-foot">
        ¿Es la primera vez que entras? <a routerLink="/auth/register">Únete a tu familia</a>
      </div>

      <div class="terms">
        Al entrar aceptas los <a routerLink="/legal/terms">términos de servicio</a> y el <a routerLink="/legal/privacy">aviso de privacidad</a>.
        NutriCasa no sustituye atención médica profesional.
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
        grid-template-rows: 280px 1fr;
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
      .login-hero {
        padding: 24px;
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 60px;
        border-bottom-right-radius: 60px;
      }
    }

    .leaf { position: absolute; pointer-events: none; opacity: 0.18; }
    .leaf-1 { top: -40px; right: -20px; width: 280px; transform: rotate(15deg); }
    .leaf-2 { bottom: 60px; left: -40px; width: 200px; transform: rotate(-25deg); opacity: 0.12; }
    .leaf-3 { top: 40%; right: 15%; width: 80px; opacity: 0.22; transform: rotate(45deg); }

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
    .brand-name {
      font-family: var(--display);
      font-size: 22px; font-weight: 500;
      letter-spacing: -0.02em;
    }

    .hero-content { position: relative; z-index: 2; max-width: 460px; }
    .hero-eyebrow {
      font-size: 13px; font-weight: 500;
      letter-spacing: 0.18em; text-transform: uppercase;
      color: var(--mint-light);
      margin-bottom: 20px;
      display: inline-flex; align-items: center; gap: 8px;
    }
    .hero-eyebrow::before {
      content: ''; width: 28px; height: 1px; background: var(--mint);
    }
    .hero-title {
      font-family: var(--display);
      font-size: clamp(36px, 5vw, 56px);
      font-weight: 400; line-height: 1.05;
      letter-spacing: -0.025em;
      margin-bottom: 20px;
    }
    .hero-title .accent { font-style: italic; color: var(--mint-light); }
    .hero-subtitle {
      font-size: 16px; line-height: 1.55;
      color: rgba(248, 244, 236, 0.82);
      max-width: 380px;
    }
    .hero-foot {
      position: relative; z-index: 2;
      display: flex; align-items: center; gap: 16px;
      font-size: 13px; color: rgba(248, 244, 236, 0.65);
    }
    @media (max-width: 880px) { .hero-foot { display: none; } }
    .hero-foot-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: var(--mint);
      box-shadow: 0 0 0 4px rgba(91, 192, 150, 0.25);
      animation: pulse 2.4s var(--ease-out) infinite;
    }

    .login-form {
      display: flex; flex-direction: column;
      justify-content: center;
      padding: 48px 40px;
      max-width: 520px; width: 100%; margin: 0 auto;
    }
    @media (max-width: 880px) { .login-form { padding: 32px 20px; } }

    .form-eyebrow {
      font-size: 12px; font-weight: 600;
      letter-spacing: 0.16em; text-transform: uppercase;
      color: var(--mint); margin-bottom: 12px;
    }
    .form-title {
      font-family: var(--display);
      font-size: 38px; font-weight: 400;
      letter-spacing: -0.02em; line-height: 1.1;
      color: var(--ink); margin-bottom: 8px;
    }
    .form-title .italic { color: var(--pine); }
    .form-subtitle {
      font-size: 15px; color: var(--ink-light);
      margin-bottom: 40px;
    }
    .field-row {
      display: flex; justify-content: space-between;
      align-items: center; margin-top: -8px; margin-bottom: 24px;
    }
    .checkbox {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; color: var(--ink-light); cursor: pointer;
    }
    .checkbox input { width: 18px; height: 18px; accent-color: var(--pine); }
    .link {
      font-size: 13px; color: var(--pine); font-weight: 600;
      text-decoration: underline;
      text-decoration-color: rgba(15, 61, 46, 0.2);
      text-underline-offset: 4px;
    }
    .link:hover { text-decoration-color: var(--pine); }

    .form-foot {
      margin-top: 32px; text-align: center;
      font-size: 14px; color: var(--ink-light);
    }
    .form-foot a {
      color: var(--pine); font-weight: 600;
      text-decoration: underline; text-underline-offset: 4px;
    }
    .terms {
      margin-top: 24px; font-size: 12px; color: var(--ink-muted);
      text-align: center; line-height: 1.5;
    }
    .terms a { color: var(--ink-light); text-decoration: underline; text-underline-offset: 3px; }

    .spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 4px rgba(91, 192, 150, 0.25); }
      50%     { box-shadow: 0 0 0 8px rgba(91, 192, 150, 0.05); }
    }
  `]
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    remember: [false],
  });
  readonly loading = signal(false);
  readonly error = signal('');

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');

    this.auth.login({
      email: this.form.value.email!,
      password: this.form.value.password!,
    }).subscribe({
      next: (user) => {
        this.router.navigate([user.onboardingComplete ? '/dashboard' : '/onboarding']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Error al iniciar sesión');
        this.loading.set(false);
      },
    });
  }
}
