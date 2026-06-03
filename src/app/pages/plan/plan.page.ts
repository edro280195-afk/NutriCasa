import { Component, inject, signal, computed, OnDestroy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PlanService } from '../../services/plan.service';
import { RecipeService } from '../../services/recipe.service';
import { PlanGenerationHubService } from '../../services/plan-generation-hub.service';
import { LottieAnimationComponent } from '../../components/lottie-animation/lottie-animation.component';
import { NcToastService } from '../../shared/components/nc-toast.service';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import type { PlanGenerationResult, DayPlanDto, MealPlanDto, MealLogStatus } from '../../models/plan.models';
import type { FavoriteRecipeDto } from '../../models/recipe.models';

@Component({
  selector: 'app-plan',
  standalone: true,
  imports: [LottieAnimationComponent, DragDropModule, DecimalPipe],
  template: `
  <div class="dash">
    <header class="dash-header">
      <div class="dash-brand">
        <img src="icons/logonutricasa.jpeg" alt="NutriCasa" class="brand-logo">
        <span class="brand-name">NutriCasa</span>
      </div>
      <button class="icon-btn" (click)="generatePlan(true)" [disabled]="generating()" title="Regenerar plan con IA">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
        </svg>
        <span class="icon-btn-label">Regenerar</span>
      </button>
    </header>

    <section class="greeting">
      <span class="greeting-eyebrow">Tu plan semanal</span>
      <h1 class="greeting-title">{{ weekRange() }}</h1>
      @if (plan(); as p) {
        <span class="greeting-mode">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          {{ p.budgetModeName }}
        </span>
      }
    </section>

    @if (generating()) {
      <div class="loading-state">
        <div class="loading-animation">
          <app-lottie src="/lottie/cooking.json" width="160px" height="160px"></app-lottie>
        </div>
        <h2 class="loading-title">
          @if (hubProgress.currentEmoji()) {
            {{ hubProgress.currentEmoji() }}
          }
          {{ hubProgress.currentMessage() || 'Creando tu plan...' }}
        </h2>
        <div class="progress-bar-container">
          <div class="progress-bar" [style.width.%]="hubProgress.progress()"></div>
        </div>
        <p class="loading-sub">{{ hubProgress.progressLabel() }} ({{ hubProgress.progress() }}%)</p>
        <div class="loading-dots">
          <span class="dot"></span><span class="dot"></span><span class="dot"></span>
        </div>
      </div>
    } @else if (showSuccess()) {
      <div class="loading-state success-state">
        <app-lottie src="/lottie/success.json" width="120px" height="120px" [loop]="false"></app-lottie>
        <h2 class="loading-title">¡Listo!</h2>
        <p class="loading-sub">Tu plan semanal está servido</p>
      </div>
    } @else if (plan(); as p) {
      @if (p.estimatedCostMxn) {
        <div class="savings-card">
          <div class="savings-main">
            <span class="savings-label">Costo estimado semanal</span>
            <span class="savings-amount">$ {{ p.estimatedCostMxn | number:'1.0-0' }} <small>MXN</small></span>
          </div>
          <span class="savings-badge">{{ p.budgetModeName }}</span>
          @if (p.savingsVsGourmetMxn && p.savingsVsGourmetMxn > 0) {
            <div class="savings-save">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              Ahorras <strong>$ {{ p.savingsVsGourmetMxn | number:'1.0-0' }} MXN</strong> vs Internacional
              <span class="savings-pct">{{ p.savingsVsGourmetPercent | number:'1.0-0' }}%</span>
            </div>
          }
        </div>
      }

      <div cdkDropListGroup class="plan-editor" [class.is-dragging]="dragging()">
      @if (dragging()) {
        <div class="drag-hint">Arrastra a otro día para mover la comida</div>
      }

      <nav class="day-tabs">
        @for (day of p.days; track day.dayNumber; let i = $index) {
          <button class="day-tab" cdkDropList [cdkDropListData]="day"
            (cdkDropListDropped)="onDropToDay($event, p.planId, day)"
            [class.active]="selectedDay() === i"
            [class.drop-target]="dragging() && selectedDay() !== i"
            (click)="selectDay(i)">
            <span class="day-name">{{ getDayName(day.dayNumber) }}</span>
            <span class="day-kcal">{{ day.dayTotals.calories }}</span>
            <span class="day-unit">kcal</span>
          </button>
        }
      </nav>

      @if (selectedDayPlan(); as day) {
        <div class="day-macros">
          <div class="dm-item"><span class="dm-label">Proteína</span><span class="dm-value">{{ day.dayTotals.proteinGr | number:'1.0-0' }}<small>g</small></span></div>
          <div class="dm-item"><span class="dm-label">Grasa</span><span class="dm-value">{{ day.dayTotals.fatGr | number:'1.0-0' }}<small>g</small></span></div>
          <div class="dm-item"><span class="dm-label">Carbs</span><span class="dm-value">{{ day.dayTotals.carbsGr | number:'1.0-0' }}<small>g</small></span></div>
          <div class="dm-item"><span class="dm-label">Calorías</span><span class="dm-value">{{ day.dayTotals.calories }}<small>kcal</small></span></div>
        </div>

        <div class="meals"
          cdkDropList
          [cdkDropListData]="day.meals"
          (cdkDropListDropped)="onMealDropped($event, p.planId, day)"
          [cdkDropListSortingDisabled]="true">
          @for (meal of day.meals; track meal.planMealId; let i = $index) {
            <div class="meal" cdkDrag [cdkDragData]="meal" [class.meal-locked]="meal.isLocked"
              (cdkDragStarted)="dragging.set(true)" (cdkDragEnded)="dragging.set(false)">
              <div class="meal-drag" cdkDragHandle>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>
              </div>

              <div class="meal-card" (click)="selectMeal(meal)" [class]="'meal-card-' + getMealColor(meal.mealType)">
                <div class="meal-type-badge">{{ getMealLabel(meal.mealType) }}</div>
                <h3 class="meal-name">{{ meal.recipe.name }}</h3>
                <div class="meal-stats">
                  <span class="mstat kcal">{{ meal.recipe.calories }} kcal</span>
                  <span class="mstat prot">P {{ meal.recipe.proteinGr | number:'1.0-0' }}g</span>
                  <span class="mstat fat">G {{ meal.recipe.fatGr | number:'1.0-0' }}g</span>
                  <span class="mstat carbs">C {{ meal.recipe.carbsGr | number:'1.0-0' }}g</span>
                </div>
              </div>

              <div class="meal-actions">
                <button class="fav-btn" [class.faved]="isFavorite(meal.recipe.recipeId)"
                  (click)="$event.stopPropagation(); toggleFavorite(meal.recipe.recipeId)" title="Favorita">
                  <svg width="15" height="15" viewBox="0 0 24 24"
                    [attr.fill]="isFavorite(meal.recipe.recipeId) ? 'var(--coral)' : 'none'"
                    stroke="var(--coral)" stroke-width="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
                <button class="lock-btn" [class.locked]="meal.isLocked"
                  (click)="$event.stopPropagation(); toggleLock(p.planId, meal)" [title]="meal.isLocked ? 'Desbloquear' : 'Bloquear'">
                  @if (meal.isLocked) {
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  } @else {
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  }
                </button>
                @if (mealLogStatuses()[meal.planMealId]; as status) {
                  <span class="status-badge" [class]="'status-' + status">{{ getStatusLabel(status) }}</span>
                }
              </div>
            </div>
          }
        </div>

        @if (p.shoppingList?.byStore?.length) {
          @let sl = p.shoppingList!;
          <details class="shopping-section" [open]="shoppingOpen()">
            <summary class="shopping-header" (click)="$event.preventDefault(); shoppingOpen.update(v => !v)">
              <div class="shopping-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </div>
              <div class="shopping-text">
                <span class="shopping-title">Lista de compras</span>
                <span class="shopping-total">$ {{ sl.totalEstimatedMxn | number:'1.0-0' }} MXN</span>
              </div>
              <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </summary>
            <div class="shopping-body">
              @for (store of sl.byStore; track store.storeCode) {
                <div class="store-group">
                  <div class="store-header">
                    <span class="store-name">{{ store.storeName }}</span>
                    <span class="store-total">$ {{ store.subtotalMxn | number:'1.0-2' }}</span>
                  </div>
                  @for (item of store.items; track item.ingredientName) {
                    <label class="store-item">
                      <input type="checkbox" [checked]="isChecked(store.storeCode, item.ingredientName)" (change)="toggleItem(store.storeCode, item.ingredientName)">
                      <span class="store-item-dot"></span>
                      <span class="store-item-name" [class.checked]="isChecked(store.storeCode, item.ingredientName)">{{ item.ingredientName }}</span>
                      <span class="store-item-qty">{{ item.totalAmount }} {{ item.unit }}</span>
                      <span class="store-item-cost">$ {{ item.estimatedCostMxn | number:'1.0-2' }}</span>
                    </label>
                  }
                </div>
              }
            </div>
          </details>
        }

        @if (favoritedInPlan().length > 0) {
          <div class="favs-card">
            <button class="favs-header" (click)="showFavorites.update(v => !v)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--coral)" stroke="var(--coral)" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span>Favoritas de la semana</span>
              <span class="favs-count">{{ favoritedInPlan().length }}</span>
              <svg class="chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" [style.transform]="showFavorites() ? 'rotate(180deg)' : ''"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            @if (showFavorites()) {
              <div class="favs-list">
                @for (fav of favoritedInPlan(); track fav.recipeId) {
                  <span class="fav-chip">{{ fav.name }} <small>{{ fav.calories }} kcal</small></span>
                }
              </div>
            }
          </div>
        }
      }
      </div>
    } @else {
      <div class="empty-state">
        <div class="empty-illustration">
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <rect x="14" y="18" width="52" height="48" rx="6" stroke="var(--mint)" stroke-width="2"/>
            <line x1="46" y1="12" x2="46" y2="18" stroke="var(--mint)" stroke-width="2" stroke-linecap="round"/>
            <line x1="30" y1="12" x2="30" y2="18" stroke="var(--mint)" stroke-width="2" stroke-linecap="round"/>
            <line x1="18" y1="30" x2="62" y2="30" stroke="var(--ink-muted)" stroke-width="1" opacity="0.4"/>
            <line x1="18" y1="38" x2="54" y2="38" stroke="var(--ink-muted)" stroke-width="1" opacity="0.3"/>
            <line x1="18" y1="46" x2="48" y2="46" stroke="var(--ink-muted)" stroke-width="1" opacity="0.25"/>
            <line x1="18" y1="54" x2="58" y2="54" stroke="var(--ink-muted)" stroke-width="1" opacity="0.2"/>
          </svg>
        </div>
        <h2>Sin plan esta semana</h2>
        <p>Nuestra IA creará un plan keto personalizado con tus metas, presupuesto y preferencias</p>
        <button class="btn-primary btn-generate" (click)="generatePlan(false)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          Generar mi plan
        </button>
      </div>
    }
  </div>

  @if (selectedMeal(); as meal) {
    <div class="drawer-overlay" (click)="closeDrawer()"></div>
    <div class="meal-drawer">
      <div class="drawer-hero" [class]="'hero-' + meal.mealType">
        <div class="drawer-handle"></div>
        <div class="drawer-hero-top">
          <button class="dhero-fav" [class.faved]="isFavorite(meal.recipe.recipeId)" (click)="toggleFavorite(meal.recipe.recipeId)">
            <svg width="18" height="18" viewBox="0 0 24 24" [attr.fill]="isFavorite(meal.recipe.recipeId) ? 'var(--coral)' : 'none'" stroke="var(--coral)" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          <button class="dhero-close" (click)="closeDrawer()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="dhero-emoji">{{ mealEmoji(meal.mealType) }}</div>
        <span class="dhero-type">{{ getMealLabel(meal.mealType) }}</span>
        <h3 class="dhero-name">{{ meal.recipe.name }}</h3>
      </div>

      <div class="drawer-body">
        <div class="drawer-macros">
          <div class="dm-row"><span>Calorías</span><strong>{{ meal.recipe.calories }} kcal</strong></div>
          <div class="dm-row"><span>Proteína</span><strong>{{ meal.recipe.proteinGr | number:'1.0-1' }}g</strong></div>
          <div class="dm-row"><span>Grasa</span><strong>{{ meal.recipe.fatGr | number:'1.0-1' }}g</strong></div>
          <div class="dm-row"><span>Carbs</span><strong>{{ meal.recipe.carbsGr | number:'1.0-1' }}g</strong></div>
          <div class="dm-row"><span>Preparación</span><strong>{{ meal.recipe.prepTimeMin + meal.recipe.cookTimeMin }} min</strong></div>
          <div class="dm-row"><span>Costo</span><strong>$ {{ meal.recipe.estimatedCostMxn | number:'1.0-2' }} MXN</strong></div>
        </div>

        @if (meal.recipe.ingredients.length) {
          <div class="drawer-block">
            <h4 class="dblock-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7"/></svg>
              Ingredientes
            </h4>
            <ul class="ingredients">
              @for (ing of meal.recipe.ingredients; track ing.name) {
                <li class="ingredient">
                  <span class="ing-dot"></span>
                  <span class="ing-name">{{ ing.name }}</span>
                  @if (ing.amount > 0) {
                    <span class="ing-amount">{{ ing.amount }} {{ ing.unit }}</span>
                  }
                </li>
              }
            </ul>
          </div>
        }

        @if (meal.recipe.instructions.trim()) {
          <div class="drawer-block">
            <h4 class="dblock-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              Preparación
            </h4>
            <p class="dblock-instructions">{{ meal.recipe.instructions }}</p>
          </div>
        }

        <div class="drawer-section">
          <label class="dsection-label">Porción</label>
          <div class="portion-row">
            <input type="range" min="0.25" max="3" step="0.25" [value]="portionValue()" (input)="onPortionChange($event)" class="portion-slider">
            <span class="portion-value">{{ portionValue() }}x</span>
          </div>
          <div class="portion-stats">
            <span>{{ (meal.recipe.calories * portionValue()) | number:'1.0-0' }} kcal</span>
            <span>{{ (meal.recipe.proteinGr * portionValue()) | number:'1.0-0' }}g P</span>
            <span>{{ (meal.recipe.fatGr * portionValue()) | number:'1.0-0' }}g G</span>
          </div>
        </div>

        <div class="drawer-section">
          <label class="dsection-label">Registrar comida</label>
          <div class="log-btns">
            @for (opt of logOptions; track opt.value) {
              <button class="log-btn" [class.active]="selectedLogStatus() === opt.value" (click)="logMeal(opt.value, plan()!.planId, meal)">
                {{ opt.label }}
              </button>
            }
          </div>
        </div>

        <div class="drawer-actions">
          <button class="btn-swap" (click)="swapMeal(plan()!.planId, meal)" [disabled]="swapping() || meal.isLocked">
            @if (swapping()) {
              <span class="spinner"></span> Buscando...
            } @else {
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
              Generar otra receta
            }
          </button>
          <button class="btn-lock" (click)="toggleLock(plan()!.planId, meal)" [title]="meal.isLocked ? 'Desbloquear' : 'Bloquear'">
            @if (meal.isLocked) {
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            } @else {
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            }
          </button>
        </div>
        @if (meal.isLocked) {
          <p class="drawer-hint">Desbloquea la comida para cambiarla por otra receta</p>
        }
      </div>
    </div>
  }
  `,
  styles: [`
    :host { display: contents; }

    /* ========= LAYOUT ========= */
    .dash {
      max-width: 480px;
      margin: 0 auto;
      padding: 0 16px 140px;
      background: var(--cream);
    }

    /* ========= HEADER ========= */
    .dash-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 0 16px;
    }
    .dash-brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .brand-logo {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      object-fit: cover;
    }
    .brand-name {
      font-family: var(--display);
      font-size: 20px;
      font-weight: 600;
      color: var(--pine);
      letter-spacing: -0.01em;
    }
    .icon-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: var(--r-pill);
      color: var(--ink-soft);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .icon-btn:hover:not(:disabled) {
      border-color: var(--mint);
      color: var(--pine);
      box-shadow: 0 2px 8px rgba(91,192,150,0.15);
    }
    .icon-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .icon-btn-label { line-height: 1; }
    @media (max-width: 380px) {
      .icon-btn-label { display: none; }
      .icon-btn { padding: 8px 10px; }
    }

    /* ========= GREETING ========= */
    .greeting { margin-bottom: 20px; }
    .greeting-eyebrow {
      display: block;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--mint);
      margin-bottom: 4px;
    }
    .greeting-title {
      font-family: var(--display);
      font-size: 26px;
      font-weight: 500;
      line-height: 1.2;
      letter-spacing: -0.02em;
      color: var(--ink);
      margin: 0 0 8px;
    }
    .greeting-mode {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      background: var(--mint-soft);
      border-radius: var(--r-pill);
      font-size: 11px;
      font-weight: 600;
      color: var(--pine);
    }

    /* ========= LOADING / SUCCESS ========= */
    .loading-state {
      text-align: center;
      padding: 48px 20px;
    }
    .loading-animation {
      margin-bottom: 8px;
    }
    .loading-title {
      font-family: var(--display);
      font-size: 20px;
      font-weight: 500;
      color: var(--ink);
      margin: 0 0 6px;
    }
    .loading-sub {
      font-size: 14px;
      color: var(--ink-light);
      margin: 0 0 20px;
      line-height: 1.5;
    }
    .progress-bar-container {
      width: 100%;
      max-width: 240px;
      height: 8px;
      background: var(--line);
      border-radius: var(--r-pill);
      margin: 16px auto 10px;
      overflow: hidden;
    }
    .progress-bar {
      height: 100%;
      background: var(--mint);
      border-radius: var(--r-pill);
      transition: width 0.3s ease;
    }
    .loading-dots {
      display: flex;
      justify-content: center;
      gap: 6px;
    }
    .loading-dots .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--mint);
      animation: dotPulse 1.4s infinite ease-in-out both;
    }
    .loading-dots .dot:nth-child(1) { animation-delay: 0s; }
    .loading-dots .dot:nth-child(2) { animation-delay: 0.2s; }
    .loading-dots .dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes dotPulse {
      0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
      40% { transform: scale(1); opacity: 1; }
    }
    .success-state { padding: 32px 20px; }

    /* ========= SAVINGS CARD ========= */
    .savings-card {
      background: linear-gradient(135deg, #0F3D2E, #1B5E3C);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 20px;
      position: relative;
      overflow: hidden;
    }
    .savings-card::before {
      content: '';
      position: absolute;
      top: -40px;
      right: -40px;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: rgba(255,255,255,0.04);
    }
    .savings-main {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-bottom: 12px;
      position: relative;
      z-index: 1;
    }
    .savings-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: rgba(248,244,236,0.55);
    }
    .savings-amount {
      font-family: var(--display);
      font-size: 34px;
      font-weight: 500;
      color: #F8F4EC;
      line-height: 1;
    }
    .savings-amount small { font-size: 15px; font-weight: 400; opacity: 0.7; }
    .savings-badge {
      display: inline-block;
      padding: 4px 12px;
      background: rgba(255,255,255,0.12);
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: var(--r-pill);
      font-size: 11px;
      font-weight: 600;
      color: rgba(248,244,236,0.9);
      position: relative;
      z-index: 1;
    }
    .savings-save {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid rgba(255,255,255,0.12);
      font-size: 12px;
      color: rgba(248,244,236,0.75);
      position: relative;
      z-index: 1;
    }
    .savings-save svg { color: #5BC096; flex-shrink: 0; }
    .savings-save strong { color: #E8F5E9; font-weight: 700; }
    .savings-pct {
      margin-left: 2px;
      padding: 2px 7px;
      background: rgba(91,192,150,0.25);
      border-radius: var(--r-pill);
      font-size: 10px;
      font-weight: 700;
      color: #A5D6A7;
    }

    /* ========= PLAN EDITOR ========= */
    .plan-editor { position: relative; }
    .plan-editor.is-dragging .day-tab:not(.active):not(.drop-target) { opacity: 0.6; }

    .drag-hint {
      position: sticky;
      top: 8px;
      z-index: 30;
      margin: 0 auto 12px;
      width: fit-content;
      padding: 10px 20px;
      background: var(--pine);
      color: var(--cream);
      border-radius: var(--r-pill);
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 4px 16px rgba(15,61,46,0.25);
      animation: fadeIn 0.2s ease;
    }

    /* ========= DAY TABS ========= */
    .day-tabs {
      display: flex;
      gap: 6px;
      overflow-x: auto;
      padding-bottom: 12px;
      margin-bottom: 14px;
      scrollbar-width: none;
    }
    .day-tabs::-webkit-scrollbar { display: none; }
    .day-tab {
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 10px 16px;
      border: 1.5px solid var(--line);
      border-radius: 14px;
      background: var(--paper);
      cursor: pointer;
      transition: all 0.2s;
      user-select: none;
      font-family: inherit;
    }
    .day-tab.active {
      border-color: var(--pine);
      background: var(--pine);
    }
    .day-tab.drop-target {
      border-color: var(--mint);
      border-style: dashed;
      background: var(--mint-soft);
      transform: scale(1.05);
    }
    .day-name {
      font-size: 12px;
      font-weight: 700;
      color: var(--ink);
      transition: color 0.2s;
    }
    .day-tab.active .day-name { color: var(--cream); }
    .day-kcal {
      font-size: 18px;
      font-weight: 600;
      color: var(--ink-soft);
      margin-top: 2px;
      line-height: 1;
      transition: color 0.2s;
    }
    .day-tab.active .day-kcal { color: rgba(248,244,236,0.9); }
    .day-unit {
      font-size: 10px;
      color: var(--ink-muted);
      transition: color 0.2s;
    }
    .day-tab.active .day-unit { color: rgba(248,244,236,0.5); }

    /* ========= DAY MACROS ========= */
    .day-macros {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 16px;
    }
    .dm-item {
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: 12px;
      padding: 12px 8px;
      text-align: center;
    }
    .dm-label {
      display: block;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--ink-muted);
    }
    .dm-value {
      display: block;
      font-family: var(--display);
      font-size: 22px;
      font-weight: 500;
      color: var(--ink);
      margin-top: 4px;
      line-height: 1;
    }
    .dm-value small {
      font-size: 12px;
      font-weight: 400;
      color: var(--ink-muted);
      margin-left: 2px;
    }

    /* ========= MEALS ========= */
    .meals {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-height: 60px;
    }
    .meal {
      display: flex;
      align-items: center;
      gap: 0;
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: 14px;
      overflow: hidden;
      transition: box-shadow 0.2s, border-color 0.2s;
    }
    .meal:hover { box-shadow: 0 2px 12px rgba(0,0,0,0.06); }
    .meal.cdk-drag-preview {
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
      border-color: var(--mint);
      border-radius: 14px;
    }
    .meal.cdk-drag-placeholder { opacity: 0; }
    .meal.meal-locked { opacity: 0.7; }

    .meal-drag {
      padding: 16px 10px;
      cursor: grab;
      color: var(--ink-muted);
      flex-shrink: 0;
      align-self: stretch;
      display: flex;
      align-items: center;
    }
    .meal-drag:active { cursor: grabbing; }

    .meal-card {
      flex: 1;
      min-width: 0;
      padding: 14px 0 14px 4px;
      cursor: pointer;
    }
    .meal-type-badge {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: var(--r-pill);
      margin-bottom: 6px;
    }
    .meal-card-1 .meal-type-badge { background: #FFF0E8; color: #D4734A; }
    .meal-card-2 .meal-type-badge { background: #E8F5EF; color: #2F7A5C; }
    .meal-card-3 .meal-type-badge { background: #E8F0FA; color: #3B6FA0; }
    .meal-name {
      font-family: var(--display);
      font-size: 14px;
      font-weight: 500;
      color: var(--ink);
      margin: 0 0 8px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .meal-stats {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .mstat {
      font-size: 11px;
      font-weight: 600;
      color: var(--ink-light);
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .mstat::before {
      content: '';
      width: 5px;
      height: 5px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .mstat.kcal::before { background: var(--mint); }
    .mstat.prot::before { background: #5BA3D0; }
    .mstat.fat::before { background: var(--coral); }
    .mstat.carbs::before { background: #E8A838; }

    .meal-actions {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 8px 12px;
      flex-shrink: 0;
    }
    .fav-btn, .lock-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      color: var(--ink-muted);
      transition: transform 0.15s, color 0.15s;
    }
    .fav-btn:hover { transform: scale(1.15); }
    .lock-btn.locked { color: var(--coral); }

    .status-badge {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 3px 7px;
      border-radius: var(--r-pill);
      white-space: nowrap;
    }
    .status-completed { background: var(--mint-soft); color: var(--pine); }
    .status-partial { background: #FFF3E0; color: #E65100; }
    .status-skipped { background: #FFECEC; color: var(--coral); }
    .status-substituted { background: #E3F2FD; color: #1565C0; }

    /* ========= SHOPPING ========= */
    .shopping-section {
      margin-top: 20px;
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: 14px;
      overflow: hidden;
    }
    .shopping-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      cursor: pointer;
      user-select: none;
      list-style: none;
    }
    .shopping-header::-webkit-details-marker { display: none; }
    .shopping-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: var(--mint-soft);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--pine);
      flex-shrink: 0;
    }
    .shopping-text { flex: 1; min-width: 0; }
    .shopping-title { display: block; font-size: 14px; font-weight: 700; color: var(--ink); }
    .shopping-total {
      font-family: var(--display);
      font-size: 18px;
      font-weight: 500;
      color: var(--pine);
    }
    .chevron {
      transition: transform 0.25s ease;
      color: var(--ink-muted);
      flex-shrink: 0;
    }
    .shopping-section[open] .chevron { transform: rotate(180deg); }
    .shopping-body { padding: 0 16px 16px; border-top: 1px solid var(--line); }
    .store-group { margin-top: 14px; }
    .store-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--line);
    }
    .store-name {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--ink-soft);
    }
    .store-total { font-size: 13px; font-weight: 600; color: var(--pine); }
    .store-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 12px;
      cursor: pointer;
      border-radius: 10px;
      transition: background 0.15s;
    }
    .store-item:hover { background: var(--cream); }
    .store-item input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: var(--pine);
      flex-shrink: 0;
      cursor: pointer;
    }
    .store-item-dot { display: none; }
    .store-item-name {
      flex: 1;
      font-size: 13px;
      font-weight: 500;
      color: var(--ink);
      transition: color 0.15s;
    }
    .store-item-name.checked {
      text-decoration: line-through;
      color: var(--ink-muted);
    }
    .store-item-qty {
      font-size: 12px;
      color: var(--ink-light);
      white-space: nowrap;
    }
    .store-item-cost {
      font-size: 12px;
      font-weight: 600;
      color: var(--ink-soft);
      white-space: nowrap;
    }

    /* ========= FAVS ========= */
    .favs-card {
      margin-top: 16px;
      background: var(--paper);
      border: 1px solid var(--line);
      border-radius: 14px;
      overflow: hidden;
    }
    .favs-header {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 14px 16px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 13px;
      font-weight: 700;
      color: var(--ink);
      font-family: inherit;
    }
    .favs-count {
      margin-left: auto;
      margin-right: 4px;
      background: var(--coral-bg);
      color: var(--coral);
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: var(--r-pill);
    }
    .favs-header .chevron { flex-shrink: 0; }
    .favs-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 0 16px 14px;
      border-top: 1px solid var(--line);
      padding-top: 12px;
    }
    .fav-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 12px;
      background: var(--cream);
      border: 1px solid var(--line);
      border-radius: var(--r-pill);
      font-size: 12px;
      font-weight: 600;
      color: var(--ink);
    }
    .fav-chip small { font-weight: 400; color: var(--ink-muted); }

    /* ========= EMPTY STATE ========= */
    .empty-state {
      text-align: center;
      padding: 40px 20px;
    }
    .empty-illustration { margin-bottom: 20px; opacity: 0.7; }
    .empty-state h2 {
      font-family: var(--display);
      font-size: 22px;
      font-weight: 500;
      color: var(--ink);
      margin: 0 0 8px;
    }
    .empty-state p {
      font-size: 14px;
      color: var(--ink-light);
      line-height: 1.5;
      margin: 0 0 24px;
      max-width: 320px;
      margin-left: auto;
      margin-right: auto;
    }
    .btn-generate {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 14px 32px;
      border: none;
      border-radius: var(--r-pill);
      background: var(--pine);
      color: var(--cream);
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      box-shadow: 0 4px 16px rgba(15,61,46,0.3);
    }
    .btn-generate:hover { background: #1B5E3C; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(15,61,46,0.35); }
    .btn-generate:active { transform: translateY(0); }

    /* ========= DRAWER ========= */
    .drawer-overlay {
      position: fixed;
      inset: 0;
      background: rgba(10,30,20,0.5);
      z-index: 150;
      animation: fadeIn 0.25s ease;
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
    }
    .meal-drawer {
      position: fixed;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      max-width: 480px;
      max-height: 88vh;
      background: var(--paper);
      border-radius: 24px 24px 0 0;
      z-index: 151;
      overflow-y: auto;
      animation: sheetUp 0.4s cubic-bezier(0.16,1,0.3,1);
      box-shadow: 0 -16px 48px rgba(10,30,20,0.2);
    }
    @keyframes sheetUp {
      from { transform: translateX(-50%) translateY(60px); opacity: 0; }
      to { transform: translateX(-50%) translateY(0); opacity: 1; }
    }

    .drawer-hero {
      padding: 16px 24px 24px;
      position: relative;
      overflow: hidden;
    }
    .drawer-hero::after {
      content: '';
      position: absolute;
      top: -30px;
      right: -30px;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: rgba(255,255,255,0.35);
      pointer-events: none;
    }
    .hero-breakfast { background: linear-gradient(145deg, #FFF4EC, #FBDBC5); }
    .hero-lunch { background: linear-gradient(145deg, #E8F5EF, #C8EAD8); }
    .hero-dinner { background: linear-gradient(145deg, #EAF0FA, #CCDCF2); }
    .hero-snack { background: linear-gradient(145deg, #FFF8E5, #FFE9A5); }

    .drawer-handle {
      width: 36px;
      height: 4px;
      background: rgba(0,0,0,0.1);
      border-radius: 2px;
      margin: 8px auto 14px;
    }
    .drawer-hero-top {
      position: absolute;
      top: 14px;
      right: 16px;
      display: flex;
      gap: 6px;
      align-items: center;
      z-index: 2;
    }
    .dhero-fav, .dhero-close {
      background: rgba(255,255,255,0.8);
      backdrop-filter: blur(6px);
      border: none;
      cursor: pointer;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }
    .dhero-fav:hover, .dhero-close:hover { background: rgba(255,255,255,0.95); }
    .dhero-emoji {
      font-size: 44px;
      line-height: 1;
      display: block;
      margin-bottom: 8px;
      filter: drop-shadow(0 3px 8px rgba(0,0,0,0.08));
      position: relative;
      z-index: 1;
    }
    .dhero-type {
      display: inline-block;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      background: rgba(15,61,46,0.08);
      color: var(--pine);
      padding: 4px 10px;
      border-radius: var(--r-pill);
      margin-bottom: 8px;
      position: relative;
      z-index: 1;
    }
    .dhero-name {
      font-family: var(--display);
      font-size: 20px;
      font-weight: 500;
      color: var(--ink);
      margin: 0;
      position: relative;
      z-index: 1;
      line-height: 1.25;
    }

    .drawer-body { padding: 4px 24px 40px; }
    .drawer-macros {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
      margin-bottom: 18px;
    }
    .dm-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid var(--line);
      font-size: 13px;
    }
    .dm-row span { color: var(--ink-light); }
    .dm-row strong { color: var(--ink); font-weight: 600; }

    .drawer-block { margin-bottom: 18px; }
    .dblock-title {
      display: flex;
      align-items: center;
      gap: 7px;
      font-size: 11px;
      font-weight: 700;
      color: var(--ink-soft);
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin: 0 0 10px;
    }
    .dblock-title svg { color: var(--mint); flex-shrink: 0; }
    .ingredients {
      list-style: none;
      margin: 0;
      padding: 0;
      border: 1px solid var(--line);
      border-radius: 12px;
      overflow: hidden;
    }
    .ingredient {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      font-size: 13px;
    }
    .ingredient:not(:last-child) { border-bottom: 1px solid var(--line); }
    .ingredient:nth-child(even) { background: var(--cream); }
    .ing-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--mint);
      flex-shrink: 0;
    }
    .ing-name { flex: 1; color: var(--ink); font-weight: 500; }
    .ing-amount {
      color: var(--ink-light);
      font-weight: 600;
      white-space: nowrap;
      font-size: 12px;
    }
    .dblock-instructions {
      font-size: 13px;
      color: var(--ink-light);
      line-height: 1.7;
      white-space: pre-line;
      margin: 0;
    }

    .drawer-section { margin-bottom: 18px; }
    .dsection-label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      color: var(--ink-soft);
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 10px;
    }
    .portion-row { display: flex; align-items: center; gap: 12px; }
    .portion-slider { flex: 1; accent-color: var(--pine); height: 6px; }
    .portion-value {
      font-family: var(--display);
      font-size: 20px;
      font-weight: 500;
      color: var(--pine);
      min-width: 44px;
      text-align: right;
    }
    .portion-stats {
      display: flex;
      gap: 12px;
      margin-top: 6px;
      font-size: 12px;
      color: var(--ink-light);
    }
    .log-btns { display: flex; gap: 8px; }
    .log-btn {
      flex: 1;
      padding: 10px 8px;
      border: 1.5px solid var(--line);
      border-radius: var(--r-pill);
      background: var(--paper);
      font-size: 12px;
      font-weight: 600;
      color: var(--ink-soft);
      cursor: pointer;
      transition: all 0.15s;
      text-align: center;
      font-family: inherit;
    }
    .log-btn.active {
      border-color: var(--pine);
      background: var(--pine);
      color: var(--cream);
    }
    .log-btn:hover:not(.active) { border-color: var(--mint); }

    .drawer-actions {
      display: flex;
      gap: 10px;
      margin-top: 8px;
    }
    .btn-swap {
      flex: 1;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px;
      border: none;
      border-radius: var(--r-pill);
      background: var(--pine);
      color: var(--cream);
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s;
      font-family: inherit;
    }
    .btn-swap:hover:not(:disabled) { background: var(--mint); }
    .btn-swap:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-lock {
      width: 48px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1.5px solid var(--line);
      border-radius: var(--r-pill);
      background: var(--paper);
      color: var(--ink-soft);
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-lock:hover { border-color: var(--mint); color: var(--pine); }
    .drawer-hint {
      font-size: 12px;
      color: var(--ink-muted);
      text-align: center;
      margin: 10px 0 0;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(248,244,236,0.4);
      border-top-color: var(--cream);
      border-radius: 50%;
      animation: nc-spin 0.7s linear infinite;
    }
    @keyframes nc-spin { to { transform: rotate(360deg); } }

    /* ========= ANIMATIONS ========= */
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .dash-header { animation: fadeIn 0.4s ease; }
    .greeting { animation: fadeIn 0.5s ease 0.05s both; }
    .savings-card { animation: fadeIn 0.6s ease 0.1s both; }
    .day-tabs { animation: fadeIn 0.6s ease 0.15s both; }
    .day-macros { animation: fadeIn 0.6s ease 0.2s both; }
    .meals { animation: fadeIn 0.6s ease 0.25s both; }

    /* ========= CDK DRAG ========= */
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 14px;
      background: var(--paper);
      border: 2px solid var(--mint);
    }
    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    .cdk-drop-list-dragging .cdk-drag:not(.cdk-drag-placeholder) {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class PlanPage implements OnDestroy {
  private readonly planService = inject(PlanService);
  private readonly recipeService = inject(RecipeService);
  private readonly toast = inject(NcToastService);
  readonly hubProgress = inject(PlanGenerationHubService);

  private subCompleted: any = null;
  private subError: any = null;

  readonly plan = signal<PlanGenerationResult | null>(null);
  readonly generating = signal(false);
  readonly showSuccess = signal(false);
  readonly selectedDay = signal(0);
  readonly shoppingOpen = signal(false);
  readonly checkedItems = signal<Set<string>>(new Set());
  readonly selectedMeal = signal<MealPlanDto | null>(null);
  readonly selectedLogStatus = signal<MealLogStatus | null>(null);
  readonly portionValue = signal(1);
  readonly mealLogStatuses = signal<Record<string, MealLogStatus>>({});
  readonly logging = signal(false);
  readonly swapping = signal(false);
  readonly dragging = signal(false);
  readonly favoriteIds = signal<Set<string>>(new Set());
  readonly favorites = signal<FavoriteRecipeDto[]>([]);
  readonly showFavorites = signal(false);

  private readonly storageKey = 'nutricasa_shopping_checked';

  readonly logOptions: { value: MealLogStatus; label: string }[] = [
    { value: 'completed', label: 'Completada' },
    { value: 'partial', label: 'Parcial' },
    { value: 'skipped', label: 'Saltada' },
  ];

  constructor() {
    this.loadPlan();
    this.loadCheckedState();
    this.loadFavorites();
  }

  weekRange(): string {
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
    return `${monday.toLocaleDateString('es-MX', opts)} - ${sunday.toLocaleDateString('es-MX', opts)}`;
  }

  readonly selectedDayPlan = computed(() => {
    return this.plan()?.days?.[this.selectedDay()] ?? null;
  });

  selectDay(index: number) {
    this.selectedDay.set(index);
    this.closeDrawer();
  }

  selectMeal(meal: MealPlanDto) {
    this.selectedMeal.set(meal);
    this.selectedLogStatus.set(null);
    this.portionValue.set(meal.portionMultiplier ?? 1);
  }

  closeDrawer() {
    this.selectedMeal.set(null);
    this.selectedLogStatus.set(null);
  }

  ngOnDestroy() {
    this.cleanupHubSubscriptions();
    this.hubProgress.disconnect();
  }

  private cleanupHubSubscriptions() {
    if (this.subCompleted) {
      this.subCompleted.unsubscribe();
      this.subCompleted = null;
    }
    if (this.subError) {
      this.subError.unsubscribe();
      this.subError = null;
    }
  }

  async generatePlan(forceRegenerate = false) {
    this.generating.set(true);
    this.showSuccess.set(false);
    this.hubProgress.resetState();

    try {
      await this.hubProgress.connect();
    } catch (err) {
      console.error('[PlanPage] Error connecting to SignalR:', err);
    }

    this.cleanupHubSubscriptions();

    this.planService.generate({
      weekStartDate: new Date().toISOString().split('T')[0],
      forceRegenerate,
    }).subscribe({
      next: (res: any) => {
        console.log('[PlanPage] Plan generation requested, Job ID:', res?.jobId);
        
        this.subCompleted = this.hubProgress.onCompleted$.subscribe({
          next: () => {
            this.generating.set(false);
            this.showSuccess.set(true);
            this.loadPlan();
            this.cleanupHubSubscriptions();
            this.hubProgress.disconnect();
          }
        });

        this.subError = this.hubProgress.onError$.subscribe({
          next: (event) => {
            this.generating.set(false);
            this.toast.error(event.message || 'Error durante la generación');
            this.cleanupHubSubscriptions();
            this.hubProgress.disconnect();
          }
        });
      },
      error: (err: any) => { 
        this.generating.set(false); 
        const msg = err.error?.message || err.message || 'Error al solicitar la generación del plan';
        this.toast.error(msg); 
        console.error('Generate Plan Request Error:', err);
        this.hubProgress.disconnect();
      },
    });
  }

  private loadPlan() {
    this.planService.getCurrent().subscribe({
      next: (data) => {
        if (data.generationStatus === 'Failed' || data.generationStatus === 'Pending') {
          this.plan.set(null);
          return;
        }

        this.plan.set(data);
        this.selectedDay.set(this.getDefaultDayIndex(data.days));
        this.loadMealLogs(data);

        if (data.generationStatus === 'Generating') {
          this.generating.set(true);
          this.hubProgress.resetState();
          this.hubProgress.connect().then(() => {
            this.cleanupHubSubscriptions();

            this.subCompleted = this.hubProgress.onCompleted$.subscribe({
              next: () => {
                this.generating.set(false);
                this.showSuccess.set(true);
                this.loadPlan();
                this.cleanupHubSubscriptions();
                this.hubProgress.disconnect();
              }
            });

            this.subError = this.hubProgress.onError$.subscribe({
              next: (event) => {
                this.generating.set(false);
                this.toast.error(event.message || 'Error durante la generación');
                this.cleanupHubSubscriptions();
                this.hubProgress.disconnect();
              }
            });
          }).catch(err => {
            console.error('[PlanPage] Failed to reconnect to generation hub:', err);
          });
        }
      },
      error: () => {
        this.plan.set(null);
      }
    });
  }

  private loadMealLogs(plan: PlanGenerationResult) {
    this.planService.getMealLogs(plan.startDate, plan.endDate).subscribe({
      next: (logs) => {
        const statusMap: Record<string, MealLogStatus> = {};
        for (const log of logs) {
          if (log.planMealId) statusMap[log.planMealId] = log.status;
        }
        this.mealLogStatuses.set(statusMap);
      },
    });
  }

  getDayName(dayNumber: number): string {
    const map: Record<number, string> = {
      1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue',
      5: 'Vie', 6: 'Sáb', 7: 'Dom',
    };
    return map[dayNumber] || 'Día';
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
    const map: Record<string, string> = { breakfast: '🍳', lunch: '🥗', dinner: '🍲', snack: '🥜' };
    return map[type] || '🍽️';
  }

  private getDefaultDayIndex(days: import('../../models/plan.models').DayPlanDto[]): number {
    const jsDay = new Date().getDay(); // 0=Dom, 1=Lun…6=Sáb
    const planDay = jsDay === 0 ? 7 : jsDay;  // 1=Lun…7=Dom
    const idx = days.findIndex(d => d.dayNumber === planDay);
    return idx >= 0 ? idx : 0;
  }

  getStatusLabel(status: MealLogStatus): string {
    const map: Record<MealLogStatus, string> = {
      completed: 'Hecho', partial: 'Parcial', skipped: 'Saltado', substituted: 'Sustituido',
    };
    return map[status] || status;
  }

  isChecked(storeCode: string, ingredient: string): boolean {
    return this.checkedItems().has(`${storeCode}::${ingredient}`);
  }

  toggleItem(storeCode: string, ingredient: string) {
    const key = `${storeCode}::${ingredient}`;
    const next = new Set(this.checkedItems());
    if (next.has(key)) next.delete(key); else next.add(key);
    this.checkedItems.set(next);
    localStorage.setItem(this.storageKey, JSON.stringify([...next]));
  }

  private loadCheckedState() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) this.checkedItems.set(new Set(JSON.parse(saved)));
    } catch { /* ignore */ }
  }

  private loadFavorites() {
    this.recipeService.getFavorites().subscribe({
      next: (favs) => {
        this.favorites.set(favs);
        this.favoriteIds.set(new Set(favs.map(f => f.recipeId)));
      },
    });
  }

  isFavorite(recipeId: string): boolean {
    return this.favoriteIds().has(recipeId);
  }

  toggleFavorite(recipeId: string) {
    if (this.isFavorite(recipeId)) {
      this.recipeService.removeFavorite(recipeId).subscribe({
        next: () => {
          this.favoriteIds.update(ids => { ids.delete(recipeId); return new Set(ids); });
          this.favorites.update(favs => favs.filter(f => f.recipeId !== recipeId));
        },
      });
    } else {
      this.recipeService.addFavorite(recipeId).subscribe({
        next: () => {
          this.favoriteIds.update(ids => new Set(ids).add(recipeId));
          this.loadFavorites();
        },
      });
    }
  }

  readonly favoritedInPlan = computed(() => {
    const p = this.plan();
    if (!p) return [];
    const allRecipes = p.days.flatMap(d => d.meals).map(m => m.recipe);
    const favIds = this.favoriteIds();
    return allRecipes.filter(r => favIds.has(r.recipeId));
  });

  logMeal(status: MealLogStatus, planId: string, meal: MealPlanDto) {
    this.selectedLogStatus.set(status);
    this.logging.set(true);
    this.planService.logMeal(planId, meal.planMealId, { status, actualPortion: this.portionValue() }).subscribe({
      next: () => {
        this.mealLogStatuses.update(m => ({ ...m, [meal.planMealId]: status }));
        this.logging.set(false);
        this.toast.success(`Registrado: ${this.getMealLabel(meal.mealType)} — ${this.getStatusLabel(status)}`);
        setTimeout(() => this.closeDrawer(), 600);
      },
      error: () => {
        this.logging.set(false);
        this.selectedLogStatus.set(null);
        this.toast.error('Error al registrar la comida');
      },
    });
  }

  onMealDropped(event: CdkDragDrop<MealPlanDto[]>, planId: string, day: DayPlanDto) {
    if (event.previousIndex === event.currentIndex) return;

    const meals = day.meals;
    const movedMeal = meals[event.previousIndex];
    if (movedMeal.isLocked) {
      this.toast.warning('Esta comida está bloqueada. Desbloquéala antes de moverla.');
      return;
    }

    const moves = [];
    const prevMeal = meals[event.previousIndex];
    const currMeal = meals[event.currentIndex];

    moves.push({
      planMealId: prevMeal.planMealId,
      newDayOfWeek: day.dayNumber,
      newMealType: prevMeal.mealType,
      rowVersion: prevMeal.rowVersion ?? 1,
      newSortOrder: event.currentIndex + 1,
    });

    if (currMeal && !currMeal.isLocked) {
      moves.push({
        planMealId: currMeal.planMealId,
        newDayOfWeek: day.dayNumber,
        newMealType: currMeal.mealType,
        rowVersion: currMeal.rowVersion ?? 1,
        newSortOrder: event.previousIndex + 1,
      });
    }

    moveItemInArray(meals, event.previousIndex, event.currentIndex);
    this.planService.reorderMeals(planId, { moves }).subscribe({
      error: () => {
        moveItemInArray(meals, event.currentIndex, event.previousIndex);
        this.toast.error('Conflicto al reordenar. Recargando...');
        this.loadPlan();
      },
    });
  }

  onDropToDay(event: CdkDragDrop<DayPlanDto>, planId: string, targetDay: DayPlanDto) {
    this.dragging.set(false);
    const meal = event.item.data as MealPlanDto;
    if (!meal) return;

    const sourceDay = this.selectedDayPlan();
    // Si se soltó sobre el mismo día, no hay movimiento entre días.
    if (!sourceDay || sourceDay.dayNumber === targetDay.dayNumber) return;

    if (meal.isLocked) {
      this.toast.warning('Esta comida está bloqueada. Desbloquéala antes de moverla.');
      return;
    }

    const move = {
      planMealId: meal.planMealId,
      newDayOfWeek: targetDay.dayNumber,
      newMealType: meal.mealType,
      rowVersion: meal.rowVersion ?? 1,
      newSortOrder: targetDay.meals.length + 1,
    };

    this.planService.reorderMeals(planId, { moves: [move] }).subscribe({
      next: () => {
        this.toast.success(`Movido a ${this.getDayName(targetDay.dayNumber)}`);
        this.loadPlan();
      },
      error: () => {
        this.toast.error('No se pudo mover la comida. Recargando...');
        this.loadPlan();
      },
    });
  }

  toggleLock(planId: string, meal: MealPlanDto) {
    const newLocked = !meal.isLocked;
    meal.isLocked = newLocked;
    this.planService.toggleLock(planId, meal.planMealId, { isLocked: newLocked }).subscribe({
      error: () => {
        meal.isLocked = !newLocked;
        this.toast.error('Error al cambiar bloqueo');
      },
    });
  }

  onPortionChange(event: Event) {
    const value = parseFloat((event.target as HTMLInputElement).value);
    this.portionValue.set(value);
  }

  swapMeal(planId: string, meal: MealPlanDto) {
    if (meal.isLocked) {
      this.toast.warning('Desbloquea la comida antes de cambiarla.');
      return;
    }
    if (this.swapping()) return;
    this.swapping.set(true);
    const mealId = meal.planMealId;
    this.planService.swapMeal(planId, mealId).subscribe({
      next: () => {
        this.planService.getCurrent().subscribe({
          next: (data) => {
            this.plan.set(data);
            this.loadMealLogs(data);
            this.reselectMeal(mealId);
            this.swapping.set(false);
            this.toast.success('Receta actualizada');
          },
          error: () => { this.swapping.set(false); this.loadPlan(); },
        });
      },
      error: () => {
        this.swapping.set(false);
        this.toast.error('No se pudo generar otra receta');
      },
    });
  }

  private reselectMeal(planMealId: string) {
    const updated = this.plan()?.days
      .flatMap(d => d.meals)
      .find(m => m.planMealId === planMealId);
    if (updated) {
      this.selectedMeal.set(updated);
    } else {
      this.closeDrawer();
    }
  }
}
