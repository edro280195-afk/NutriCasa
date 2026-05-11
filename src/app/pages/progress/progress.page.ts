import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { ProgressService } from '../../services/progress.service';
import { PlanService } from '../../services/plan.service';
import type { ProgressSummaryDto, WeightEntryDto, CheckinDayDto, WeeklyMacrosDto } from '../../models/progress.models';
import {
  NcWeightChartComponent,
  NcCheckinHeatmapComponent,
  NcWeeklyMacrosComponent,
  NcAdherenceRingComponent,
  NcLoadingComponent,
} from '../../shared/components';
import type { WeightChartPoint } from '../../shared/components';
import type { DayMacroBars } from '../../shared/components';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [
    NcWeightChartComponent,
    NcCheckinHeatmapComponent,
    NcWeeklyMacrosComponent,
    NcAdherenceRingComponent,
    NcLoadingComponent,
  ],
  template: `
  <div class="page">
    <div class="page-header">
      <div class="page-brand">
        <svg class="leaf-icon" viewBox="0 0 24 24"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>
        NutriCasa
      </div>
    </div>

    @if (!summary()) {
      <nc-loading></nc-loading>
    } @else if (summary(); as s) {
      <div class="progress-hero">
        <div class="progress-eyebrow">Tu progreso</div>
        <h1 class="progress-title">
          <span class="italic">{{ s.streakDays }}</span> días de racha
        </h1>
        <div class="progress-meta">Desde el {{ s.startDate }}</div>
      </div>

      <div class="card">
        <div class="card-head">
          <h2 class="card-title">Peso corporal</h2>
          <span class="card-badge" [class.down]="s.weightChange < 0" [class.up]="s.weightChange >= 0">
            {{ s.weightChange > 0 ? '+' : '' }}{{ s.weightChange }} kg
          </span>
        </div>
        <div class="weight-current">{{ s.currentWeight }} <span class="small">kg</span></div>
        <nc-weight-chart [points]="chartPoints()" [targetWeight]="s.goalWeight" />
        <div class="weight-compare">
          <span>Inicio: <strong>{{ s.startWeight }} kg</strong></span>
          <span>Meta: <strong>{{ s.goalWeight }} kg</strong></span>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <h2 class="card-title">Adherencia</h2>
        </div>
        <nc-adherence-ring [percent]="s.overallAdherence" />
        <div class="adherence-stats">
          <div class="adherence-stat">
            <span class="adherence-num">{{ s.weeklyAdherence }}%</span>
            <span class="adherence-label">Esta semana</span>
          </div>
          <div class="adherence-stat">
            <span class="adherence-num">{{ s.checkinsCompleted }}/{{ s.totalCheckins }}</span>
            <span class="adherence-label">Check-ins</span>
          </div>
          <div class="adherence-stat">
            <span class="adherence-num">{{ s.streakDays }}</span>
            <span class="adherence-label">Racha</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <h2 class="card-title">Check-ins</h2>
          <span class="card-badge">12 semanas</span>
        </div>
        <nc-checkin-heatmap [data]="heatmapData()" />
      </div>

      <div class="card">
        <div class="card-head">
          <h2 class="card-title">Macros por día</h2>
          @if (weeklyMacros(); as m) {
            <span class="card-badge">{{ fmt(m.calories.current) }} / {{ fmt(m.calories.goal) }} kcal</span>
          }
        </div>
        @if (dayMacros().length) {
          <nc-weekly-macros [days]="dayMacros()" />
        } @else if (weeklyMacros(); as m) {
          <div class="macro-avg">
            <p class="macro-avg-title">Promedio semanal</p>
            <div class="macro-avg-grid">
              <div class="macro-avg-item"><span class="ma-label">Calorías</span><span class="ma-val">{{ fmt(m.calories.current) }} / {{ fmt(m.calories.goal) }}</span></div>
              <div class="macro-avg-item"><span class="ma-label">Proteína</span><span class="ma-val">{{ m.protein.current }} / {{ m.protein.goal }} g</span></div>
              <div class="macro-avg-item"><span class="ma-label">Grasa</span><span class="ma-val">{{ m.fat.current }} / {{ m.fat.goal }} g</span></div>
              <div class="macro-avg-item"><span class="ma-label">Carbs</span><span class="ma-val">{{ m.carbs.current }} / {{ m.carbs.goal }} g</span></div>
            </div>
          </div>
        }
      </div>
    }
  </div>
  `,
  styles: [`
    :host { display: contents; }
    .page { max-width: 480px; margin: 0 auto; padding: 0 20px 120px; background: var(--cream); position: relative; z-index: 1; }
    .page-header { padding: 24px 0 20px; display: flex; align-items: center; justify-content: space-between; }
    .page-brand { font-family: var(--display); font-size: 22px; font-weight: 500; color: var(--pine); display: flex; align-items: center; gap: 8px; }
    .page-brand svg { width: 22px; height: 22px; fill: var(--mint); }
    .progress-hero { margin-bottom: 20px; }
    .progress-eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--mint); margin-bottom: 8px; }
    .progress-title { font-family: var(--display); font-size: 32px; font-weight: 400; line-height: 1.15; letter-spacing: -0.02em; color: var(--ink); }
    .progress-title .italic { font-style: italic; color: var(--pine); }
    .progress-meta { font-size: 13px; color: var(--ink-light); margin-top: 8px; }
    .card { background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-xl); padding: 20px; margin-bottom: 20px; }
    .card-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px; }
    .card-title { font-family: var(--display); font-size: 20px; font-weight: 400; letter-spacing: -0.01em; color: var(--ink); margin: 0; }
    .card-badge { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: var(--r-pill); background: var(--cream); color: var(--ink-soft); }
    .card-badge.down { background: var(--mint-soft); color: var(--pine); }
    .card-badge.up { background: var(--coral-bg); color: var(--coral); }
    .weight-current { font-family: var(--display); font-size: 36px; font-weight: 500; color: var(--ink); letter-spacing: -0.02em; margin-bottom: 16px; }
    .weight-current .small { font-size: 18px; color: var(--ink-light); }
    .weight-compare { display: flex; justify-content: space-between; font-size: 12px; color: var(--ink-muted); border-top: 1px solid var(--line); padding-top: 12px; }
    .weight-compare strong { color: var(--ink); }
    .adherence-stats { display: flex; justify-content: center; gap: 24px; margin-top: 12px; }
    .adherence-stat { text-align: center; }
    .adherence-num { display: block; font-family: var(--display); font-size: 18px; font-weight: 500; color: var(--ink); }
    .adherence-label { display: block; font-size: 10px; color: var(--ink-muted); font-weight: 600; letter-spacing: 0.04em; margin-top: 2px; }
    .macro-avg { padding-top: 8px; }
    .macro-avg-title { font-size: 13px; font-weight: 700; color: var(--ink-soft); margin-bottom: 12px; }
    .macro-avg-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .macro-avg-item { display: flex; flex-direction: column; padding: 8px; border: 1px solid var(--line); border-radius: var(--r-md); }
    .ma-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: var(--ink-muted); }
    .ma-val { font-size: 13px; font-weight: 700; color: var(--ink); margin-top: 2px; }
    .page-header { animation: slideDown 0.5s var(--ease-out); }
    .progress-hero { animation: slideUp 0.7s var(--ease-out) 0.05s both; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ProgressPage implements OnInit {
  private readonly progressService = inject(ProgressService);
  private readonly planService = inject(PlanService);

  readonly summary = signal<ProgressSummaryDto | null>(null);
  readonly rawWeightData = signal<WeightEntryDto[]>([]);
  readonly heatmapData = signal<CheckinDayDto[]>([]);
  readonly weeklyMacros = signal<WeeklyMacrosDto | null>(null);
  readonly planDayMacros = signal<DayMacroBars[]>([]);

  readonly chartPoints = computed<WeightChartPoint[]>(() =>
    this.rawWeightData().map(w => ({ date: w.date, weightKg: w.weightKg }))
  );

  readonly dayMacros = computed(() => {
    const fromPlan = this.planDayMacros();
    if (fromPlan.length) return fromPlan;
    const m = this.weeklyMacros();
    if (!m) return [];
    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    return dayNames.map(name => ({
      dayName: name,
      protein: Math.round(m.protein.current / 7),
      fat: Math.round(m.fat.current / 7),
      carbs: Math.round(m.carbs.current / 7),
      calories: Math.round(m.calories.current / 7),
    }));
  });

  ngOnInit(): void {
    this.progressService.getSummary().subscribe(s => this.summary.set(s));
    this.progressService.getWeightHistory().subscribe(w => this.rawWeightData.set(w));
    this.progressService.getCheckins().subscribe(d => this.heatmapData.set(d));
    this.progressService.getWeeklyMacros().subscribe(m => this.weeklyMacros.set(m));

    this.planService.getCurrent().subscribe({
      next: (plan) => {
        const dayNames = ['', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        const bars: DayMacroBars[] = plan.days.map(d => ({
          dayName: dayNames[d.dayNumber] || 'Día',
          protein: d.dayTotals.proteinGr,
          fat: d.dayTotals.fatGr,
          carbs: d.dayTotals.carbsGr,
          calories: d.dayTotals.calories,
        }));
        this.planDayMacros.set(bars);
      },
    });
  }

  fmt(value: number): string {
    return Math.round(value).toLocaleString('es-MX');
  }
}
