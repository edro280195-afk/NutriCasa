import { Component, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { OnboardingService } from '../../services/onboarding.service';
import { LottieAnimationComponent } from '../../components/lottie-animation/lottie-animation.component';
import type {
  GroupRequest, BasicDataRequest, MetricsRequest, BodyTypeRequest,
  ActivityRequest, BudgetModeRequest, MedicalProfileRequest,
  MedicalOverrideRequest, DisclaimerGoalRequest, BodyType,
  ActivityLevel, BudgetMode, KetoProfile
} from '../../models/onboarding.models';

const STEPS = [
  'Grupo', 'Datos básicos', 'Medidas', 'Tipo de cuerpo',
  'Actividad', 'Presupuesto', 'Perfil médico', 'Meta', 'Generando'
] as const;

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [ReactiveFormsModule, LottieAnimationComponent],
  template: `
  <div class="shell">
    <div class="wiz-header">
      <div class="wiz-top">
        <button class="wiz-back" [class.invisible]="step() === 0 || step() === STEPS.length - 1" (click)="prevStep()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Atrás
        </button>
        <div class="wiz-step-counter">Paso <strong>{{ step() + 1 }}</strong> de {{ STEPS.length - 1 }}</div>
        <button class="wiz-skip" [class.invisible]="step() === STEPS.length - 1" (click)="skipStep()">Omitir</button>
      </div>
      <div class="wiz-progress">
        <div class="wiz-progress-fill" [style.width.%]="((step() + 1) / STEPS.length) * 100"></div>
      </div>
    </div>

    <div class="wiz-stage">
      <!-- STEP 0: Group -->
      <div class="wiz-step" [class.active]="step() === 0">
        <div class="welcome-hero">
          <app-lottie src="/lottie/welcome.json" width="180px" height="180px"></app-lottie>
          <h1 class="welcome-title">Bienvenido a <span class="italic">NutriCasa</span></h1>
          <p class="welcome-sub">¿Vas a crear un grupo familiar o te unes a uno existente?</p>
        </div>
        <div class="choice-cards">
          <button class="choice" [class.selected]="groupAction() === 'create'" (click)="groupAction.set('create')">
            <div class="choice-icon create">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
                <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
              </svg>
            </div>
            <div class="choice-text">
              <div class="choice-title">Crear grupo</div>
              <div class="choice-desc">Serás el administrador y podrás invitar a tu familia</div>
            </div>
            <div class="choice-check">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </button>
          <button class="choice" [class.selected]="groupAction() === 'join'" (click)="groupAction.set('join')">
            <div class="choice-icon join">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/>
                <polyline points="17 11 19 13 23 9"/>
              </svg>
            </div>
            <div class="choice-text">
              <div class="choice-title">Unirme a un grupo</div>
              <div class="choice-desc">Ingresa el código que te compartió tu familia</div>
            </div>
            <div class="choice-check">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
          </button>
          @if (groupAction() === 'join') {
            <div class="invite-input-wrap">
              <input type="text" placeholder="CÓDIGO" maxlength="10" [value]="inviteCode()" (input)="inviteCode.set($any($event.target).value)">
              <span class="invite-pill">Invitar</span>
            </div>
          }
        </div>
      </div>

      <!-- STEP 1: Basic Data -->
      <div class="wiz-step" [class.active]="step() === 1">
        <div class="step-eyebrow">Paso 2 · Datos básicos</div>
        <h2 class="step-title">Cuéntanos de <span class="italic">ti</span></h2>
        <p class="step-subtitle">Estos datos nos ayudan a personalizar tu experiencia.</p>
        <form [formGroup]="basicForm">
          <div class="field">
            <label class="field-label" for="dob">Fecha de nacimiento</label>
            <div class="field-input-wrap">
              <input id="dob" type="date" formControlName="dateOfBirth">
            </div>
          </div>
          <div class="field">
            <label class="field-label">Género</label>
            <div class="gender-grid">
              @for (opt of genderOptions; track opt.value) {
                <button type="button" class="gender-btn" [class.selected]="basicForm.get('gender')?.value === opt.value" (click)="basicForm.patchValue({gender: opt.value})">
                  {{ opt.label }}
                </button>
              }
            </div>
          </div>
        </form>
      </div>

      <!-- STEP 2: Metrics -->
      <div class="wiz-step" [class.active]="step() === 2">
        <div class="step-eyebrow">Paso 3 · Medidas</div>
        <h2 class="step-title">Tus <span class="italic">medidas</span></h2>
        <p class="step-subtitle">Así calculamos tus macros personalizados.</p>
        <form [formGroup]="metricsForm">
          <div class="field-row-2">
            <div class="field">
              <label class="field-label" for="weight">Peso <span class="field-hint">(kg)</span></label>
              <div class="field-input-wrap">
                <input id="weight" type="number" formControlName="weightKg" placeholder="68" step="0.1">
              </div>
            </div>
            <div class="field">
              <label class="field-label" for="height">Altura <span class="field-hint">(cm)</span></label>
              <div class="field-input-wrap">
                <input id="height" type="number" formControlName="heightCm" placeholder="170" step="1">
              </div>
            </div>
          </div>
          <div class="field">
            <label class="field-label" for="goalWeight">Peso meta <span class="field-hint">(kg, opcional)</span></label>
            <div class="field-input-wrap">
              <input id="goalWeight" type="number" formControlName="goalWeightKg" placeholder="65" step="0.1">
            </div>
          </div>
        </form>
      </div>

      <!-- STEP 3: Body Type -->
      <div class="wiz-step" [class.active]="step() === 3">
        <div class="step-eyebrow">Paso 4 · Tipo de cuerpo</div>
        <h2 class="step-title">¿Cómo es tu <span class="italic">complexión?</span></h2>
        <p class="step-subtitle">Selecciona la silueta que más se parezca a ti.</p>
        <div class="choice-cards">
          @for (bt of currentBodyTypes(); track bt.value) {
            <button class="choice" [class.selected]="bodyTypeForm.get('bodyType')?.value === bt.value" (click)="bodyTypeForm.patchValue({bodyType: bt.value})">
              <div class="choice-icon" [style.background]="bt.color">
                <span style="font-size: 24px;">{{ bt.icon }}</span>
              </div>
              <div class="choice-text">
                <div class="choice-title">{{ bt.label }}</div>
                <div class="choice-desc">{{ bt.desc }}</div>
              </div>
              <div class="choice-check">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </button>
          }
        </div>
      </div>

      <!-- STEP 4: Activity -->
      <div class="wiz-step" [class.active]="step() === 4">
        <div class="step-eyebrow">Paso 5 · Actividad física</div>
        <h2 class="step-title">¿Qué tan activo <span class="italic">eres?</span></h2>
        <p class="step-subtitle">Determina tu gasto calórico base.</p>
        <div class="choice-cards">
          @for (al of activityLevels; track al.value) {
            <button class="choice" [class.selected]="activityForm.get('activityLevel')?.value === al.value" (click)="activityForm.patchValue({activityLevel: al.value})">
              <div class="choice-icon" [style.background]="al.color">
                <span [innerHTML]="al.icon" style="font-size: 20px;"></span>
              </div>
              <div class="choice-text">
                <div class="choice-title">{{ al.label }}</div>
                <div class="choice-desc">{{ al.desc }}</div>
              </div>
              <div class="choice-check">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </button>
          }
        </div>
      </div>

      <!-- STEP 5: Budget Mode -->
      <div class="wiz-step" [class.active]="step() === 5">
        <div class="step-eyebrow">Paso 6 · Modo de alimentación</div>
        <h2 class="step-title">Tu <span class="italic">estilo</span> de cocina</h2>
        <p class="step-subtitle">Elige el modo que mejor se ajuste a tu rutina y presupuesto.</p>
        <div class="mode-info">
          <span class="mode-info-icon">i</span>
          <span>Puedes cambiar esto después. Cada modo ajusta ingredientes, tiempo de preparación y costo.</span>
        </div>
        <div class="modes-grid">
          @for (m of budgetModes; track m.value) {
            <button class="mode-card" [class.selected]="budgetForm.get('budgetMode')?.value === m.value" (click)="budgetForm.patchValue({budgetMode: m.value})">
              <div class="mode-head">
                <div class="mode-id">
                  <div class="mode-icon" [class]="m.cssClass">
                    <span [innerHTML]="m.icon" style="font-size: 20px;"></span>
                  </div>
                  <div>
                    <div class="mode-title">{{ m.label }}</div>
                    <div class="mode-pill-cost">{{ m.cost }}</div>
                  </div>
                </div>
                <div class="mode-check">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="4" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </div>
              <div class="mode-desc">{{ m.desc }}</div>
              @if (budgetForm.get('budgetMode')?.value === m.value) {
                <div class="mode-details">
                  <div class="mode-detail-grid">
                    <div class="mode-detail">
                      <svg class="mode-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                      {{ m.time }}
                    </div>
                    <div class="mode-detail">
                      <svg class="mode-detail-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                      {{ m.complexity }}
                    </div>
                  </div>
                  <div class="mode-tags">
                    @for (tag of m.tags; track tag) {
                      <span class="mode-tag">{{ tag }}</span>
                    }
                  </div>
                </div>
              }
            </button>
          }
        </div>
      </div>

      <!-- STEP 6: Medical Profile -->
      <div class="wiz-step" [class.active]="step() === 6">
        <div class="step-eyebrow">Paso 7 · Perfil médico</div>
        <h2 class="step-title">Tu salud es <span class="italic">primero</span></h2>
        <p class="step-subtitle">Selecciona cualquier condición o alergia para que ajustemos tu plan.</p>
        <form [formGroup]="medicalForm">
          <div class="field">
            <label class="field-label">Condiciones de salud</label>
            <div class="chip-grid">
              @for (c of healthConditions; track c.value) {
                <button type="button" class="chip" [class.selected]="isConditionSelected(c.value)" (click)="toggleCondition(c.value)">
                  <span [innerHTML]="c.icon"></span> {{ c.label }}
                </button>
              }
            </div>
          </div>
          <div class="field">
            <label class="field-label">Alergias alimentarias</label>
            <div class="chip-grid">
              @for (a of allergies; track a) {
                <button type="button" class="chip" [class.selected]="isAllergySelected(a)" (click)="toggleAllergy(a)">{{ a }}</button>
              }
            </div>
          </div>
          <div class="field">
            <label class="field-label" for="medications">Medicamentos <span class="field-hint">(opcional)</span></label>
            <div class="field-input-wrap">
              <input id="medications" type="text" formControlName="medications" placeholder="Ej. Metformina, Losartán">
            </div>
          </div>
        </form>
      </div>

      <!-- STEP 7: Disclaimer + Goal -->
      <div class="wiz-step" [class.active]="step() === 7">
        <div class="step-eyebrow">Paso 8 · Meta y responsabilidad</div>
        <h2 class="step-title">Tu <span class="italic">compromiso</span></h2>
        <p class="step-subtitle">Establece tu meta y acepta los términos para comenzar.</p>

        <div class="disclaimer-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <div>
            <strong>Aviso importante</strong>
            <p>NutriCasa no sustituye la atención médica profesional. Consulta a tu médico antes de iniciar cualquier plan alimenticio, especialmente si tienes condiciones preexistentes.</p>
          </div>
        </div>

        <div class="field">
          <label class="field-label">¿Cuál es tu objetivo principal?</label>
          <div class="goal-grid">
            @for (g of goals; track g.value) {
              <button type="button" class="goal-btn" [class.selected]="goalForm.get('goalType')?.value === g.value" (click)="goalForm.patchValue({goalType: g.value})">
                <span [innerHTML]="g.icon" style="font-size: 22px;"></span>
                <span>{{ g.label }}</span>
              </button>
            }
          </div>
        </div>

        <div class="field">
          <label class="field-label" for="goalDesc">Describe tu meta <span class="field-hint">(opcional)</span></label>
          <div class="field-input-wrap">
            <textarea id="goalDesc" formControlName="goalDescription" rows="3" placeholder="Ej. Quiero perder 8 kg en 3 meses para sentirme con más energía..." style="width:100%;padding:16px 18px;border:1.5px solid var(--line);background:var(--paper);border-radius:var(--r-md);font-size:15px;color:var(--ink);font-family:var(--body);resize:none;"></textarea>
          </div>
        </div>

        <div class="field" style="display:flex;align-items:flex-start;gap:12px;margin-top:20px;">
          <input type="checkbox" id="acceptTerms" formControlName="acceptTerms" style="width:20px;height:20px;margin-top:2px;accent-color:var(--pine);">
          <label for="acceptTerms" style="font-size:13px;color:var(--ink-light);cursor:pointer;">
            Acepto los <strong style="color:var(--pine);">términos de servicio</strong> y el <strong style="color:var(--pine);">aviso de privacidad</strong>. Entiendo que este plan es informativo y no sustituye atención médica.
          </label>
        </div>
      </div>

      <!-- STEP 8: Generating -->
      <div class="wiz-step" [class.active]="step() === 8">
        <div class="gen-hero">
          @if (planDone()) {
            <app-lottie src="/lottie/success.json" width="180px" height="180px" [loop]="false"></app-lottie>
            <h2 class="gen-title">¡Todo <span class="italic">listo!</span></h2>
            <p class="gen-sub">Tu plan personalizado está generado. Te vamos a llevar al dashboard.</p>
          } @else {
            <app-lottie src="/lottie/cooking.json" width="180px" height="180px"></app-lottie>
            <h2 class="gen-title">Generando tu <span class="italic">plan</span></h2>
            <p class="gen-sub">Estamos preparando tus comidas para la semana...</p>
          }
        </div>
      </div>
    </div>

    <div class="wiz-footer">
      @if (step() < STEPS.length - 2) {
        <button class="btn-primary" (click)="nextStep()">
          Continuar
          <svg class="arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      } @else if (step() === STEPS.length - 2) {
        <button class="btn-primary" (click)="finishOnboarding()" [disabled]="submitting()">
          @if (submitting()) { <span class="spinner"></span> }
          Comenzar mi viaje
          <svg class="arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </button>
      }
    </div>
  </div>
  `,
  styles: [`
    :host { display: contents; }
    .shell {
      position: relative; z-index: 1;
      max-width: 540px; margin: 0 auto;
      min-height: 100vh;
      display: flex; flex-direction: column;
    }
    .wiz-header {
      position: sticky; top: 0;
      background: var(--cream); z-index: 10;
      padding: 18px 22px 14px;
    }
    .wiz-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
    .wiz-back {
      display: flex; align-items: center; gap: 6px;
      color: var(--ink-light); font-size: 13px; font-weight: 600;
      padding: 6px 10px; border-radius: var(--r-pill);
    }
    .wiz-back:hover { background: var(--mint-soft); color: var(--pine); }
    .wiz-back.invisible { visibility: hidden; }
    .wiz-step-counter { font-size: 12px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-muted); }
    .wiz-step-counter strong { color: var(--pine); }
    .wiz-skip { font-size: 13px; font-weight: 600; color: var(--ink-light); padding: 6px 10px; border-radius: var(--r-pill); }
    .wiz-skip:hover { color: var(--pine); }
    .wiz-progress { height: 4px; background: var(--line); border-radius: 4px; overflow: hidden; }
    .wiz-progress-fill { height: 100%; background: linear-gradient(90deg, var(--mint), var(--pine)); border-radius: 4px; transition: width 0.6s var(--ease-out); }
    .wiz-stage { flex: 1; position: relative; overflow: hidden; }
    .wiz-step { display: none; padding: 12px 22px 32px; animation: stepIn 0.5s var(--ease-out); }
    .wiz-step.active { display: block; }
    @keyframes stepIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
    .step-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--mint); margin-bottom: 10px; display: inline-flex; align-items: center; gap: 8px; }
    .step-eyebrow::before { content: ''; width: 22px; height: 1.5px; background: var(--mint); }
    .step-title { font-family: var(--display); font-size: clamp(28px, 5vw, 36px); font-weight: 400; line-height: 1.1; letter-spacing: -0.025em; color: var(--ink); margin-bottom: 12px; }
    .step-title .italic { font-style: italic; color: var(--pine); }
    .step-subtitle { font-size: 15px; color: var(--ink-light); margin-bottom: 28px; line-height: 1.55; max-width: 460px; }

    .wiz-footer {
      position: sticky; bottom: 0;
      padding: 18px 22px 24px;
      background: linear-gradient(to top, var(--cream) 70%, transparent);
      z-index: 10;
    }

    .welcome-hero { text-align: center; padding: 8px 0 12px; }
    .gen-hero { text-align: center; padding: 60px 0 20px; }
    .gen-title { font-family: var(--display); font-size: clamp(28px, 5vw, 36px); font-weight: 400; color: var(--ink); margin-top: 16px; }
    .gen-title .italic { font-style: italic; color: var(--pine); }
    .gen-sub { font-size: 15px; color: var(--ink-light); margin-top: 8px; }
    .welcome-title { font-family: var(--display); font-size: clamp(32px, 6vw, 42px); font-weight: 400; line-height: 1.05; letter-spacing: -0.025em; color: var(--ink); margin-bottom: 12px; }
    .welcome-title .italic { font-style: italic; color: var(--pine); }
    .welcome-sub { font-size: 16px; color: var(--ink-light); max-width: 380px; margin: 0 auto 36px; line-height: 1.55; }

    .choice-cards { display: flex; flex-direction: column; gap: 12px; max-width: 460px; margin: 0 auto; }
    .choice {
      background: var(--paper); border: 1.5px solid var(--line); border-radius: var(--r-lg);
      padding: 20px; display: flex; align-items: center; gap: 16px;
      text-align: left; cursor: pointer; transition: all 0.2s var(--ease-out);
    }
    .choice:hover { border-color: var(--mint); box-shadow: var(--shadow-md); transform: translateY(-1px); }
    .choice.selected { border-color: var(--pine); background: var(--mint-soft); box-shadow: 0 0 0 3px rgba(15,61,46,0.08); }
    .choice-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .choice-icon.create { background: var(--mint-soft); color: var(--pine); }
    .choice-icon.join { background: var(--lake-light); color: var(--lake); }
    .choice-text { flex: 1; }
    .choice-title { font-family: var(--display); font-size: 18px; font-weight: 500; color: var(--ink); margin-bottom: 4px; letter-spacing: -0.01em; }
    .choice-desc { font-size: 13px; color: var(--ink-light); line-height: 1.45; }
    .choice-check { width: 22px; height: 22px; border-radius: 50%; border: 2px solid var(--line); display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s var(--ease-out); }
    .choice.selected .choice-check { background: var(--pine); border-color: var(--pine); }
    .choice-check svg { opacity: 0; }
    .choice.selected .choice-check svg { opacity: 1; }

    .invite-input-wrap { margin-top: 16px; background: var(--paper); border: 1.5px solid var(--line); border-radius: var(--r-lg); padding: 14px 18px; display: flex; align-items: center; gap: 12px; max-width: 460px; margin-left: auto; margin-right: auto; }
    .invite-input-wrap input { flex: 1; border: none; outline: none; background: none; font-size: 16px; font-weight: 600; letter-spacing: 0.06em; color: var(--pine); text-transform: uppercase; }
    .invite-input-wrap input::placeholder { color: var(--ink-muted); letter-spacing: 0.04em; text-transform: none; font-weight: 500; }
    .invite-pill { font-size: 11px; font-weight: 700; color: var(--mint); letter-spacing: 0.12em; text-transform: uppercase; padding: 4px 10px; background: var(--mint-soft); border-radius: var(--r-pill); }

    .gender-grid, .goal-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
    .gender-btn, .goal-btn {
      padding: 14px; border: 1.5px solid var(--line); border-radius: var(--r-md);
      background: var(--paper); font-size: 14px; font-weight: 600; text-align: center;
      display: flex; flex-direction: column; align-items: center; gap: 6px;
      transition: all 0.2s var(--ease-out);
    }
    .gender-btn:hover, .goal-btn:hover { border-color: var(--mint); }
    .gender-btn.selected, .goal-btn.selected { border-color: var(--pine); background: var(--mint-soft); }

    .field-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

    .mode-info {
      background: var(--mint-soft); border-left: 3px solid var(--mint);
      padding: 14px 16px; border-radius: var(--r-md);
      font-size: 13px; color: var(--pine); line-height: 1.55;
      margin-bottom: 22px; display: flex; gap: 10px; align-items: flex-start;
    }
    .mode-info-icon { background: var(--mint); color: var(--paper); width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 13px; font-weight: 700; font-family: var(--display); font-style: italic; }

    .modes-grid { display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px; }
    .mode-card { background: var(--paper); border: 1.5px solid var(--line); border-radius: var(--r-lg); padding: 18px; cursor: pointer; transition: all 0.25s var(--ease-out); text-align: left; position: relative; overflow: hidden; }
    .mode-card:hover { border-color: var(--mint); transform: translateY(-2px); box-shadow: var(--shadow-md); }
    .mode-card.selected { border-color: var(--pine); background: linear-gradient(135deg, var(--paper) 0%, var(--mint-soft) 100%); box-shadow: 0 0 0 3px rgba(15,61,46,0.08); }
    .mode-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
    .mode-id { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
    .mode-icon { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: var(--mint-soft); color: var(--pine); }
    .mode-icon.economic { background: var(--mint-soft); color: var(--pine); }
    .mode-icon.basic { background: var(--cream-warm); color: var(--gold); }
    .mode-icon.simple { background: var(--lake-light); color: var(--lake); }
    .mode-icon.busy { background: var(--coral-bg); color: var(--coral); }
    .mode-icon.athletic { background: rgba(15,61,46,0.10); color: var(--pine-darker); }
    .mode-icon.gourmet { background: var(--gold-soft); color: var(--gold); }
    .mode-title { font-family: var(--display); font-size: 19px; font-weight: 500; letter-spacing: -0.01em; color: var(--ink); margin-bottom: 2px; }
    .mode-pill-cost { font-size: 11px; font-weight: 700; letter-spacing: 0.06em; color: var(--pine); background: var(--mint-soft); padding: 4px 9px; border-radius: var(--r-pill); white-space: nowrap; display: inline-block; }
    .mode-card.selected .mode-pill-cost { background: var(--paper); }
    .mode-check { width: 22px; height: 22px; border-radius: 50%; border: 2px solid var(--line); display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s var(--ease-out); }
    .mode-card.selected .mode-check { background: var(--pine); border-color: var(--pine); }
    .mode-check svg { opacity: 0; }
    .mode-card.selected .mode-check svg { opacity: 1; }
    .mode-desc { font-size: 13px; color: var(--ink-light); line-height: 1.5; margin-bottom: 4px; }
    .mode-details { display: none; padding-top: 12px; margin-top: 4px; border-top: 1px solid rgba(15,61,46,0.10); }
    .mode-card.selected .mode-details { display: block; animation: slideDown 0.4s var(--ease-out); }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
    .mode-detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
    .mode-detail { display: flex; align-items: center; gap: 8px; padding: 8px 10px; background: rgba(255,255,255,0.6); border-radius: var(--r-sm); font-size: 12px; color: var(--ink-soft); }
    .mode-detail-icon { width: 16px; height: 16px; color: var(--pine); flex-shrink: 0; }
    .mode-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
    .mode-tag { padding: 4px 10px; background: rgba(255,255,255,0.7); color: var(--pine); border-radius: var(--r-pill); font-size: 11px; font-weight: 600; }

    .chip-grid { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip {
      padding: 10px 14px; border: 1.5px solid var(--line); border-radius: var(--r-pill);
      background: var(--paper); font-size: 13px; font-weight: 600;
      display: flex; align-items: center; gap: 6px;
      transition: all 0.2s var(--ease-out);
    }
    .chip:hover { border-color: var(--mint); }
    .chip.selected { border-color: var(--coral); background: var(--coral-bg); color: var(--coral); }

    .disclaimer-box {
      display: flex; gap: 14px; align-items: flex-start;
      background: var(--warning-bg); padding: 16px; border-radius: var(--r-md);
      font-size: 13px; line-height: 1.5; color: var(--ink-soft); margin-bottom: 24px;
    }
    .disclaimer-box strong { display: block; margin-bottom: 4px; color: var(--warning); }

    .spinner {
      width: 18px; height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white; border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class OnboardingPage {
  private readonly fb = inject(FormBuilder);
  private readonly onboarding = inject(OnboardingService);
  private readonly router = inject(Router);

  readonly STEPS = STEPS;
  readonly step = signal(0);
  readonly submitting = signal(false);
  readonly planDone = signal(false);

  readonly groupAction = signal<'create' | 'join'>('create');
  readonly inviteCode = signal('');

  readonly basicForm = this.fb.group({
    dateOfBirth: ['', Validators.required],
    gender: ['male' as string],
  });

  readonly metricsForm = this.fb.group({
    weightKg: [70, [Validators.required, Validators.min(30), Validators.max(300)]],
    heightCm: [170, [Validators.required, Validators.min(100), Validators.max(250)]],
    goalWeightKg: [null as number | null],
  });

  readonly bodyTypeForm = this.fb.group({ bodyType: ['slim' as BodyType] });
  readonly activityForm = this.fb.group({ activityLevel: ['Sedentary' as ActivityLevel] });
  readonly budgetForm = this.fb.group({ budgetMode: ['basic'] });

  readonly medicalForm = this.fb.group({
    conditions: [[] as string[]],
    allergies: [[] as string[]],
    medications: [''],
  });

  readonly goalForm = this.fb.group({
    goalType: ['weightLoss'],
    goalDescription: [''],
    acceptTerms: [false, Validators.requiredTrue],
  });

  readonly genderOptions = [
    { value: 'male', label: 'Masculino' },
    { value: 'female', label: 'Femenino' },
    { value: 'nonBinary', label: 'No binario' },
    { value: 'preferNotToSay', label: 'Prefiero no decirlo' },
  ];

  private readonly maleBodyTypes = [
    { value: 'slim' as BodyType, label: 'Ectomorfo', desc: 'Complexión delgada, metab. rápido', icon: '🏃', color: 'var(--lake-light)' },
    { value: 'average' as BodyType, label: 'Mesomorfo', desc: 'Complexión atlética, definición media', icon: '💪', color: 'var(--mint-soft)' },
    { value: 'plus' as BodyType, label: 'Endomorfo', desc: 'Complexión robusta, tiende a acumular', icon: '🦾', color: 'var(--coral-bg)' },
    { value: 'athletic' as BodyType, label: 'Atlético', desc: 'Musculoso, cuerpo trabajado', icon: '🏋️', color: 'var(--mint-soft)' },
    { value: 'heavy' as BodyType, label: 'Robusto', desc: 'Complexión grande y sólida', icon: '🧑', color: 'var(--gold-soft)' },
  ];

  private readonly femaleBodyTypes = [
    { value: 'slim' as BodyType, label: 'Rectángulo', desc: 'Hombros y caderas alineados', icon: '🧘', color: 'var(--lake-light)' },
    { value: 'curvy' as BodyType, label: 'Pera', desc: 'Caderas más anchas que hombros', icon: '🍐', color: 'var(--mint-soft)' },
    { value: 'average' as BodyType, label: 'Reloj de arena', desc: 'Hombros y caderas equilibrados', icon: '⏳', color: 'var(--coral-bg)' },
    { value: 'plus' as BodyType, label: 'Manzana', desc: 'Más peso en la parte media', icon: '🍎', color: 'var(--gold-soft)' },
    { value: 'athletic' as BodyType, label: 'Triángulo invertido', desc: 'Hombros más anchos que caderas', icon: '🔻', color: 'var(--mint-soft)' },
  ];

  readonly currentBodyTypes = computed(() => {
    const gender = this.basicForm.get('gender')?.value;
    const base = gender === 'female' ? this.femaleBodyTypes : this.maleBodyTypes;
    return [
      ...base,
      { value: 'average' as BodyType, label: 'No estoy seguro', desc: 'Déjalo en automático', icon: '❓', color: 'var(--cream-warm)' },
    ];
  });

  readonly activityLevels = [
    { value: 'Sedentary' as ActivityLevel, label: 'Sedentario', desc: 'Trabajo de oficina, poco o nada de ejercicio', icon: '&#x1F4BB;', color: 'var(--cream-warm)' },
    { value: 'Light' as ActivityLevel, label: 'Ligero', desc: 'Camino 1-2 días a la semana', icon: '&#x1F9F6;', color: 'var(--mint-soft)' },
    { value: 'Moderate' as ActivityLevel, label: 'Moderado', desc: 'Ejercicio 3-4 días a la semana', icon: '&#x1F6B4;', color: 'var(--lake-light)' },
    { value: 'Active' as ActivityLevel, label: 'Activo', desc: 'Ejercicio 5-6 días a la semana', icon: '&#x1F3C3;', color: 'var(--mint-soft)' },
    { value: 'VeryActive' as ActivityLevel, label: 'Muy activo', desc: 'Ejercicio diario o trabajo físico intenso', icon: '&#x1F525;', color: 'var(--coral-bg)' },
  ];

  readonly budgetModes = [
    { value: 'economic' as BudgetMode, label: 'Económico', cost: '$ Bajo', icon: '&#x1F4B0;', cssClass: 'economic', desc: 'Ingredientes básicos y de temporada. Aprovecha al máximo tu presupuesto.', time: '15-25 min', complexity: 'Recetas simples', tags: ['Huevo', 'Atún', 'Verduras de temporada', 'Pollo'] },
    { value: 'basic' as BudgetMode, label: 'Básico', cost: '$$ Medio', icon: '&#x1F372;', cssClass: 'basic', desc: 'Ingredientes accesibles con variedad moderada. El equilibrio perfecto.', time: '20-30 min', complexity: 'Recetas sencillas', tags: ['Carne molida', 'Queso', 'Aguacate', 'Verduras'] },
    { value: 'simple' as BudgetMode, label: 'Simple', cost: '$$ Medio', icon: '&#x1F958;', cssClass: 'simple', desc: 'Mínimos ingredientes, máximo sabor. Recetas de 5 ingredientes o menos.', time: '10-20 min', complexity: 'Muy simples', tags: ['5 ingredientes', 'Rápido', 'Pocos trastes'] },
    { value: 'busy' as BudgetMode, label: 'Ocupado', cost: '$$$ Alto', icon: '&#x23F3;', cssClass: 'busy', desc: 'Recetas exprés para quienes tienen poco tiempo. Meal prep en 30 min.', time: '10-15 min', complexity: 'Batch cooking', tags: ['Meal prep', 'Congelar', 'Microondas', '1 traste'] },
    { value: 'athletic' as BudgetMode, label: 'Atlético', cost: '$$$ Alto', icon: '&#x1F4AA;', cssClass: 'athletic', desc: 'Alto en proteína para rendimiento y recuperación muscular.', time: '20-30 min', complexity: 'Altas proteínas', tags: ['30g+ proteína', 'Pezcado', 'Pechuga', 'Suplementos'] },
    { value: 'gourmet' as BudgetMode, label: 'Gourmet', cost: '$$$$ Premium', icon: '&#x1F3B0;', cssClass: 'gourmet', desc: 'Ingredientes premium y recetas elaboradas. Para los amantes de la cocina.', time: '30-50 min', complexity: 'Elaboradas', tags: ['Cortes finos', 'Mariscos', 'Quesos artesanales', 'Técnicas'] },
  ];

  readonly healthConditions = [
    { value: 'pregnancy', label: 'Embarazo', icon: '&#x1F476;' },
    { value: 'breastfeeding', label: 'Lactancia', icon: '&#x1F37C;' },
    { value: 'diabetesType1', label: 'Diabetes T1', icon: '&#x1FA7A;' },
    { value: 'diabetesType2', label: 'Diabetes T2', icon: '&#x1FA7A;' },
    { value: 'hypertension', label: 'Hipertensión', icon: '&#x1FA7C;' },
    { value: 'kidneyDisease', label: 'Renales', icon: '&#x1F9F1;' },
    { value: 'liverDisease', label: 'Hepáticas', icon: '&#x1F9AC;' },
    { value: 'pancreatitis', label: 'Pancreatitis', icon: '&#x1F9BD;' },
    { value: 'heartDisease', label: 'Cardíacas', icon: '&#x1FAC0;' },
    { value: 'eatingDisorder', label: 'T. Alimentaria', icon: '&#x1F9E0;' },
    { value: 'other', label: 'Otra', icon: '&#x2795;' },
  ];

  readonly allergies = [
    'Lácteos', 'Huevo', 'Gluten', 'Cacahuate', 'Nueces',
    'Mariscos', 'Pescado', 'Soja', 'Sésamo', 'Sulfitos'
  ];

  readonly goals = [
    { value: 'weightLoss', label: 'Perder peso', icon: '&#x1F4C9;' },
    { value: 'maintenance', label: 'Mantener', icon: '&#x2696;&#xFE0F;' },
    { value: 'muscleGain', label: 'Ganar músculo', icon: '&#x1F4C8;' },
    { value: 'health', label: 'Mejorar salud', icon: '&#x2764;&#xFE0F;' },
  ];

  private selectedConditions = new Set<string>();
  private selectedAllergies = new Set<string>();

  isConditionSelected(value: string) { return this.selectedConditions.has(value); }
  isAllergySelected(value: string) { return this.selectedAllergies.has(value); }

  toggleCondition(value: string) {
    this.selectedConditions.has(value) ? this.selectedConditions.delete(value) : this.selectedConditions.add(value);
    this.medicalForm.patchValue({ conditions: [...this.selectedConditions] });
  }

  toggleAllergy(value: string) {
    this.selectedAllergies.has(value) ? this.selectedAllergies.delete(value) : this.selectedAllergies.add(value);
    this.medicalForm.patchValue({ allergies: [...this.selectedAllergies] });
  }

  nextStep() {
    if (this.step() < STEPS.length - 2) {
      this.submitCurrentStep();
      this.step.update(s => s + 1);
      window.scrollTo(0, 0);
    }
  }

  prevStep() {
    if (this.step() > 0) {
      this.step.update(s => s - 1);
      window.scrollTo(0, 0);
    }
  }

  skipStep() {
    if (this.step() < STEPS.length - 2) {
      this.step.update(s => s + 1);
      window.scrollTo(0, 0);
    }
  }

  private submitCurrentStep() {
    const stepIdx = this.step();
    switch (stepIdx) {
      case 0: this.submitGroup(); break;
      case 1: this.submitBasicData(); break;
      case 2: this.submitMetrics(); break;
      case 3: this.submitBodyType(); break;
      case 4: this.submitActivity(); break;
      case 5: this.submitBudgetMode(); break;
      case 6: this.submitMedical(); break;
    }
  }

  private submitGroup() {
    const action = this.groupAction();
    this.onboarding.completeStep1Group({
      action,
      groupName: action === 'create' ? 'Mi Familia' : undefined,
      inviteCode: action === 'join' ? this.inviteCode() || undefined : undefined,
    }).subscribe();
  }

  private submitBasicData() {
    if (this.basicForm.invalid) return;
    const raw = this.basicForm.value;
    this.onboarding.completeStep2BasicData({
      birthDate: raw.dateOfBirth!,
      gender: this.mapGender(raw.gender!),
    }).subscribe();
  }

  private submitMetrics() {
    if (this.metricsForm.invalid) return;
    const raw = this.metricsForm.value;
    this.onboarding.completeStep3Metrics({
      weightKg: raw.weightKg!,
      heightCm: raw.heightCm!,
      targetWeightKg: raw.goalWeightKg ?? undefined,
    }).subscribe();
  }

  private submitBodyType() {
    this.onboarding.completeStep4BodyType(this.bodyTypeForm.value as BodyTypeRequest).subscribe();
  }

  private submitActivity() {
    this.onboarding.completeStep5Activity(this.activityForm.value as ActivityRequest).subscribe();
  }

  private submitBudgetMode() {
    const mode = this.budgetForm.value.budgetMode!;
    this.onboarding.completeStep5BudgetMode({ budgetModeId: this.mapBudgetModeId(mode) }).subscribe();
  }

  private submitMedical() {
    const req: MedicalProfileRequest = {
      allergies: [...this.selectedAllergies],
      medications: this.medicalForm.value.medications ? [this.medicalForm.value.medications] : [],
      dietaryRestrictions: [],
      dislikedIngredients: [],
      preferredIngredients: [],
      ketoExperienceLevel: 'Beginner',
    };
    for (const c of this.selectedConditions) {
      switch (c) {
        case 'pregnancy':
        case 'breastfeeding': req.isPregnantOrLactating = true; break;
        case 'diabetesType1': req.hasDiabetes = true; req.diabetesType = 'T1'; break;
        case 'diabetesType2': req.hasDiabetes = true; req.diabetesType = 'T2'; break;
        case 'kidneyDisease': req.hasKidneyIssues = true; break;
        case 'liverDisease': req.hasLiverIssues = true; break;
        case 'pancreatitis': req.hasPancreasIssues = true; break;
        case 'heartDisease': req.hasHeartCondition = true; break;
        case 'eatingDisorder': req.hasEatingDisorderHistory = true; break;
      }
    }
    this.onboarding.completeStep6MedicalProfile(req).subscribe();
  }

  finishOnboarding() {
    if (this.goalForm.invalid) return;
    this.submitting.set(true);

    this.submitCurrentStep();

    this.onboarding.completeStep7DisclaimerGoal({
      disclaimerVersionId: '',
      goalType: this.mapGoalType(this.goalForm.value.goalType!),
      motivationText: this.goalForm.value.goalDescription || undefined,
      targetWeightKg: this.metricsForm.value.goalWeightKg ?? undefined,
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.step.set(STEPS.length - 1);
        setTimeout(() => {
          this.planDone.set(true);
          setTimeout(() => this.router.navigate(['/dashboard']), 2500);
        }, 2000);
      },
      error: () => {
        this.submitting.set(false);
        this.router.navigate(['/dashboard']);
      },
    });
  }

  private mapGender(gender: string): BasicDataRequest['gender'] {
    const map: Record<string, BasicDataRequest['gender']> = {
      male: 'Male', female: 'Female', nonBinary: 'NonBinary', preferNotToSay: 'PreferNotToSay',
    };
    return map[gender] ?? 'PreferNotToSay';
  }

  private mapBudgetModeId(mode: string): string {
    const map: Record<string, string> = {
      economic: 'economic', basic: 'pantry_basic', simple: 'simple_kitchen',
      busy: 'busy_parent', athletic: 'athletic', gourmet: 'gourmet',
    };
    return map[mode] ?? 'pantry_basic';
  }

  private mapGoalType(type: string): DisclaimerGoalRequest['goalType'] {
    const map: Record<string, DisclaimerGoalRequest['goalType']> = {
      weightLoss: 'WeightLoss', maintenance: 'Maintenance',
      muscleGain: 'MuscleGain', health: 'Health',
    };
    return map[type] ?? 'Health';
  }
}
