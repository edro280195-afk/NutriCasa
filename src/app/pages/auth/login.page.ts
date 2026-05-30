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
      <div class="hero-glow"></div>
      
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

      <div class="brand stagger-in" style="--delay: 100ms">
        <img src="icons/logonutricasa.jpeg" alt="Logo" class="brand-logo-img">
        <div class="brand-name">NutriCasa</div>
      </div>

      <div class="hero-content stagger-in" style="--delay: 200ms">
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

      <div class="hero-foot stagger-in" style="--delay: 300ms">
        <span class="hero-foot-dot"></span>
        <span>Tu familia te espera</span>
      </div>
    </div>

    <div class="login-form">
      <div class="form-card">
        <div class="form-eyebrow stagger-in" style="--delay: 100ms">Iniciar sesión</div>
        <h2 class="form-title stagger-in" style="--delay: 150ms">Hola otra vez, <span class="italic">¿cómo amaneciste?</span></h2>
        <p class="form-subtitle stagger-in" style="--delay: 200ms">Entra para ver tu plan de hoy y los avances de tu familia.</p>

        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="field stagger-in" style="--delay: 250ms" [class.input-error]="form.get('email')?.invalid && form.get('email')?.touched">
            <div class="field-input-wrap">
              <svg class="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <input id="email" type="email" formControlName="email" placeholder=" " autocomplete="email">
              <label for="email" class="floating-label">Correo electrónico</label>
            </div>
            @if (form.get('email')?.invalid && form.get('email')?.touched) {
              <div class="field-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Correo electrónico requerido o inválido
              </div>
            }
          </div>

          <div class="field stagger-in" style="--delay: 320ms" [class.input-error]="form.get('password')?.invalid && form.get('password')?.touched">
            <div class="field-input-wrap password-wrap">
              <svg class="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input id="password" [type]="showPassword() ? 'text' : 'password'" formControlName="password" placeholder=" " autocomplete="current-password">
              <label for="password" class="floating-label">Contraseña</label>
              <button type="button" class="password-toggle" (click)="togglePassword()" aria-label="Mostrar contraseña">
                @if (showPassword()) {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                } @else {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                }
              </button>
            </div>
            @if (form.get('password')?.invalid && form.get('password')?.touched) {
              <div class="field-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                Contraseña requerida
              </div>
            }
          </div>

          <div class="field-row stagger-in" style="--delay: 390ms">
            <label class="checkbox">
              <input type="checkbox" formControlName="remember">
              Recordarme en este dispositivo
            </label>
            <a routerLink="/auth/forgot-password" class="link">¿Olvidaste tu contraseña?</a>
          </div>

          @if (error()) {
            <div class="field-error stagger-in" style="--delay: 430ms; margin-bottom: 16px; justify-content: center;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ error() }}
            </div>
          }

          <button type="submit" class="btn-primary stagger-in" style="--delay: 460ms" [disabled]="loading()">
            @if (loading()) {
              <span class="spinner"></span>
            }
            Entrar a mi cuenta
            <svg class="arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </form>

        <div class="form-foot stagger-in" style="--delay: 520ms">
          ¿Es la primera vez que entras? <a routerLink="/auth/register">Únete a tu familia</a>
        </div>

        <div class="terms stagger-in" style="--delay: 580ms">
          Al entrar aceptas los <a routerLink="/legal/terms">términos de servicio</a> y el <a routerLink="/legal/privacy">aviso de privacidad</a>.
          NutriCasa no sustituye atención médica profesional.
        </div>
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
        grid-template-rows: auto 1fr;
      }
    }

    .login-hero {
      position: relative;
      background: linear-gradient(160deg, var(--pine) 0%, var(--pine-soft) 100%);
      color: var(--cream);
      padding: 64px 48px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      border-bottom-right-radius: 80px;
      box-shadow: var(--shadow-lg);
      z-index: 1;
    }
    @media (max-width: 880px) {
      .login-hero {
        padding: 40px 24px;
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 40px;
        border-bottom-right-radius: 40px;
      }
    }

    .hero-glow {
      position: absolute;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(91, 192, 150, 0.25) 0%, rgba(15, 61, 46, 0) 70%);
      top: 20%;
      left: -10%;
      pointer-events: none;
      z-index: 1;
      animation: orb-drift 18s infinite alternate ease-in-out;
    }
    @keyframes orb-drift {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(60px, 40px) scale(1.15); }
    }

    .leaf { position: absolute; pointer-events: none; opacity: 0.16; }
    .leaf-1 { top: -40px; right: -20px; width: 280px; transform: rotate(15deg); animation: leaf-float-1 22s infinite ease-in-out; }
    .leaf-2 { bottom: 60px; left: -40px; width: 200px; transform: rotate(-25deg); opacity: 0.12; animation: leaf-float-2 19s infinite ease-in-out; }
    .leaf-3 { top: 40%; right: 15%; width: 80px; opacity: 0.22; transform: rotate(45deg); animation: leaf-float-3 16s infinite ease-in-out; }

    @keyframes leaf-float-1 {
      0%, 100% { transform: rotate(15deg) translate(0, 0); }
      50% { transform: rotate(22deg) translate(15px, -15px); }
    }
    @keyframes leaf-float-2 {
      0%, 100% { transform: rotate(-25deg) translate(0, 0); }
      50% { transform: rotate(-18deg) translate(-10px, 20px); }
    }
    @keyframes leaf-float-3 {
      0%, 100% { transform: rotate(45deg) translate(0, 0); }
      50% { transform: rotate(55deg) translate(10px, -10px); }
    }

    .brand { display: flex; align-items: center; gap: 12px; position: relative; z-index: 2; }
    .brand-name {
      font-family: var(--display);
      font-size: 24px; font-weight: 500;
      letter-spacing: -0.02em;
    }

    .hero-content { position: relative; z-index: 2; max-width: 460px; margin: 40px 0; }
    .hero-eyebrow {
      font-size: 13px; font-weight: 600;
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
      font-size: clamp(36px, 4.5vw, 52px);
      font-weight: 400; line-height: 1.1;
      letter-spacing: -0.025em;
      margin-bottom: 20px;
    }
    .hero-title .accent { font-style: italic; color: var(--mint-light); }
    .hero-subtitle {
      font-size: 16px; line-height: 1.6;
      color: rgba(248, 244, 236, 0.85);
      max-width: 400px;
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
      background: radial-gradient(at 0% 0%, var(--mint-soft) 0px, transparent 50%),
                  radial-gradient(at 100% 100%, var(--cream-warm) 0px, transparent 50%),
                  var(--cream);
      display: flex; align-items: center; justify-content: center;
      padding: 64px 48px;
      position: relative;
      overflow: hidden;
    }
    @media (max-width: 880px) { .login-form { padding: 40px 24px; } }

    .login-form::before {
      content: '';
      position: absolute;
      width: 300px;
      height: 300px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(91, 192, 150, 0.15) 0%, transparent 70%);
      top: -50px;
      right: -50px;
      pointer-events: none;
      animation: shape-drift-1 12s infinite alternate ease-in-out;
    }
    .login-form::after {
      content: '';
      position: absolute;
      width: 250px;
      height: 250px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(232, 134, 107, 0.08) 0%, transparent 70%);
      bottom: -50px;
      left: -50px;
      pointer-events: none;
      animation: shape-drift-2 15s infinite alternate ease-in-out;
    }
    @keyframes shape-drift-1 {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(-30px, 40px) scale(1.1); }
    }
    @keyframes shape-drift-2 {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(40px, -30px) scale(1.15); }
    }

    .form-card {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.6);
      border-radius: var(--r-xl);
      padding: 48px 40px;
      box-shadow: 0 20px 40px rgba(15, 36, 25, 0.05),
                  0 1px 3px rgba(15, 36, 25, 0.02);
      width: 100%;
      max-width: 480px;
      position: relative;
      z-index: 2;
      animation: card-appear 0.8s var(--ease-spring) both;
    }
    @keyframes card-appear {
      from { transform: translateY(24px) scale(0.97); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }
    @media (max-width: 480px) {
      .form-card {
        padding: 32px 20px;
      }
    }

    .form-eyebrow {
      font-size: 12px; font-weight: 700;
      letter-spacing: 0.16em; text-transform: uppercase;
      color: var(--mint); margin-bottom: 12px;
    }
    .form-title {
      font-family: var(--display);
      font-size: 34px; font-weight: 400;
      letter-spacing: -0.02em; line-height: 1.15;
      color: var(--ink); margin-bottom: 8px;
    }
    .form-title .italic { color: var(--pine); }
    .form-subtitle {
      font-size: 15px; color: var(--ink-light);
      margin-bottom: 32px;
    }

    .field {
      margin-bottom: 20px;
      position: relative;
    }
    
    .field-input-wrap {
      position: relative;
      display: flex;
      align-items: center;
      border: 1.5px solid var(--line);
      background: var(--paper);
      border-radius: var(--r-md);
      transition: all 0.25s var(--ease-spring);
    }
    .field-input-wrap:focus-within {
      border-color: var(--pine);
      box-shadow: 0 0 0 4px rgba(15, 61, 46, 0.08);
      transform: scale(1.005);
    }
    
    .field-icon {
      position: absolute;
      left: 18px;
      color: var(--ink-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.25s ease;
      pointer-events: none;
      z-index: 2;
    }
    .field-input-wrap:focus-within .field-icon {
      color: var(--pine);
    }
    
    .field-input-wrap input {
      width: 100%;
      padding: 24px 18px 8px 48px;
      border: none !important;
      background: transparent !important;
      font-size: 15px;
      color: var(--ink);
      font-family: var(--body);
      outline: none !important;
      box-shadow: none !important;
    }
    
    .field-input-wrap label.floating-label {
      position: absolute;
      left: 48px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 15px;
      color: var(--ink-muted);
      pointer-events: none;
      transition: all 0.25s var(--ease-spring);
      transform-origin: left top;
      font-weight: 500;
    }
    
    .field-input-wrap input:focus ~ label.floating-label,
    .field-input-wrap input:not(:placeholder-shown) ~ label.floating-label {
      transform: translateY(-130%) scale(0.78);
      color: var(--pine);
      font-weight: 600;
    }

    .password-wrap input {
      padding-right: 48px;
    }
    .password-toggle {
      position: absolute;
      right: 14px;
      background: transparent;
      border: none;
      color: var(--ink-muted);
      padding: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.2s ease, transform 0.2s var(--ease-spring);
      z-index: 10;
    }
    .password-toggle:hover {
      color: var(--pine);
      transform: scale(1.1);
    }
    .password-toggle:active {
      transform: scale(0.95);
    }

    .field.input-error .field-input-wrap {
      border-color: var(--coral);
    }
    .field.input-error .field-input-wrap:focus-within {
      box-shadow: 0 0 0 4px rgba(232, 134, 107, 0.12);
    }
    .field.input-error label.floating-label {
      color: var(--coral) !important;
    }
    
    .field-error {
      font-size: 12px;
      color: var(--coral);
      margin-top: 6px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 6px;
      animation: error-slide-down 0.25s var(--ease-spring) both;
    }
    @keyframes error-slide-down {
      from {
        opacity: 0;
        transform: translateY(-6px);
        max-height: 0;
      }
      to {
        opacity: 1;
        transform: translateY(0);
        max-height: 24px;
      }
    }

    .field-row {
      display: flex; justify-content: space-between;
      align-items: center; margin-top: -4px; margin-bottom: 28px;
    }
    .checkbox {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; color: var(--ink-light); cursor: pointer;
      user-select: none;
    }
    .checkbox input {
      width: 18px; height: 18px;
      accent-color: var(--pine);
      border-radius: 4px;
      cursor: pointer;
    }
    .link {
      font-size: 13px; color: var(--pine); font-weight: 600;
      text-decoration: underline;
      text-decoration-color: rgba(15, 61, 46, 0.2);
      text-underline-offset: 4px;
      transition: text-decoration-color 0.2s ease;
    }
    .link:hover { text-decoration-color: var(--pine); }

    .btn-primary {
      transition: all 0.25s var(--ease-spring);
    }
    .btn-primary:active:not(:disabled) {
      transform: scale(0.97);
    }

    .form-foot {
      margin-top: 32px; text-align: center;
      font-size: 14px; color: var(--ink-light);
    }
    .form-foot a {
      color: var(--pine); font-weight: 600;
      text-decoration: underline; text-underline-offset: 4px;
    }
    .terms {
      margin-top: 28px; font-size: 12px; color: var(--ink-muted);
      text-align: center; line-height: 1.6;
    }
    .terms a { color: var(--ink-light); text-decoration: underline; text-underline-offset: 3px; }

    /* Entry Animations Stagger */
    .stagger-in {
      opacity: 0;
      animation: fade-slide-in 0.8s var(--ease-spring) both;
    }
    @keyframes fade-slide-in {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

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
  readonly showPassword = signal(false);

  togglePassword() {
    this.showPassword.update(show => !show);
  }

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
