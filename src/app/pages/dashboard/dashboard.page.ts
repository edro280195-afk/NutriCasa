import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PlanService } from '../../services/plan.service';
import { ApiService } from '../../services/api.service';
import { LottieAnimationComponent } from '../../components/lottie-animation/lottie-animation.component';
import type { PlanGenerationResult, MealPlanDto } from '../../models/plan.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, LottieAnimationComponent],
  template: `
  <div class="dash">
    <div class="dash-header">
      <div class="dash-brand">
        <svg class="leaf-icon" viewBox="0 0 24 24"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>
        NutriCasa
      </div>
      <div class="dash-actions">
        <button class="icon-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>
        <button class="icon-btn" (click)="logout()">
          <div class="avatar-fallback">{{ initials() }}</div>
        </button>
      </div>
    </div>

    <div class="greeting">
      <div class="greeting-eyebrow">{{ timeGreeting() }}</div>
      <h1 class="greeting-title">
        {{ firstName() }}, <span class="italic">{{ motivational() }}</span>
      </h1>
      <div class="greeting-date">{{ todayDate() }}</div>
    </div>

    @if (plan(); as p) {
      <div class="macros-card">
        <div class="macros-header">
          <div>
            <div class="macros-label">Hoy · Tu meta keto</div>
            <div class="macros-title">Vas <span class="italic">muy bien.</span></div>
          </div>
          <div class="macros-pill"><span class="dot"></span>{{ p.budgetModeName }}</div>
        </div>

        <div class="macros-grid">
          <div class="macro">
            <div class="macro-name">Grasa</div>
            <div class="macro-value">{{ todayFatGr() }}<span class="small">/ {{ macros().fatGrams }}g</span></div>
            <div class="macro-bar"><div class="macro-bar-fill fat" [style.width.%]="fatPercent()"></div></div>
          </div>
          <div class="macro">
            <div class="macro-name">Proteína</div>
            <div class="macro-value">{{ todayProteinGr() }}<span class="small">/ {{ macros().proteinGrams }}g</span></div>
            <div class="macro-bar"><div class="macro-bar-fill protein" [style.width.%]="proteinPercent()"></div></div>
          </div>
          <div class="macro">
            <div class="macro-name">Carbs netos</div>
            <div class="macro-value">{{ todayCarbsGr() }}<span class="small">/ {{ macros().carbsGrams }}g</span></div>
            <div class="macro-bar"><div class="macro-bar-fill carbs" [style.width.%]="carbsPercent()"></div></div>
          </div>
        </div>

        <div class="macros-footer">
          <div class="macros-cal-info">
            <div class="macros-cal-circle"><span>{{ calPercent() }}%</span></div>
            <div class="macros-cal-text">
              <strong>{{ todayCalories() }} / {{ macros().dailyCalories }} kcal</strong>
              <small>{{ macros().dailyCalories - todayCalories() }} kcal restantes hoy</small>
            </div>
          </div>
          <button class="macros-arrow" (click)="router.navigate(['/plan'])" title="Ver plan semanal">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </div>

      @if (p.savingsVsGourmetMxn) {
        <div class="savings-card">
          <div class="savings-eyebrow">Tu ahorro</div>
          <div class="savings-title">Llevas ahorrado <span class="italic">{{ '$' + savingsAmount() }} MXN</span></div>
          <div class="savings-period">vs modo Internacional</div>

          <div class="savings-compare">
            <div class="savings-bar-wrap">
              <div class="savings-bar-row">
                <span class="savings-bar-label">Tu plan</span>
                <div class="savings-bar"><div class="savings-bar-fill you" [style.width.%]="savingsPercent()"></div></div>
                <span class="savings-bar-amount">{{ '$' + p.estimatedCostMxn }}</span>
              </div>
              <div class="savings-bar-row">
                <span class="savings-bar-label">Internacional</span>
                <div class="savings-bar"><div class="savings-bar-fill gourmet"></div></div>
                <span class="savings-bar-amount">{{ '$' + (p.estimatedCostMxn! + p.savingsVsGourmetMxn!) }}</span>
              </div>
            </div>
          </div>

          <div class="savings-foot">
            <div class="savings-foot-text">
              <strong>{{ p.savingsVsGourmetPercent }}% de ahorro</strong>
            </div>
            <button class="savings-share-btn" (click)="shareSavings()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Compartir
            </button>
          </div>
        </div>
      }

      @if (p.estimatedCostMxn) {
        <div class="week-cost-card">
          <div class="cost-head">
            <span class="cost-eyebrow">Esta semana</span>
            <span class="cost-mode">{{ p.budgetModeName }}</span>
          </div>
          <div class="cost-row">
            <span class="cost-amount">{{ '$' + p.estimatedCostMxn }}</span>
            <span class="cost-currency">MXN</span>
          </div>
          <div class="cost-period">Costo estimado de tu plan semanal</div>
          @if (p.savingsVsGourmetMxn) {
            <div class="cost-breakdown">
              <div class="cost-mini">
                <div class="cost-mini-label">Vs Internacional</div>
                <div class="cost-mini-value">{{ '$' + (p.estimatedCostMxn + p.savingsVsGourmetMxn) }} <span class="small">MXN</span></div>
              </div>
              <div class="cost-mini">
                <div class="cost-mini-label">Ahorro semanal</div>
                <div class="cost-mini-value" style="color:var(--mint);">+{{ p.savingsVsGourmetMxn }} <span class="small">MXN</span></div>
              </div>
            </div>
          }
        </div>
      }
    } @else if (loading()) {
      <div class="loading-state">
        <div class="spinner-lg"></div>
        <p>Cargando tu plan...</p>
      </div>
    }

    <div class="quick-actions">
      <button class="quick-action" (click)="showWeightForm.set(true)">
        <div class="qa-icon weigh">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="16 12 12 8 8 12"/><line x1="12" y1="16" x2="12" y2="8"/>
          </svg>
        </div>
        <div class="qa-text">
          <div class="qa-title">Registrar peso</div>
          <div class="qa-meta">Último registro: {{ lastWeight() }} kg</div>
        </div>
      </button>
      <button class="quick-action" (click)="showCheckInForm.set(true)">
        <div class="qa-icon checkin">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </div>
        <div class="qa-text">
          <div class="qa-title">Check-in del día</div>
          <div class="qa-meta">60 segundos · {{ checkInDone() ? 'completado' : 'pendiente' }}</div>
        </div>
      </button>
    </div>

    @if (showWeightForm()) {
      <div class="inline-form">
        <div class="inline-form-head">
          <span>Registrar peso</span>
          <button class="inline-form-close" (click)="showWeightForm.set(false)">&times;</button>
        </div>
        <input class="form-input" type="number" step="0.1" placeholder="Peso (kg)" #weightInput />
        <button class="form-btn" (click)="submitWeight(weightInput.valueAsNumber); weightInput.value = ''">Guardar</button>
        @if (weightSaving()) { <div class="form-feedback saving">Guardando...</div> }
        @if (weightError()) { <div class="form-feedback error">{{ weightError() }}</div> }
        @if (weightDone()) { <div class="form-feedback success">¡Peso registrado!</div> }
      </div>
    }

    @if (showCheckInForm()) {
      <div class="inline-form">
        <div class="inline-form-head">
          <span>Check-in del día</span>
          <button class="inline-form-close" (click)="showCheckInForm.set(false)">&times;</button>
        </div>
        <div class="checkin-grid">
          <label>Energía (1-10)
            <input class="form-input" type="number" min="1" max="10" #energyInput />
          </label>
          <label>Ánimo (1-10)
            <input class="form-input" type="number" min="1" max="10" #moodInput />
          </label>
          <label>Agua (L)
            <input class="form-input" type="number" step="0.1" placeholder="Litros" #waterInput />
          </label>
        </div>
        <textarea class="form-input form-textarea" placeholder="Notas (opcional)" #notesInput></textarea>
        <button class="form-btn" (click)="submitCheckIn(energyInput.valueAsNumber, moodInput.valueAsNumber, waterInput.valueAsNumber, notesInput.value)">Guardar</button>
        @if (checkInSaving()) { <div class="form-feedback saving">Guardando...</div> }
        @if (checkInError()) { <div class="form-feedback error">{{ checkInError() }}</div> }
      </div>
    }

    @if (showCelebration()) {
      <div class="celebration-overlay" (click)="showCelebration.set(false)">
        <div class="celebration-content">
          <div class="celebration-ring"></div>
          <app-lottie src="/lottie/avocado.json" width="200px" height="200px" [loop]="false" class="celebration-lottie"></app-lottie>
          <h2 class="celebration-title">¡Excelente!</h2>
          <p class="celebration-sub">Check-in del día completado.<br>Sigue así, cada día cuenta.</p>
          <div class="celebration-chips">
            <span class="cel-chip">💧 Hidratación</span>
            <span class="cel-chip">⚡ Energía</span>
            <span class="cel-chip">😊 Ánimo</span>
          </div>
          <p class="celebration-hint">Toca para continuar</p>
        </div>
      </div>
    }

    <div class="meals-section">
      <div class="section-head">
        <h2 class="section-title">Comidas de <span class="italic">hoy</span></h2>
        <a routerLink="/plan" class="section-link">Ver semana</a>
      </div>

      @if (todayMeals().length > 0) {
        <div class="meals">
          @for (meal of todayMeals(); track meal.planMealId) {
            <button class="meal" [class.locked]="meal.isLocked" (click)="selectedMeal.set(meal)">
              <div class="meal-thumb" [class]="'meal-thumb-' + getMealColor(meal.mealType)">
                {{ mealEmoji(meal.mealType) }}
              </div>
              <div class="meal-info">
                <div class="meal-time">{{ getMealLabel(meal.mealType) }}</div>
                <div class="meal-name">{{ meal.recipe.name }}</div>
                <div class="meal-macros">
                  <span class="kcal">{{ meal.recipe.calories }} kcal</span>
                  <span class="prot">{{ meal.recipe.proteinGr }}g P</span>
                  <span class="fat">{{ meal.recipe.fatGr }}g G</span>
                </div>
              </div>
              <div class="meal-chevron">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </button>
          }
        </div>
      } @else {
        <div class="empty-meals">
          <p>No hay comidas para hoy. <a routerLink="/plan">Genera tu plan</a></p>
        </div>
      }
    </div>

    @if (selectedMeal(); as m) {
      <div class="drawer-backdrop" (click)="selectedMeal.set(null)">
        <div class="recipe-drawer" (click)="$event.stopPropagation()">
          <div class="drawer-handle"></div>
          <button class="drawer-close" (click)="selectedMeal.set(null)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
          <div class="drawer-type-badge">{{ getMealLabel(m.mealType) }}</div>
          <h2 class="drawer-name">{{ m.recipe.name }}</h2>

          <div class="drawer-chips">
            <div class="dchip dchip-kcal">{{ m.recipe.calories }} kcal</div>
            <div class="dchip dchip-fat">{{ m.recipe.fatGr }}g grasa</div>
            <div class="dchip dchip-prot">{{ m.recipe.proteinGr }}g prot</div>
            <div class="dchip dchip-carb">{{ m.recipe.carbsGr }}g carbs</div>
          </div>

          <div class="drawer-meta">
            @if (m.recipe.prepTimeMin) {
              <span class="drawer-meta-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {{ m.recipe.prepTimeMin }}min prep
              </span>
            }
            @if (m.recipe.cookTimeMin) {
              <span class="drawer-meta-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 006 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6M10 22h4"/></svg>
                {{ m.recipe.cookTimeMin }}min cocción
              </span>
            }
            @if (m.recipe.estimatedCostMxn) {
              <span class="drawer-meta-item">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
                ~\${{ m.recipe.estimatedCostMxn }} MXN
              </span>
            }
          </div>

          @if (m.recipe.ingredients && m.recipe.ingredients.length > 0) {
            <div class="drawer-section">
              <div class="drawer-section-title">Ingredientes</div>
              <div class="drawer-ingredients">
                @for (ing of m.recipe.ingredients; track ing.name) {
                  <div class="drawer-ing">
                    <span class="ing-dot"></span>
                    <span class="ing-name">{{ ing.name }}</span>
                    <span class="ing-qty">{{ ing.amount }} {{ ing.unit }}</span>
                  </div>
                }
              </div>
            </div>
          }

          @if (m.recipe.instructions) {
            <div class="drawer-section">
              <div class="drawer-section-title">Preparación</div>
              <p class="drawer-instructions">{{ m.recipe.instructions }}</p>
            </div>
          }
        </div>
      </div>
    }

    <div class="family-card">
      <div class="family-eyebrow">Tu familia</div>
      <h3 class="family-title">
        Llevan <span class="italic">seguimiento juntos.</span>
      </h3>
      <p class="family-status">Comparte tu progreso y motiva a los tuyos.</p>
      <a routerLink="/family" class="family-cta">
        Ver muro familiar
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
        </svg>
      </a>
    </div>
  </div>

  `,
  styles: [`:host { display: contents; }
    .dash { max-width: 480px; margin: 0 auto; padding: 0 20px 120px; background: var(--cream); position: relative; z-index: 1; }
    .dash-header { padding: 24px 0 20px; display: flex; align-items: center; justify-content: space-between; }
    .dash-brand { font-family: var(--display); font-size: 22px; font-weight: 500; color: var(--pine); display: flex; align-items: center; gap: 8px; }
    .dash-brand svg { width: 22px; height: 22px; fill: var(--mint); }
    .dash-actions { display: flex; gap: 10px; }
    .icon-btn { width: 42px; height: 42px; background: var(--paper); border-radius: var(--r-pill); display: flex; align-items: center; justify-content: center; color: var(--ink); position: relative; box-shadow: var(--shadow-sm); }
    .avatar-fallback { width: 100%; height: 100%; background: linear-gradient(135deg, var(--mint), var(--lake)); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: var(--pine-darker); font-weight: 700; font-size: 16px; }
    .greeting { margin-bottom: 22px; }
    .greeting-eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--mint); margin-bottom: 8px; }
    .greeting-title { font-family: var(--display); font-size: 32px; font-weight: 400; line-height: 1.15; letter-spacing: -0.02em; color: var(--ink); }
    .greeting-title .italic { font-style: italic; color: var(--pine); }
    .greeting-date { font-size: 13px; color: var(--ink-light); margin-top: 8px; }
    .macros-card { background: var(--pine); color: var(--cream); border-radius: var(--r-xl); padding: 24px; position: relative; overflow: hidden; margin-bottom: 20px; box-shadow: var(--shadow-pine); }
    .macros-card::before { content: ''; position: absolute; top: -60px; right: -60px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(91,192,150,0.18), transparent 70%); border-radius: 50%; }
    .macros-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; position: relative; }
    .macros-label { font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--mint-light); margin-bottom: 4px; }
    .macros-title { font-family: var(--display); font-size: 26px; font-weight: 400; letter-spacing: -0.01em; }
    .macros-title .italic { font-style: italic; color: var(--mint-light); }
    .macros-pill { background: rgba(91,192,150,0.18); border: 1px solid rgba(91,192,150,0.32); color: var(--mint-light); font-size: 11px; font-weight: 600; padding: 6px 12px; border-radius: var(--r-pill); display: flex; align-items: center; gap: 6px; }
    .macros-pill .dot { width: 6px; height: 6px; background: var(--mint); border-radius: 50%; }
    .macros-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; position: relative; }
    .macro { display: flex; flex-direction: column; }
    .macro-name { font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(248,244,236,0.55); margin-bottom: 6px; }
    .macro-value { font-family: var(--display); font-size: 32px; font-weight: 400; line-height: 1; letter-spacing: -0.02em; margin-bottom: 4px; }
    .macro-value .small { font-size: 16px; color: rgba(248,244,236,0.65); margin-left: 2px; }
    .macro-bar { height: 4px; background: rgba(248,244,236,0.12); border-radius: 4px; overflow: hidden; }
    .macro-bar-fill { height: 100%; border-radius: 4px; }
    .macro-bar-fill.fat { background: var(--mint); }
    .macro-bar-fill.protein { background: var(--lake); }
    .macro-bar-fill.carbs { background: var(--coral); }
    .macros-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 16px; border-top: 1px solid rgba(248,244,236,0.10); position: relative; }
    .macros-cal-info { display: flex; align-items: center; gap: 10px; }
    .macros-cal-circle { width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; position: relative; }
    .macros-cal-circle::after { content: ''; position: absolute; inset: 4px; background: var(--pine); border-radius: 50%; }
    .macros-cal-circle span { position: relative; z-index: 1; font-size: 11px; font-weight: 700; }
    .macros-cal-text { font-size: 13px; }
    .macros-cal-text strong { display: block; font-weight: 600; }
    .macros-cal-text small { color: rgba(248,244,236,0.6); font-size: 11px; }
    .macros-arrow { color: var(--mint-light); background: rgba(91,192,150,0.12); width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .savings-card { background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-xl); padding: 20px; margin-bottom: 20px; box-shadow: var(--shadow-sm); transition: all 0.2s var(--ease-out); }
    .savings-card:hover { border-color: var(--mint); box-shadow: var(--shadow-md); }
    .savings-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--mint); margin-bottom: 6px; }
    .savings-title { font-family: var(--display); font-size: 22px; font-weight: 400; color: var(--ink); letter-spacing: -0.01em; margin-bottom: 4px; }
    .savings-title .italic { color: var(--pine); font-style: italic; }
    .savings-period { font-size: 12px; color: var(--ink-muted); margin-bottom: 16px; }
    .savings-compare { margin-bottom: 16px; }
    .savings-bar-wrap { display: flex; flex-direction: column; gap: 10px; }
    .savings-bar-row { display: flex; align-items: center; gap: 10px; }
    .savings-bar-label { font-size: 11px; font-weight: 600; color: var(--ink-light); width: 80px; flex-shrink: 0; }
    .savings-bar { flex: 1; height: 8px; background: var(--cream-warm); border-radius: 8px; overflow: hidden; }
    .savings-bar-fill { height: 100%; border-radius: 8px; transition: width 0.6s var(--ease-out); }
    .savings-bar-fill.you { background: linear-gradient(90deg, var(--mint), var(--pine)); }
    .savings-bar-fill.gourmet { width: 100%; background: var(--line); }
    .savings-bar-amount { font-size: 13px; font-weight: 700; color: var(--ink); width: 50px; text-align: right; }
    .savings-foot { display: flex; flex-direction: column; gap: 12px; }
    .savings-foot-text { font-size: 12px; color: var(--ink-muted); line-height: 1.5; }
    .savings-foot-text strong { color: var(--pine); font-weight: 600; }
    .savings-share-btn { align-self: flex-start; display: inline-flex; align-items: center; gap: 8px; padding: 8px 16px; background: var(--pine); color: var(--cream); border-radius: var(--r-pill); font-size: 12px; font-weight: 600; transition: transform 0.2s var(--ease-out); }
    .savings-share-btn:hover { transform: translateX(2px); }
    .week-cost-card { background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-xl); padding: 20px; margin-bottom: 20px; box-shadow: var(--shadow-sm); transition: all 0.2s var(--ease-out); }
    .week-cost-card:hover { border-color: var(--pine); box-shadow: var(--shadow-md); }
    .cost-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .cost-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-muted); }
    .cost-mode { font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; background: var(--mint-soft); color: var(--pine); padding: 4px 10px; border-radius: var(--r-pill); }
    .cost-row { display: flex; align-items: baseline; gap: 6px; margin-bottom: 4px; }
    .cost-amount { font-family: var(--display); font-size: 32px; font-weight: 500; color: var(--ink); letter-spacing: -0.02em; line-height: 1; }
    .cost-currency { font-size: 14px; font-weight: 600; color: var(--ink-muted); }
    .cost-period { font-size: 12px; color: var(--ink-muted); margin-bottom: 16px; }
    .cost-breakdown { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .cost-mini { background: var(--cream-warm); border-radius: var(--r-lg); padding: 12px; }
    .cost-mini-label { font-size: 11px; font-weight: 600; color: var(--ink-muted); letter-spacing: 0.06em; margin-bottom: 4px; }
    .cost-mini-value { font-family: var(--display); font-size: 20px; font-weight: 500; color: var(--ink); }
    .cost-mini-value .small { font-size: 12px; font-weight: 400; color: var(--ink-light); }
    .inline-form { background: var(--paper); border: 1px solid var(--mint); border-radius: var(--r-lg); padding: 16px; margin-bottom: 20px; animation: slideUp 0.3s var(--ease-out); }
    .inline-form-head { display: flex; justify-content: space-between; align-items: center; font-size: 14px; font-weight: 600; color: var(--ink); margin-bottom: 12px; }
    .inline-form-close { width: 28px; height: 28px; border-radius: 50%; background: var(--cream-warm); color: var(--ink-muted); font-size: 18px; display: flex; align-items: center; justify-content: center; }
    .form-input { width: 100%; padding: 10px 14px; border: 1px solid var(--line); border-radius: var(--r-md); font-size: 14px; background: var(--cream); color: var(--ink); margin-bottom: 10px; box-sizing: border-box; }
    .form-input:focus { border-color: var(--mint); outline: none; box-shadow: 0 0 0 3px rgba(91,192,150,0.15); }
    .form-textarea { min-height: 60px; resize: vertical; }
    .form-btn { width: 100%; padding: 12px; background: var(--pine); color: var(--cream); border-radius: var(--r-pill); font-size: 14px; font-weight: 600; transition: transform 0.2s var(--ease-out); }
    .form-btn:hover { transform: translateY(-1px); }
    .form-feedback { font-size: 12px; font-weight: 600; text-align: center; margin-top: 8px; padding: 6px; border-radius: var(--r-md); }
    .form-feedback.saving { color: var(--ink-muted); background: var(--cream-warm); }
    .form-feedback.error { color: var(--coral); background: rgba(229,115,115,0.10); }
    .form-feedback.success { color: var(--pine); background: var(--mint-soft); }
    .checkin-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .checkin-grid label { font-size: 12px; font-weight: 600; color: var(--ink-light); display: flex; flex-direction: column; gap: 4px; }
    .checkin-celebration { text-align: center; padding: 8px 0; }
    .checkin-celebration .form-feedback { margin-top: 0; }
    .quick-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
    .quick-action { background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 16px; display: flex; flex-direction: column; align-items: flex-start; gap: 10px; transition: all 0.2s var(--ease-out); text-align: left; cursor: pointer; }
    .quick-action:hover { border-color: var(--pine); transform: translateY(-2px); box-shadow: var(--shadow-md); }
    .qa-icon { width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
    .qa-icon.weigh { background: var(--lake-light); color: var(--lake); }
    .qa-icon.checkin { background: var(--mint-soft); color: var(--pine); }
    .qa-text { display: flex; flex-direction: column; }
    .qa-title { font-size: 14px; font-weight: 600; color: var(--ink); }
    .qa-meta { font-size: 11px; color: var(--ink-muted); margin-top: 2px; }
    .section-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px; }
    .section-title { font-family: var(--display); font-size: 22px; font-weight: 400; letter-spacing: -0.01em; color: var(--ink); }
    .section-title .italic { font-style: italic; color: var(--pine); }
    .section-link { font-size: 12px; font-weight: 600; color: var(--pine); text-transform: uppercase; letter-spacing: 0.12em; cursor: pointer; }
    .section-link:hover { text-decoration: underline; }
    .meals { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
    .meal { background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 16px; display: flex; gap: 16px; align-items: center; position: relative; transition: all 0.2s var(--ease-out); cursor: pointer; width: 100%; text-align: left; }
    .meal:hover { border-color: var(--mint); box-shadow: var(--shadow-md); transform: translateY(-1px); }
    .meal:active { transform: scale(0.99); }
    .meal-thumb { width: 56px; height: 56px; border-radius: var(--r-md); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 28px; }
    .meal-thumb-1 { background: linear-gradient(135deg, #FFF0EB, #FBDDCC); }
    .meal-thumb-2 { background: linear-gradient(135deg, #E8F8F0, #C8EDDA); }
    .meal-thumb-3 { background: linear-gradient(135deg, #E6F3FB, #C2DCF0); }
    .meal-chevron { color: var(--ink-muted); flex-shrink: 0; opacity: 0; transition: opacity 0.2s; }
    .meal:hover .meal-chevron { opacity: 1; }
    .meal-info { flex: 1; min-width: 0; }
    .meal-time { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-muted); margin-bottom: 4px; }
    .meal-name { font-family: var(--display); font-size: 17px; font-weight: 500; color: var(--ink); margin-bottom: 6px; letter-spacing: -0.005em; }
    .meal-macros { display: flex; gap: 12px; font-size: 12px; color: var(--ink-light); }
    .meal-macros span { display: inline-flex; align-items: center; gap: 4px; }
    .meal-macros span::before { content: ''; width: 6px; height: 6px; border-radius: 50%; }
    .meal-macros .kcal::before { background: var(--mint); }
    .meal-macros .prot::before { background: var(--lake); }
    .meal-macros .fat::before { background: var(--coral); }
    .meal.locked::after { content: ''; position: absolute; top: 12px; right: 12px; width: 20px; height: 20px; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230F3D2E'%3E%3Cpath d='M12 1a5 5 0 0 0-5 5v3H6a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3h-1V6a5 5 0 0 0-5-5zm-3 8V6a3 3 0 1 1 6 0v3H9z'/%3E%3C/svg%3E"); background-size: contain; }
    .empty-meals { text-align: center; padding: 24px; color: var(--ink-muted); font-size: 14px; margin-bottom: 32px; }
    .empty-meals a { color: var(--pine); font-weight: 600; text-decoration: underline; }
    .family-card { background: linear-gradient(135deg, var(--cream-warm), var(--mint-soft)); border-radius: var(--r-xl); padding: 20px; position: relative; overflow: hidden; }
    .family-card::after { content: ''; position: absolute; bottom: -40px; right: -20px; width: 140px; height: 140px; background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%235BC096' opacity='0.18'%3E%3Cpath d='M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z'/%3E%3C/svg%3E") no-repeat; background-size: contain; }
    .family-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--pine); margin-bottom: 8px; }
    .family-title { font-family: var(--display); font-size: 20px; font-weight: 400; color: var(--ink); letter-spacing: -0.01em; margin-bottom: 12px; line-height: 1.25; }
    .family-title .italic { font-style: italic; color: var(--pine); }
    .family-status { font-size: 13px; color: var(--ink-soft); line-height: 1.5; margin-bottom: 16px; }
    .family-status strong { color: var(--pine); font-weight: 600; }
    .family-cta { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; background: var(--pine); color: var(--cream); border-radius: var(--r-pill); font-size: 13px; font-weight: 600; position: relative; z-index: 1; transition: transform 0.2s var(--ease-out); }
    .family-cta:hover { transform: translateX(2px); }
    .loading-state { text-align: center; padding: 60px 20px; }
    .loading-state p { font-size: 15px; color: var(--ink-soft); margin-top: 20px; }
    .spinner-lg { width: 40px; height: 40px; border: 3px solid var(--line); border-top-color: var(--pine); border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .dash-header { animation: slideDown 0.5s var(--ease-out); }
    .greeting { animation: slideDown 0.6s var(--ease-out) 0.05s both; }
    .macros-card { animation: slideUp 0.7s var(--ease-out) 0.1s both; }
    .savings-card { animation: slideUp 0.7s var(--ease-out) 0.15s both; }
    .week-cost-card { animation: slideUp 0.7s var(--ease-out) 0.2s both; }
    .quick-actions { animation: slideUp 0.7s var(--ease-out) 0.25s both; }
    .meals-section { animation: slideUp 0.7s var(--ease-out) 0.3s both; }
    .family-card { animation: slideUp 0.7s var(--ease-out) 0.35s both; }
    .bottom-nav { animation: slideUp 0.5s var(--ease-out) 0.4s both; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

    .macros-arrow { color: var(--mint-light); background: rgba(91,192,150,0.12); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: none; cursor: pointer; transition: background 0.2s; }
    .macros-arrow:hover { background: rgba(91,192,150,0.22); }

    /* ── Recipe Drawer ── */
    .drawer-backdrop { position: fixed; inset: 0; background: rgba(15,29,20,0.55); z-index: 150; display: flex; align-items: flex-end; justify-content: center; backdrop-filter: blur(2px); animation: fadeIn 0.2s ease; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .recipe-drawer { background: var(--paper); width: 100%; max-width: 480px; border-radius: 24px 24px 0 0; padding: 12px 24px 36px; max-height: 82vh; overflow-y: auto; position: relative; animation: slideUp 0.35s cubic-bezier(0.16,1,0.3,1); }
    .drawer-handle { width: 40px; height: 4px; background: var(--line); border-radius: 4px; margin: 0 auto 20px; }
    .drawer-close { position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; border-radius: 50%; background: var(--cream-warm); border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--ink-muted); }
    .drawer-type-badge { display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; background: var(--mint-soft); color: var(--pine); padding: 4px 10px; border-radius: var(--r-pill); margin-bottom: 10px; }
    .drawer-name { font-family: var(--display); font-size: 24px; font-weight: 500; color: var(--ink); letter-spacing: -0.01em; line-height: 1.2; margin-bottom: 16px; }
    .drawer-chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
    .dchip { font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: var(--r-pill); }
    .dchip-kcal { background: var(--mint-soft); color: var(--pine); }
    .dchip-fat { background: rgba(232,134,107,0.12); color: #b05030; }
    .dchip-prot { background: rgba(91,163,208,0.12); color: #2a6a96; }
    .dchip-carb { background: rgba(255,193,7,0.12); color: #8a6200; }
    .drawer-meta { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid var(--line); }
    .drawer-meta-item { display: flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; color: var(--ink-muted); }
    .drawer-section { margin-bottom: 20px; }
    .drawer-section-title { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-muted); margin-bottom: 12px; }
    .drawer-ingredients { display: flex; flex-direction: column; gap: 6px; }
    .drawer-ing { display: flex; align-items: center; gap: 10px; padding: 8px 12px; background: var(--cream); border-radius: var(--r-md); font-size: 13px; }
    .ing-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--mint); flex-shrink: 0; }
    .ing-name { flex: 1; color: var(--ink); font-weight: 500; }
    .ing-qty { color: var(--ink-muted); font-size: 12px; white-space: nowrap; }
    .drawer-instructions { font-size: 14px; color: var(--ink-soft); line-height: 1.7; white-space: pre-wrap; }

    /* ── Check-in Celebration ── */
    .celebration-overlay { position: fixed; inset: 0; background: rgba(10,42,32,0.88); z-index: 200; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); animation: fadeIn 0.3s ease; cursor: pointer; }
    .celebration-content { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px 24px; text-align: center; position: relative; }
    .celebration-ring { position: absolute; width: 280px; height: 280px; border-radius: 50%; border: 2px solid rgba(91,192,150,0.25); animation: pulseRing 2s ease-in-out infinite; }
    @keyframes pulseRing { 0%,100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(1.08); opacity: 0.15; } }
    .celebration-lottie { position: relative; z-index: 1; }
    .celebration-title { font-family: var(--display); font-size: 38px; font-weight: 400; color: var(--cream); letter-spacing: -0.02em; margin: 0; line-height: 1; }
    .celebration-sub { font-size: 15px; color: rgba(248,244,236,0.7); margin: 0; line-height: 1.6; }
    .celebration-chips { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 4px; }
    .cel-chip { font-size: 13px; font-weight: 600; padding: 6px 14px; background: rgba(91,192,150,0.15); border: 1px solid rgba(91,192,150,0.3); border-radius: var(--r-pill); color: var(--mint-light); }
    .celebration-hint { font-size: 12px; color: rgba(248,244,236,0.35); margin-top: 8px; letter-spacing: 0.06em; }
  `]
})
export class DashboardPage implements OnInit {
  private readonly auth = inject(AuthService);
  readonly router = inject(Router);
  private readonly planService = inject(PlanService);
  private readonly api = inject(ApiService);

  readonly user = this.auth.state;
  readonly plan = signal<PlanGenerationResult | null>(null);
  readonly loading = signal(true);
  readonly lastWeight = signal('---');
  readonly savingsAmount = signal(0);

  readonly selectedMeal = signal<MealPlanDto | null>(null);
  readonly showCelebration = signal(false);
  readonly showWeightForm = signal(false);
  readonly showCheckInForm = signal(false);
  readonly weightSaving = signal(false);
  readonly weightDone = signal(false);
  readonly weightError = signal<string | null>(null);
  readonly checkInSaving = signal(false);
  readonly checkInDone = signal(false);
  readonly checkInError = signal<string | null>(null);

  readonly macros = computed(() => this.plan()?.macros ?? {
    dailyCalories: 0, fatGrams: 0, proteinGrams: 0, carbsGrams: 0,
    bmrKcal: 0, tdeeKcal: 0, carbsPercent: 0, proteinPercent: 0, fatPercent: 0,
  });

  readonly todayMeals = computed<MealPlanDto[]>(() => {
    const p = this.plan();
    if (!p?.days?.length) return [];
    const today = new Date().getDay();
    const dayIndex = today === 0 ? 6 : today - 1;
    return p.days[dayIndex]?.meals ?? [];
  });

  readonly todayCalories = computed(() =>
    this.todayMeals().reduce((sum, m) => sum + m.recipe.calories, 0)
  );
  readonly todayFatGr = computed(() =>
    Math.round(this.todayMeals().reduce((s, m) => s + m.recipe.fatGr, 0))
  );
  readonly todayProteinGr = computed(() =>
    Math.round(this.todayMeals().reduce((s, m) => s + m.recipe.proteinGr, 0))
  );
  readonly todayCarbsGr = computed(() =>
    Math.round(this.todayMeals().reduce((s, m) => s + m.recipe.carbsGr, 0))
  );

  readonly fatPercent = computed(() => {
    const m = this.macros();
    return m.fatGrams > 0 ? Math.min(100, Math.round((this.todayFatGr() / m.fatGrams) * 100)) : 0;
  });
  readonly proteinPercent = computed(() => {
    const m = this.macros();
    return m.proteinGrams > 0 ? Math.min(100, Math.round((this.todayProteinGr() / m.proteinGrams) * 100)) : 0;
  });
  readonly carbsPercent = computed(() => {
    const m = this.macros();
    return m.carbsGrams > 0 ? Math.min(100, Math.round((this.todayCarbsGr() / m.carbsGrams) * 100)) : 0;
  });

  readonly calPercent = computed(() => {
    const m = this.macros();
    return m.dailyCalories > 0 ? Math.round((this.todayCalories() / m.dailyCalories) * 100) : 0;
  });

  readonly savingsPercent = computed(() => {
    const p = this.plan();
    if (!p?.savingsVsGourmetPercent) return 0;
    return p.savingsVsGourmetPercent;
  });

  ngOnInit() {
    this.loadPlan();
  }

  private loadPlan() {
    this.planService.getCurrent().subscribe({
      next: (data) => {
        this.plan.set(data);
        this.savingsAmount.set(data.savingsVsGourmetMxn ?? 0);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  get firstName() {
    return () => this.user().user?.fullName?.split(' ')[0] || 'Usuario';
  }

  get initials() {
    return () => {
      const name = this.user().user?.fullName || 'U';
      return name.split(' ').map((s: string) => s[0]).join('').slice(0, 2).toUpperCase();
    };
  }

  get timeGreeting() {
    return () => {
      const hour = new Date().getHours();
      if (hour < 12) return 'Buenos días';
      if (hour < 18) return 'Buenas tardes';
      return 'Buenas noches';
    };
  }

  get motivational() {
    return () => {
      const phrases = ['vamos por hoy.', 'sigue así.', 'un día a la vez.', 'tú puedes.'];
      return phrases[new Date().getDate() % phrases.length];
    };
  }

  get todayDate() {
    return () => {
      const now = new Date();
      const opts: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
      return now.toLocaleDateString('es-MX', opts);
    };
  }

  getMealLabel(type: string): string {
    const map: Record<string, string> = {
      breakfast: 'Desayuno', lunch: 'Comida', dinner: 'Cena', snack: 'Snack',
    };
    return map[type] || type;
  }

  getMealColor(type: string): number {
    const map: Record<string, number> = { breakfast: 1, lunch: 2, dinner: 3, snack: 2 };
    return map[type] || 1;
  }

  mealEmoji(type: string): string {
    const map: Record<string, string> = { breakfast: '🥑', lunch: '🥗', dinner: '🍽️', snack: '🫐' };
    return map[type] || '🍴';
  }

  shareSavings() {
    const p = this.plan();
    if (!p) return;
    const text = `✨ Llevo ahorrado $${p.savingsVsGourmetMxn ?? 0} MXN con NutriCasa vs modo Internacional. ¡${p.savingsVsGourmetPercent ?? 0}% de ahorro!`;
    if (navigator.share) {
      navigator.share({ title: 'Mi ahorro en NutriCasa', text });
    } else {
      navigator.clipboard.writeText(text);
    }
  }

  submitWeight(weightKg: number) {
    if (!weightKg || weightKg <= 0) return;
    this.weightSaving.set(true);
    this.weightError.set(null);
    this.weightDone.set(false);

    this.api.post<{ id: string }>('/measurements', { weightKg }).subscribe({
      next: () => {
        this.weightSaving.set(false);
        this.weightDone.set(true);
        this.lastWeight.set(String(weightKg));
        setTimeout(() => this.showWeightForm.set(false), 1500);
      },
      error: (err) => {
        this.weightSaving.set(false);
        this.weightError.set(err?.error?.message || 'Error al guardar');
      }
    });
  }

  submitCheckIn(energy?: number, mood?: number, water?: number, notes?: string) {
    this.checkInSaving.set(true);
    this.checkInError.set(null);
    this.checkInDone.set(false);

    this.api.post<{ id: string }>('/checkins', {
      energyLevel: energy || undefined,
      moodLevel: mood || undefined,
      waterLiters: water || undefined,
      notes: notes || undefined
    }).subscribe({
      next: () => {
        this.checkInSaving.set(false);
        this.checkInDone.set(true);
        this.showCheckInForm.set(false);
        this.showCelebration.set(true);
        setTimeout(() => this.showCelebration.set(false), 3000);
      },
      error: (err) => {
        this.checkInSaving.set(false);
        this.checkInError.set(err?.error?.message || 'Error al guardar');
      }
    });
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login']),
    });
  }
}
