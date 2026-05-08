import { Component, OnInit, signal, inject } from '@angular/core';
import { ProgressService } from '../../services/progress.service';
import { ProgressSummaryDto, WeightEntryDto, CheckinDayDto, WeeklyMacrosDto } from '../../models/progress.models';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [],
  template: `
  <div class="page">
    <div class="page-header">
      <div class="page-brand">
        <svg class="leaf-icon" viewBox="0 0 24 24"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>
        NutriCasa
      </div>
      <div class="page-actions">
        <button class="icon-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
        </button>
      </div>
    </div>

    @if (summary(); as s) {
      <div class="progress-hero">
        <div class="progress-eyebrow">Tu progreso</div>
        <h1 class="progress-title">
          <span class="italic">{{ s.streakDays }}</span> días de racha
        </h1>
        <div class="progress-meta">Desde el {{ s.startDate }} · {{ s.overallAdherence }}% de adherencia</div>
      </div>

      <div class="weight-card">
        <div class="weight-header">
          <span class="weight-label">Peso corporal</span>
          <span class="weight-change">{{ s.weightChange > 0 ? '+' : '' }}{{ s.weightChange }} kg</span>
        </div>
        <div class="weight-value">{{ s.currentWeight }} <span class="small">kg</span></div>

        <div class="chart">
          @for (bar of weightBars(); track $index) {
            <div class="chart-bar-wrap">
              <div class="chart-bar" [style.height.%]="bar.heightPercent" [style.background]="bar.color"></div>
              <div class="chart-label">{{ bar.date }}</div>
            </div>
          }
        </div>

        <div class="weight-footer">
          <div class="weight-compare">
            <span>Inicio: <strong>{{ s.startWeight }} kg</strong></span>
            <span>Actual: <strong>{{ s.currentWeight }} kg</strong></span>
            <span>Meta: <strong>{{ s.goalWeight }} kg</strong></span>
          </div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon stat-icon-green">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <div class="stat-num">{{ s.weeklyAdherence }}%</div>
          <div class="stat-desc">Adherencia semanal</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-blue">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
          </div>
          <div class="stat-num">{{ s.streakDays }}</div>
          <div class="stat-desc">Días consecutivos</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon stat-icon-coral">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="M16.5 7.5L12 12l4.5 4.5"/><path d="M7.5 7.5L12 12l-4.5 4.5"/></svg>
          </div>
          <div class="stat-num">{{ s.checkinsCompleted }}/{{ s.totalCheckins }}</div>
          <div class="stat-desc">Check-ins completados</div>
        </div>
      </div>

      <div class="checkin-heatmap">
        <div class="section-head">
          <h2 class="section-title">Check-ins</h2>
          <span class="section-badge">Últimos 30 días</span>
        </div>
        <div class="heatmap-grid">
          @for (day of heatmapDays(); track $index) {
            <div class="heat-day" [class]="'heat-' + day.level" [title]="day.date"></div>
          }
        </div>
        <div class="heatmap-legend">
          <span>Sin registro</span>
          <span class="heat-sample heat-0"></span>
          <span class="heat-sample heat-1"></span>
          <span class="heat-sample heat-2"></span>
          <span class="heat-sample heat-3"></span>
          <span>Completado</span>
        </div>
      </div>

      @if (weeklyMacros(); as m) {
        <div class="macro-card">
          <div class="section-head">
            <h2 class="section-title">Macros promedio</h2>
            <span class="section-badge">Esta semana</span>
          </div>
          <div class="macro-rows">
            <div class="macro-row">
              <div class="macro-row-label">
                <span>Calorías</span>
                <span class="macro-row-val">{{ fmt(m.calories.current) }} / {{ fmt(m.calories.goal) }}</span>
              </div>
              <div class="macro-row-bar"><div class="macro-row-fill" [style.width.%]="macroPercent(m.calories)"></div></div>
            </div>
            <div class="macro-row">
              <div class="macro-row-label">
                <span>Proteína</span>
                <span class="macro-row-val">{{ m.protein.current }} / {{ m.protein.goal }} g</span>
              </div>
              <div class="macro-row-bar"><div class="macro-row-fill protein" [style.width.%]="macroPercent(m.protein)"></div></div>
            </div>
            <div class="macro-row">
              <div class="macro-row-label">
                <span>Grasa</span>
                <span class="macro-row-val">{{ m.fat.current }} / {{ m.fat.goal }} g</span>
              </div>
              <div class="macro-row-bar"><div class="macro-row-fill fat" [style.width.%]="macroPercent(m.fat)"></div></div>
            </div>
            <div class="macro-row">
              <div class="macro-row-label">
                <span>Carbs</span>
                <span class="macro-row-val">{{ m.carbs.current }} / {{ m.carbs.goal }} g</span>
              </div>
              <div class="macro-row-bar"><div class="macro-row-fill carbs" [style.width.%]="macroPercent(m.carbs)"></div></div>
            </div>
          </div>
        </div>
      }
    }
  </div>

  `,
  styles: [`
    :host { display: contents; }
    .page {
      max-width: 480px; margin: 0 auto;
      padding: 0 20px 120px;
      background: var(--cream);
      position: relative; z-index: 1;
    }
    .page-header {
      padding: 24px 0 20px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .page-brand {
      font-family: var(--display); font-size: 22px; font-weight: 500;
      color: var(--pine);
      display: flex; align-items: center; gap: 8px;
    }
    .page-brand svg { width: 22px; height: 22px; fill: var(--mint); }
    .page-actions { display: flex; gap: 10px; }
    .icon-btn {
      width: 42px; height: 42px;
      background: var(--paper); border-radius: var(--r-pill);
      display: flex; align-items: center; justify-content: center;
      color: var(--ink); box-shadow: var(--shadow-sm);
    }

    .progress-hero { margin-bottom: 24px; }
    .progress-eyebrow {
      font-size: 12px; font-weight: 600; letter-spacing: 0.16em;
      text-transform: uppercase; color: var(--mint); margin-bottom: 8px;
    }
    .progress-title {
      font-family: var(--display); font-size: 32px; font-weight: 400;
      line-height: 1.15; letter-spacing: -0.02em; color: var(--ink);
    }
    .progress-title .italic { font-style: italic; color: var(--pine); }
    .progress-meta { font-size: 13px; color: var(--ink-light); margin-top: 8px; }

    .weight-card {
      background: var(--paper); border: 1px solid var(--line);
      border-radius: var(--r-xl); padding: 20px;
      margin-bottom: 20px;
    }
    .weight-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 4px;
    }
    .weight-label { font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--ink-muted); }
    .weight-change { font-size: 13px; font-weight: 700; color: var(--mint); }
    .weight-value {
      font-family: var(--display); font-size: 36px; font-weight: 500;
      color: var(--ink); letter-spacing: -0.02em; margin-bottom: 20px;
    }
    .weight-value .small { font-size: 18px; color: var(--ink-light); }
    .chart {
      display: flex; align-items: flex-end; gap: 6px;
      height: 120px; margin-bottom: 16px;
    }
    .chart-bar-wrap {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; height: 100%;
      justify-content: flex-end;
    }
    .chart-bar {
      width: 100%; max-width: 28px;
      border-radius: 6px 6px 0 0;
      transition: height 0.6s var(--ease-out);
    }
    .chart-label {
      font-size: 9px; color: var(--ink-muted);
      margin-top: 6px;
    }
    .weight-footer { border-top: 1px solid var(--line); padding-top: 14px; }
    .weight-compare {
      display: flex; justify-content: space-between;
      font-size: 12px; color: var(--ink-muted);
    }
    .weight-compare strong { color: var(--ink); }

    .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
    .stat-card {
      background: var(--paper); border: 1px solid var(--line);
      border-radius: var(--r-lg); padding: 16px;
      display: flex; flex-direction: column; align-items: center; text-align: center;
    }
    .stat-icon {
      width: 36px; height: 36px; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 8px;
    }
    .stat-icon-green { background: var(--mint-soft); color: var(--pine); }
    .stat-icon-blue { background: var(--lake-light); color: var(--lake); }
    .stat-icon-coral { background: var(--coral-bg); color: var(--coral); }
    .stat-num {
      font-family: var(--display); font-size: 22px; font-weight: 500;
      color: var(--ink); line-height: 1;
    }
    .stat-desc { font-size: 10px; color: var(--ink-muted); font-weight: 600; letter-spacing: 0.04em; margin-top: 4px; }

    .section-head {
      display: flex; justify-content: space-between;
      align-items: baseline; margin-bottom: 16px;
    }
    .section-title {
      font-family: var(--display); font-size: 20px; font-weight: 400;
      letter-spacing: -0.01em; color: var(--ink);
    }
    .section-badge { font-size: 11px; font-weight: 600; color: var(--ink-muted); }

    .checkin-heatmap {
      background: var(--paper); border: 1px solid var(--line);
      border-radius: var(--r-xl); padding: 20px;
      margin-bottom: 20px;
    }
    .heatmap-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 4px;
      margin-bottom: 12px;
    }
    .heat-day {
      aspect-ratio: 1;
      border-radius: 4px;
      background: var(--cream-warm);
    }
    .heat-0 { background: var(--cream-warm); }
    .heat-1 { background: var(--mint-soft); }
    .heat-2 { background: var(--mint-light); }
    .heat-3 { background: var(--mint); }
    .heatmap-legend {
      display: flex; align-items: center; gap: 4px;
      font-size: 10px; color: var(--ink-muted);
      justify-content: flex-end;
    }
    .heat-sample {
      width: 12px; height: 12px; border-radius: 3px;
    }

    .macro-card {
      background: var(--paper); border: 1px solid var(--line);
      border-radius: var(--r-xl); padding: 20px;
      margin-bottom: 32px;
    }
    .macro-rows { display: flex; flex-direction: column; gap: 14px; }
    .macro-row-label {
      display: flex; justify-content: space-between;
      font-size: 12px; color: var(--ink-light); margin-bottom: 4px;
    }
    .macro-row-val { font-weight: 600; color: var(--ink); }
    .macro-row-bar { height: 6px; background: var(--cream-warm); border-radius: 6px; overflow: hidden; }
    .macro-row-fill { height: 100%; border-radius: 6px; background: var(--lake); }
    .macro-row-fill.protein { background: var(--lake); }
    .macro-row-fill.fat { background: var(--mint); }
    .macro-row-fill.carbs { background: var(--coral); }

    .page-header { animation: slideDown 0.5s var(--ease-out); }
    .progress-hero { animation: slideUp 0.7s var(--ease-out) 0.05s both; }
    .weight-card { animation: slideUp 0.7s var(--ease-out) 0.1s both; }
    .stats-grid { animation: slideUp 0.7s var(--ease-out) 0.15s both; }
    .checkin-heatmap { animation: slideUp 0.7s var(--ease-out) 0.2s both; }
    .macro-card { animation: slideUp 0.7s var(--ease-out) 0.25s both; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ProgressPage implements OnInit {
  private readonly progressService = inject(ProgressService);

  readonly summary = signal<ProgressSummaryDto | null>(null);
  readonly weightBars = signal<WeightEntryDto[]>([]);
  readonly heatmapDays = signal<CheckinDayDto[]>([]);
  readonly weeklyMacros = signal<WeeklyMacrosDto | null>(null);

  ngOnInit(): void {
    this.progressService.getSummary().subscribe(s => this.summary.set(s));
    this.progressService.getWeightHistory().subscribe(b => this.weightBars.set(b));
    this.progressService.getCheckins().subscribe(d => this.heatmapDays.set(d));
    this.progressService.getWeeklyMacros().subscribe(m => this.weeklyMacros.set(m));
  }

  macroPercent(macro: { current: number; goal: number }): number {
    if (!macro.goal) return 0;
    return Math.min(Math.round((macro.current / macro.goal) * 100), 100);
  }

  fmt(value: number): string {
    return Math.round(value).toLocaleString('es-MX');
  }
}
