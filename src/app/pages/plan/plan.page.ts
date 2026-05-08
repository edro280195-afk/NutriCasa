import { Component, inject, signal, computed } from '@angular/core';
import { PlanService } from '../../services/plan.service';
import { LottieAnimationComponent } from '../../components/lottie-animation/lottie-animation.component';
import type { PlanGenerationResult, DayPlanDto } from '../../models/plan.models';


@Component({
  selector: 'app-plan',
  standalone: true,
  imports: [LottieAnimationComponent],
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
          <button class="day-tab" [class.active]="selectedDay() === i" (click)="selectedDay.set(i)">
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

        <div class="meals">
          @for (meal of day.meals; track meal.planMealId) {
            <div class="meal">
              <div class="meal-thumb" [class]="'meal-thumb-' + getMealColor(meal.mealType)">
                <svg viewBox="0 0 24 24"><path d="M12 2L8 6h2v8H6l4 4 4-4h-4V6h2L12 2z M3 22h18v-2H3v2z"/></svg>
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
            </div>
          }
        </div>
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

  `,
  styles: [`
    :host { display: contents; }
    .dash { max-width: 480px; margin: 0 auto; padding: 0 20px 140px; background: var(--cream); position: relative; z-index: 1; }
    .dash-header { padding: 24px 0 20px; display: flex; align-items: center; justify-content: space-between; }
    .dash-brand { font-family: var(--display); font-size: 22px; font-weight: 500; color: var(--pine); display: flex; align-items: center; gap: 8px; }
    .dash-brand svg { width: 22px; height: 22px; fill: var(--mint); }
    .dash-actions { display: flex; gap: 10px; }
    .icon-btn { width: 42px; height: 42px; background: var(--paper); border-radius: var(--r-pill); display: flex; align-items: center; justify-content: center; color: var(--ink); box-shadow: var(--shadow-sm); }
    .icon-btn:disabled { opacity: 0.5; }
    .greeting { margin-bottom: 22px; }
    .greeting-eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--mint); margin-bottom: 8px; }
    .greeting-title { font-family: var(--display); font-size: 28px; font-weight: 400; line-height: 1.15; letter-spacing: -0.02em; color: var(--ink); }
    .greeting-title .italic { font-style: italic; color: var(--pine); }
    .greeting-mode { display: inline-flex; align-items: center; gap: 6px; margin-top: 10px; padding: 5px 11px; background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-pill); font-size: 11px; font-weight: 600; color: var(--ink-soft); }
    .loading-state { text-align: center; padding: 60px 20px; }
    .loading-state p { font-size: 15px; color: var(--ink-soft); margin-top: 20px; }
    .spinner-lg { width: 40px; height: 40px; border: 3px solid var(--line); border-top-color: var(--pine); border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .savings-card { display: flex; gap: 14px; align-items: center; background: linear-gradient(135deg, var(--mint-soft), var(--cream-warm)); border: 1px solid var(--mint-light); border-radius: var(--r-lg); padding: 16px; margin-bottom: 20px; }
    .savings-icon { width: 44px; height: 44px; border-radius: 14px; background: var(--pine); color: var(--cream); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .savings-text { font-size: 13px; color: var(--ink-soft); }
    .savings-text strong { display: block; font-size: 14px; color: var(--ink); }
    .savings-amount { font-family: var(--display); font-size: 24px; font-weight: 500; color: var(--pine); display: block; margin: 2px 0; }
    .day-tabs { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 12px; margin-bottom: 16px; }
    .day-tab { flex-shrink: 0; padding: 10px 14px; border: 1.5px solid var(--line); border-radius: var(--r-pill); background: var(--paper); text-align: center; transition: all 0.2s; }
    .day-tab.active { border-color: var(--pine); background: var(--pine); color: var(--cream); }
    .day-name { display: block; font-size: 12px; font-weight: 600; }
    .day-cal { display: block; font-size: 10px; color: var(--ink-muted); margin-top: 2px; }
    .day-tab.active .day-cal { color: rgba(248,244,236,0.6); }
    .day-macros { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 20px; }
    .dm-item { background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-md); padding: 12px; text-align: center; }
    .dm-label { display: block; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--ink-muted); }
    .dm-value { display: block; font-family: var(--display); font-size: 20px; font-weight: 500; color: var(--ink); margin-top: 2px; }
    .meals { display: flex; flex-direction: column; gap: 12px; }
    .meal { background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 16px; display: flex; gap: 16px; align-items: center; }
    .meal-thumb { width: 56px; height: 56px; border-radius: var(--r-md); flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
    .meal-thumb-1 { background: linear-gradient(135deg, #F5C7B8, #E8866B); }
    .meal-thumb-2 { background: linear-gradient(135deg, #B5E2CB, #5BC096); }
    .meal-thumb-3 { background: linear-gradient(135deg, #B8DCEC, #5BA3D0); }
    .meal-thumb svg { width: 28px; height: 28px; fill: rgba(255,255,255,0.85); }
    .meal-info { flex: 1; min-width: 0; }
    .meal-time { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--ink-muted); margin-bottom: 4px; }
    .meal-name { font-family: var(--display); font-size: 16px; font-weight: 500; color: var(--ink); margin-bottom: 6px; }
    .meal-macros { display: flex; gap: 10px; font-size: 12px; color: var(--ink-light); }
    .meal-macros span { display: inline-flex; align-items: center; gap: 4px; }
    .meal-macros span::before { content: ''; width: 6px; height: 6px; border-radius: 50%; }
    .meal-macros .kcal::before { background: var(--mint); }
    .meal-macros .prot::before { background: var(--lake); }
    .meal-macros .fat::before { background: var(--coral); }
    .empty-state { text-align: center; padding: 60px 20px; }
    .empty-state h3 { font-family: var(--display); font-size: 22px; font-weight: 400; color: var(--ink); margin: 16px 0 8px; }
    .empty-state p { font-size: 14px; color: var(--ink-light); margin-bottom: 24px; }
    .dash-header { animation: slideDown 0.5s var(--ease-out); }
    .greeting { animation: slideDown 0.6s var(--ease-out) 0.05s both; }
    .savings-card { animation: slideUp 0.7s var(--ease-out) 0.1s both; }
    .day-tabs { animation: slideUp 0.7s var(--ease-out) 0.15s both; }
    .day-macros { animation: slideUp 0.7s var(--ease-out) 0.2s both; }
    .meals { animation: slideUp 0.7s var(--ease-out) 0.25s both; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class PlanPage {
  private readonly planService = inject(PlanService);

  readonly plan = signal<PlanGenerationResult | null>(null);
  readonly generating = signal(false);
  readonly showSuccess = signal(false);
  readonly selectedDay = signal(0);

  constructor() {
    this.loadPlan();
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
      error: () => this.generating.set(false),
    });
  }

  private loadPlan() {
    this.planService.getCurrent().subscribe({
      next: (data) => {
        this.plan.set(data);
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
}
