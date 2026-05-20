import { Component, inject, signal, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { PlanService } from '../../services/plan.service';
import { RecipeService } from '../../services/recipe.service';
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
    <div class="dash-header">
      <div class="dash-brand">
        <svg class="leaf-icon" viewBox="0 0 24 24"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>
        NutriCasa
      </div>
      <div class="dash-actions">
        <button class="icon-btn" (click)="generatePlan()" [disabled]="generating()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="greeting">
      <div class="greeting-eyebrow">Tu plan semanal</div>
      <h1 class="greeting-title">Semana del <span class="italic">{{ weekRange() }}</span></h1>
      @if (plan(); as p) {
        <div class="greeting-mode">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          Modo {{ p.budgetModeName }}
        </div>
      }
    </div>

    @if (generating()) {
      <div class="loading-state">
        <app-lottie src="/lottie/cooking.json" width="180px" height="180px"></app-lottie>
        <p>Generando tu plan personalizado...</p>
        <small style="color:var(--ink-muted);">Esto puede tomar hasta 30 segundos</small>
      </div>
    } @else if (showSuccess()) {
      <div class="loading-state">
        <app-lottie src="/lottie/success.json" width="180px" height="180px" [loop]="false"></app-lottie>
        <p>¡Plan generado con éxito!</p>
      </div>
    } @else if (plan(); as p) {
      @if (p.estimatedCostMxn) {
        <div class="savings-card">
          <div class="savings-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          </div>
          <div class="savings-text">
            <strong>Costo estimado de la semana</strong>
            <span class="savings-amount">{{ '$' + p.estimatedCostMxn }} MXN</span>
          </div>
        </div>
      }

      <div class="day-tabs">
        @for (day of p.days; track day.dayNumber; let i = $index) {
          <button class="day-tab" [class.active]="selectedDay() === i" (click)="selectDay(i)">
            <span class="day-name">{{ getDayName(day.dayNumber) }}</span>
            <span class="day-cal">{{ day.dayTotals.calories }} kcal</span>
          </button>
        }
      </div>

      @if (selectedDayPlan(); as day) {
        <div class="day-macros">
          <div class="dm-item"><span class="dm-label">Proteína</span><span class="dm-value">{{ day.dayTotals.proteinGr }}g</span></div>
          <div class="dm-item"><span class="dm-label">Grasa</span><span class="dm-value">{{ day.dayTotals.fatGr }}g</span></div>
          <div class="dm-item"><span class="dm-label">Carbs</span><span class="dm-value">{{ day.dayTotals.carbsGr }}g</span></div>
          <div class="dm-item"><span class="dm-label">Calorías</span><span class="dm-value">{{ day.dayTotals.calories }}</span></div>
        </div>

        <div cdkDropListGroup>
          <div class="meals"
            cdkDropList
            [cdkDropListData]="day.meals"
            (cdkDropListDropped)="onMealDropped($event, p.planId, day)"
            [cdkDropListSortingDisabled]="true">
            @for (meal of day.meals; track meal.planMealId; let i = $index) {
              <div class="meal" cdkDrag [cdkDragData]="meal" [class.meal-locked]="meal.isLocked">
                <div class="meal-drag-handle" cdkDragHandle>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="2"/><circle cx="15" cy="5" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="9" cy="19" r="2"/><circle cx="15" cy="19" r="2"/></svg>
                </div>
                <div class="meal-thumb" [class]="'meal-thumb-' + getMealColor(meal.mealType)" (click)="selectMeal(meal)">
                  <svg viewBox="0 0 24 24"><path d="M12 2L8 6h2v8H6l4 4 4-4h-4V6h2L12 2z M3 22h18v-2H3v2z"/></svg>
                </div>
                <div class="meal-info" (click)="selectMeal(meal)">
                  <div class="meal-time">{{ getMealLabel(meal.mealType) }}</div>
                  <div class="meal-name">{{ meal.recipe.name }}</div>
                  <div class="meal-macros">
                    <span class="kcal">{{ meal.recipe.calories }} kcal</span>
                    <span class="prot">{{ meal.recipe.proteinGr }}g P</span>
                    <span class="fat">{{ meal.recipe.fatGr }}g G</span>
                  </div>
                </div>
                <div class="meal-actions">
                  <button class="fav-btn" [class.faved]="isFavorite(meal.recipe.recipeId)" (click)="$event.stopPropagation(); toggleFavorite(meal.recipe.recipeId)" title="Favorita">
                    <svg width="16" height="16" viewBox="0 0 24 24" [attr.fill]="isFavorite(meal.recipe.recipeId) ? 'var(--coral)' : 'none'" stroke="var(--coral)" stroke-width="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                  @if (meal.isLocked) {
                    <button class="lock-btn locked" (click)="toggleLock(p.planId, meal)" title="Desbloquear">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </button>
                  } @else {
                    <button class="lock-btn" (click)="toggleLock(p.planId, meal)" title="Bloquear">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </button>
                  }
                  @if (mealLogStatuses()[meal.planMealId]; as logStatus) {
                    <span class="status-badge" [class]="'status-' + logStatus">{{ getStatusLabel(logStatus) }}</span>
                  }
                </div>
              </div>
            }
          </div>
        </div>

        @if (p.shoppingList?.byStore?.length) {
          @let sl = p.shoppingList!;
          <details class="shopping-section" [open]="shoppingOpen()">
            <summary class="shopping-header" (click)="$event.preventDefault(); shoppingOpen.update(v => !v)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <div class="shopping-header-text">
                <span class="shopping-header-title">Lista de compras</span>
                <span class="shopping-header-cost">{{ '$' + sl.totalEstimatedMxn }} MXN</span>
              </div>
              <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
            </summary>
            <div class="shopping-body">
              @for (store of sl.byStore; track store.storeCode) {
                <div class="store-group">
                  <div class="store-group-header">
                    <span class="store-name">{{ store.storeName }}</span>
                    <span class="store-subtotal">{{ '$' + store.subtotalMxn }} MXN</span>
                  </div>
                  <div class="store-items">
                    @for (item of store.items; track item.ingredientName) {
                      <label class="store-item">
                        <input type="checkbox" class="store-check" [checked]="isChecked(store.storeCode, item.ingredientName)" (change)="toggleItem(store.storeCode, item.ingredientName)">
                        <div class="store-item-info">
                          <span class="store-item-name" [class.tagged]="isChecked(store.storeCode, item.ingredientName)">{{ item.ingredientName }}</span>
                          <span class="store-item-amount">{{ item.totalAmount }} {{ item.unit }}</span>
                        </div>
                        <span class="store-item-cost">{{ '$' + item.estimatedCostMxn }}</span>
                      </label>
                    }
                  </div>
                </div>
              }
            </div>
          </details>
        }

        @if (favoritedInPlan().length > 0) {
          <div class="fav-section-card">
            <div class="fav-section-header" (click)="showFavorites.update(v => !v)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--coral)" stroke="var(--coral)" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span class="fav-section-title">Favoritas de la semana ({{ favoritedInPlan().length }})</span>
              <svg class="chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" [style.transform]="showFavorites() ? 'rotate(180deg)' : ''"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            @if (showFavorites()) {
              <div class="fav-list">
                @for (fav of favoritedInPlan(); track fav.recipeId) {
                  <div class="fav-chip">
                    <span>{{ fav.name }}</span>
                    <span class="fav-chip-macros">{{ fav.calories }} kcal</span>
                  </div>
                }
              </div>
            }
          </div>
        }
      }
    } @else {
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <h3>Sin plan esta semana</h3>
        <p>Genera tu primer plan personalizado con IA</p>
        <button class="btn-primary" style="max-width:280px;margin:0 auto;" (click)="generatePlan()">
          Generar mi plan
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        </button>
      </div>
    }
  </div>

  @if (selectedMeal(); as meal) {
    <div class="drawer-overlay" (click)="closeDrawer()"></div>
    <div class="meal-drawer">
      <div class="drawer-header">
        <h3 class="drawer-title">{{ getMealLabel(meal.mealType) }}</h3>
        <div class="drawer-header-actions">
          <button class="fav-btn-lg" [class.faved]="isFavorite(meal.recipe.recipeId)" (click)="toggleFavorite(meal.recipe.recipeId)" title="Favorita">
            <svg width="20" height="20" viewBox="0 0 24 24" [attr.fill]="isFavorite(meal.recipe.recipeId) ? 'var(--coral)' : 'none'" stroke="var(--coral)" stroke-width="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          <button class="drawer-close" (click)="closeDrawer()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
      <h4 class="drawer-recipe">{{ meal.recipe.name }}</h4>

      <div class="drawer-macros">
        <div class="dm-row"><span>Calorías</span><strong>{{ meal.recipe.calories }} kcal</strong></div>
        <div class="dm-row"><span>Proteína</span><strong>{{ meal.recipe.proteinGr }}g</strong></div>
        <div class="dm-row"><span>Grasa</span><strong>{{ meal.recipe.fatGr }}g</strong></div>
        <div class="dm-row"><span>Carbohidratos</span><strong>{{ meal.recipe.carbsGr }}g</strong></div>
        <div class="dm-row"><span>Tiempo</span><strong>{{ meal.recipe.prepTimeMin + meal.recipe.cookTimeMin }} min</strong></div>
        <div class="dm-row"><span>Costo</span><strong>{{ '$' + meal.recipe.estimatedCostMxn }} MXN</strong></div>
      </div>

      <details class="drawer-instructions">
        <summary>Instrucciones</summary>
        <p>{{ meal.recipe.instructions }}</p>
      </details>

      <div class="drawer-section">
        <label class="drawer-label">Porción</label>
        <div class="portion-row">
          <input type="range" min="0.25" max="3" step="0.25" [value]="portionValue()" (input)="onPortionChange($event)" class="portion-slider">
          <span class="portion-value">{{ portionValue() }}x</span>
        </div>
        <div class="portion-macros">
          <span>{{ (meal.recipe.calories * portionValue()) | number:'1.0-0' }} kcal</span>
          <span>{{ (meal.recipe.proteinGr * portionValue()) | number:'1.0-0' }}g P</span>
          <span>{{ (meal.recipe.fatGr * portionValue()) | number:'1.0-0' }}g G</span>
        </div>
      </div>

      <div class="drawer-section">
        <label class="drawer-label">Registrar comida</label>
        <div class="log-options">
          @for (opt of logOptions; track opt.value) {
            <button class="log-btn" [class.active]="selectedLogStatus() === opt.value" (click)="logMeal(opt.value, plan()!.planId, meal)">
              {{ opt.label }}
            </button>
          }
        </div>
      </div>

      <div class="drawer-actions">
        <button class="btn-secondary" (click)="swapMeal(plan()!.planId, meal)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
          Cambiar esta comida
        </button>
        <button class="btn-secondary" (click)="toggleLock(plan()!.planId, meal)">
          @if (meal.isLocked) {
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Desbloquear
          } @else {
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            Bloquear
          }
        </button>
      </div>
    </div>
  }
  `,
  styles: [`
    :host { display: contents; }
    .dash { max-width: 480px; margin: 0 auto; padding: 0 20px 140px; background: var(--cream); position: relative; z-index: 1; }
    .dash-header { padding: 24px 0 20px; display: flex; align-items: center; justify-content: space-between; }
    .dash-brand { font-family: var(--display); font-size: 22px; font-weight: 500; color: var(--pine); display: flex; align-items: center; gap: 8px; }
    .dash-brand svg { width: 22px; height: 22px; fill: var(--mint); }
    .dash-actions { display: flex; gap: 10px; }
    .icon-btn { width: 42px; height: 42px; background: var(--paper); border-radius: var(--r-pill); display: flex; align-items: center; justify-content: center; color: var(--ink); box-shadow: var(--shadow-sm); border: none; cursor: pointer; }
    .icon-btn:disabled { opacity: 0.5; }
    .greeting { margin-bottom: 22px; }
    .greeting-eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--mint); margin-bottom: 8px; }
    .greeting-title { font-family: var(--display); font-size: 28px; font-weight: 400; line-height: 1.15; letter-spacing: -0.02em; color: var(--ink); }
    .greeting-title .italic { font-style: italic; color: var(--pine); }
    .greeting-mode { display: inline-flex; align-items: center; gap: 6px; margin-top: 10px; padding: 5px 11px; background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-pill); font-size: 11px; font-weight: 600; color: var(--ink-soft); }
    .loading-state { text-align: center; padding: 60px 20px; }
    .loading-state p { font-size: 15px; color: var(--ink-soft); margin-top: 20px; }
    .savings-card { display: flex; gap: 14px; align-items: center; background: linear-gradient(135deg, var(--mint-soft), var(--cream-warm)); border: 1px solid var(--mint-light); border-radius: var(--r-lg); padding: 16px; margin-bottom: 20px; }
    .savings-icon { width: 44px; height: 44px; border-radius: 14px; background: var(--pine); color: var(--cream); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .savings-text { font-size: 13px; color: var(--ink-soft); }
    .savings-text strong { display: block; font-size: 14px; color: var(--ink); }
    .savings-amount { font-family: var(--display); font-size: 24px; font-weight: 500; color: var(--pine); display: block; margin: 2px 0; }
    .day-tabs { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 12px; margin-bottom: 16px; }
    .day-tab { flex-shrink: 0; padding: 10px 14px; border: 1.5px solid var(--line); border-radius: var(--r-pill); background: var(--paper); text-align: center; cursor: pointer; transition: all 0.2s; }
    .day-tab.active { border-color: var(--pine); background: var(--pine); color: var(--cream); }
    .day-name { display: block; font-size: 12px; font-weight: 600; }
    .day-cal { display: block; font-size: 10px; color: var(--ink-muted); margin-top: 2px; }
    .day-tab.active .day-cal { color: rgba(248,244,236,0.6); }
    .day-macros { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 20px; }
    .dm-item { background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-md); padding: 12px; text-align: center; }
    .dm-label { display: block; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--ink-muted); }
    .dm-value { display: block; font-family: var(--display); font-size: 20px; font-weight: 500; color: var(--ink); margin-top: 2px; }
    .meals { display: flex; flex-direction: column; gap: 8px; min-height: 60px; }
    .meal { background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 12px 12px 12px 8px; display: flex; gap: 12px; align-items: center; transition: box-shadow 0.2s; }
    .meal:hover { box-shadow: var(--shadow-sm); }
    .meal.meal-locked { opacity: 0.7; background: var(--cream); }
    .meal.cdk-drag-preview { box-shadow: 0 5px 20px rgba(0,0,0,0.15); border-color: var(--mint); }
    .meal.cdk-drag-placeholder { opacity: 0; }
    .meal-drag-handle { cursor: grab; color: var(--ink-muted); display: flex; align-items: center; padding: 4px; flex-shrink: 0; }
    .meal-drag-handle:active { cursor: grabbing; }
    .meal-thumb { width: 48px; height: 48px; border-radius: var(--r-md); flex-shrink: 0; display: flex; align-items: center; justify-content: center; cursor: pointer; }
    .meal-thumb-1 { background: linear-gradient(135deg, #F5C7B8, #E8866B); }
    .meal-thumb-2 { background: linear-gradient(135deg, #B5E2CB, #5BC096); }
    .meal-thumb-3 { background: linear-gradient(135deg, #B8DCEC, #5BA3D0); }
    .meal-thumb svg { width: 24px; height: 24px; fill: rgba(255,255,255,0.85); }
    .meal-info { flex: 1; min-width: 0; cursor: pointer; }
    .meal-time { font-size: 10px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-muted); margin-bottom: 2px; }
    .meal-name { font-family: var(--display); font-size: 14px; font-weight: 500; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .meal-macros { display: flex; gap: 8px; font-size: 11px; color: var(--ink-light); }
    .meal-macros span { display: inline-flex; align-items: center; gap: 4px; }
    .meal-macros span::before { content: ''; width: 5px; height: 5px; border-radius: 50%; }
    .meal-macros .kcal::before { background: var(--mint); }
    .meal-macros .prot::before { background: var(--lake); }
    .meal-macros .fat::before { background: var(--coral); }
    .meal-actions { display: flex; flex-direction: column; align-items: center; gap: 6px; flex-shrink: 0; }
    .lock-btn { background: none; border: none; cursor: pointer; padding: 4px; color: var(--ink-muted); display: flex; align-items: center; }
    .lock-btn.locked { color: var(--coral); }
    .status-badge { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; padding: 3px 7px; border-radius: var(--r-pill); }
    .status-completed { background: var(--mint-soft); color: var(--pine); }
    .status-partial { background: var(--cream-warm); color: var(--gold); }
    .status-skipped { background: var(--coral-bg); color: var(--coral); }
    .status-substituted { background: var(--lake-light); color: #2a6b8a; }
    .shopping-section { margin-top: 24px; background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-lg); overflow: hidden; }
    .shopping-header { display: flex; align-items: center; gap: 10px; padding: 16px; cursor: pointer; user-select: none; list-style: none; }
    .shopping-header::-webkit-details-marker { display: none; }
    .shopping-header svg:first-child { color: var(--mint); flex-shrink: 0; }
    .shopping-header-text { flex: 1; min-width: 0; }
    .shopping-header-title { display: block; font-size: 14px; font-weight: 700; color: var(--ink); }
    .shopping-header-cost { font-family: var(--display); font-size: 20px; font-weight: 500; color: var(--pine); }
    .chevron { transition: transform 0.25s var(--ease-out); color: var(--ink-muted); }
    .shopping-section[open] .chevron { transform: rotate(180deg); }
    .shopping-body { padding: 0 16px 16px; border-top: 1px solid var(--line); }
    .store-group { margin-top: 16px; }
    .store-group-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .store-name { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--ink-soft); }
    .store-subtotal { font-size: 13px; font-weight: 600; color: var(--pine); }
    .store-items { display: flex; flex-direction: column; gap: 6px; }
    .store-item { display: flex; align-items: center; gap: 10px; padding: 10px; border: 1px solid var(--line); border-radius: var(--r-md); cursor: pointer; transition: background 0.15s; }
    .store-item:hover { background: var(--cream); }
    .store-check { width: 18px; height: 18px; accent-color: var(--pine); flex-shrink: 0; }
    .store-item-info { flex: 1; min-width: 0; }
    .store-item-name { display: block; font-size: 14px; font-weight: 600; color: var(--ink); }
    .store-item-name.tagged { text-decoration: line-through; color: var(--ink-muted); }
    .store-item-amount { display: block; font-size: 12px; color: var(--ink-light); margin-top: 2px; }
    .store-item-cost { font-size: 13px; font-weight: 600; color: var(--ink-soft); flex-shrink: 0; }
    .empty-state { text-align: center; padding: 60px 20px; }
    .empty-state h3 { font-family: var(--display); font-size: 22px; font-weight: 400; color: var(--ink); margin: 16px 0 8px; }
    .empty-state p { font-size: 14px; color: var(--ink-light); margin-bottom: 24px; }

    .drawer-overlay { position: fixed; inset: 0; background: rgba(15,36,25,0.4); z-index: 99; animation: fadeIn 0.2s ease; }
    .meal-drawer { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 480px; max-height: 80vh; background: var(--paper); border-radius: 24px 24px 0 0; padding: 20px 24px 32px; z-index: 100; overflow-y: auto; animation: slideUp 0.3s var(--ease-out); }
    .drawer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .drawer-title { font-family: var(--display); font-size: 14px; font-weight: 400; color: var(--ink-muted); text-transform: uppercase; letter-spacing: 0.12em; }
    .drawer-close { background: none; border: none; cursor: pointer; color: var(--ink-muted); padding: 4px; }
    .drawer-recipe { font-family: var(--display); font-size: 22px; font-weight: 500; color: var(--ink); margin: 0 0 16px; }
    .drawer-macros { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
    .dm-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid var(--line); font-size: 13px; }
    .dm-row span { color: var(--ink-light); }
    .dm-row strong { color: var(--ink); }
    .drawer-instructions { margin-bottom: 16px; }
    .drawer-instructions summary { font-size: 13px; font-weight: 700; color: var(--ink-soft); cursor: pointer; padding: 8px 0; }
    .drawer-instructions p { font-size: 13px; color: var(--ink-light); line-height: 1.6; white-space: pre-line; }
    .drawer-section { margin-bottom: 16px; }
    .drawer-label { display: block; font-size: 12px; font-weight: 700; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 8px; }
    .portion-row { display: flex; align-items: center; gap: 12px; }
    .portion-slider { flex: 1; accent-color: var(--pine); height: 6px; }
    .portion-value { font-family: var(--display); font-size: 20px; font-weight: 500; color: var(--pine); min-width: 48px; text-align: right; }
    .portion-macros { display: flex; gap: 12px; margin-top: 8px; font-size: 12px; color: var(--ink-light); }
    .log-options { display: flex; gap: 8px; }
    .log-btn { flex: 1; padding: 10px 8px; border: 1.5px solid var(--line); border-radius: var(--r-pill); background: var(--paper); font-size: 12px; font-weight: 600; color: var(--ink-soft); cursor: pointer; transition: all 0.15s; text-align: center; }
    .log-btn.active { border-color: var(--pine); background: var(--pine); color: var(--cream); }
    .log-btn:hover:not(.active) { border-color: var(--mint); }
    .drawer-actions { display: flex; gap: 10px; margin-top: 8px; }
    .btn-secondary { flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 12px; border: 1.5px solid var(--line); border-radius: var(--r-pill); background: var(--paper); font-size: 13px; font-weight: 600; color: var(--ink-soft); cursor: pointer; transition: all 0.15s; }
    .btn-secondary:hover { border-color: var(--mint); color: var(--pine); }
    .btn-primary { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 28px; border: none; border-radius: var(--r-pill); background: var(--pine); color: var(--cream); font-size: 15px; font-weight: 700; cursor: pointer; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
    .dash-header { animation: slideDown 0.5s var(--ease-out); }
    .greeting { animation: slideDown 0.6s var(--ease-out) 0.05s both; }
    .savings-card { animation: slideUp 0.7s var(--ease-out) 0.1s both; }
    .day-tabs { animation: slideUp 0.7s var(--ease-out) 0.15s both; }
    .day-macros { animation: slideUp 0.7s var(--ease-out) 0.2s both; }
    .meals { animation: slideUp 0.7s var(--ease-out) 0.25s both; }

    .fav-btn { background: none; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; transition: transform 0.15s; }
    .fav-btn:hover { transform: scale(1.2); }
    .fav-btn-lg { background: none; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; transition: transform 0.15s; }
    .fav-btn-lg:hover { transform: scale(1.15); }
    .drawer-header-actions { display: flex; gap: 4px; align-items: center; }
    .fav-section-card { margin-top: 16px; background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-lg); overflow: hidden; }
    .fav-section-header { display: flex; align-items: center; gap: 8px; padding: 14px 16px; cursor: pointer; user-select: none; font-size: 13px; font-weight: 700; color: var(--ink); }
    .fav-section-title { flex: 1; }
    .fav-list { display: flex; flex-wrap: wrap; gap: 8px; padding: 0 16px 14px; border-top: 1px solid var(--line); padding-top: 12px; }
    .fav-chip { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: var(--cream); border: 1px solid var(--line); border-radius: var(--r-pill); font-size: 12px; font-weight: 600; color: var(--ink); }
    .fav-chip-macros { font-size: 10px; color: var(--ink-muted); font-weight: 400; }

    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: var(--r-lg);
      background: var(--paper);
      border: 2px solid var(--mint);
    }
    .cdk-drag-animating { transition: transform 250ms cubic-bezier(0, 0, 0.2, 1); }
    .cdk-drop-list-dragging .cdk-drag:not(.cdk-drag-placeholder) { transition: transform 250ms cubic-bezier(0, 0, 0.2, 1); }
  `]
})
export class PlanPage {
  private readonly planService = inject(PlanService);
  private readonly recipeService = inject(RecipeService);
  private readonly toast = inject(NcToastService);

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

  generatePlan() {
    this.generating.set(true);
    this.showSuccess.set(false);
    this.planService.generate({
      weekStartDate: new Date().toISOString().split('T')[0],
    }).subscribe({
      next: (data) => {
        this.plan.set(data);
        this.generating.set(false);
        this.showSuccess.set(true);
        setTimeout(() => this.showSuccess.set(false), 2500);
      },
      error: () => { this.generating.set(false); this.toast.error('Error al generar el plan'); },
    });
  }

  private loadPlan() {
    this.planService.getCurrent().subscribe({
      next: (data) => {
        this.plan.set(data);
        this.loadMealLogs(data);
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
    this.toast.info('Generando nueva receta...');
    this.planService.swapMeal(planId, meal.planMealId).subscribe({
      next: () => {
        this.toast.success('Comida sustituida con éxito');
        this.closeDrawer();
        this.loadPlan();
      },
      error: () => this.toast.error('Error al sustituir la comida'),
    });
  }
}
