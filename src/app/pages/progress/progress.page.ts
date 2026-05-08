import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [RouterLink],
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

    <div class="progress-hero">
      <div class="progress-eyebrow">Tu progreso</div>
      <h1 class="progress-title">
        <span class="italic">12 días</span> de racha
      </h1>
      <div class="progress-meta">Desde el 26 de abril · 87% de adherencia</div>
    </div>

    <div class="weight-card">
      <div class="weight-header">
        <span class="weight-label">Peso corporal</span>
        <span class="weight-change">-1.2 kg</span>
      </div>
      <div class="weight-value">{{ lastWeight }} <span class="small">kg</span></div>

      <div class="chart">
        @for (bar of weightBars(); track bar.label) {
          <div class="chart-bar-wrap">
            <div class="chart-bar" [style.height.%]="bar.height" [style.background]="bar.color"></div>
            <div class="chart-label">{{ bar.label }}</div>
          </div>
        }
      </div>

      <div class="weight-footer">
        <div class="weight-compare">
          <span>Inicio: <strong>87.4 kg</strong></span>
          <span>Actual: <strong>{{ lastWeight }} kg</strong></span>
          <span>Meta: <strong>75.0 kg</strong></span>
        </div>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon stat-icon-green">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </div>
        <div class="stat-num">87%</div>
        <div class="stat-desc">Adherencia semanal</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-blue">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>
        </div>
        <div class="stat-num">12</div>
        <div class="stat-desc">Días consecutivos</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon stat-icon-coral">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="M16.5 7.5L12 12l4.5 4.5"/><path d="M7.5 7.5L12 12l-4.5 4.5"/></svg>
        </div>
        <div class="stat-num">11/12</div>
        <div class="stat-desc">Check-ins completados</div>
      </div>
    </div>

    <div class="checkin-heatmap">
      <div class="section-head">
        <h2 class="section-title">Check-ins</h2>
        <span class="section-badge">Últimos 30 días</span>
      </div>
      <div class="heatmap-grid">
        @for (day of heatmap(); track day.label) {
          <div class="heat-day" [class]="'heat-' + day.level" [title]="day.label"></div>
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

    <div class="macro-card">
      <div class="section-head">
        <h2 class="section-title">Macros promedio</h2>
        <span class="section-badge">Esta semana</span>
      </div>
      <div class="macro-rows">
        <div class="macro-row">
          <div class="macro-row-label">
            <span>Calorías</span>
            <span class="macro-row-val">1,860 / 2,180</span>
          </div>
          <div class="macro-row-bar"><div class="macro-row-fill" style="width:85%"></div></div>
        </div>
        <div class="macro-row">
          <div class="macro-row-label">
            <span>Proteína</span>
            <span class="macro-row-val">138 / 145 g</span>
          </div>
          <div class="macro-row-bar"><div class="macro-row-fill protein" style="width:95%"></div></div>
        </div>
        <div class="macro-row">
          <div class="macro-row-label">
            <span>Grasa</span>
            <span class="macro-row-val">152 / 165 g</span>
          </div>
          <div class="macro-row-bar"><div class="macro-row-fill fat" style="width:92%"></div></div>
        </div>
        <div class="macro-row">
          <div class="macro-row-label">
            <span>Carbs</span>
            <span class="macro-row-val">18 / 25 g</span>
          </div>
          <div class="macro-row-bar"><div class="macro-row-fill carbs" style="width:72%"></div></div>
        </div>
      </div>
    </div>
  </div>

  <nav class="bottom-nav">
    <a routerLink="/dashboard" class="nav-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
      Hoy
    </a>
    <a routerLink="/plan" class="nav-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      Plan
    </a>
    <a routerLink="/family" class="nav-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      Familia
    </a>
    <a class="nav-item active">
      <svg viewBox="0 0 24 24" fill="currentColor"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
      Avances
    </a>
    <a routerLink="/profile" class="nav-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      Yo
    </a>
  </nav>
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

    .bottom-nav {
      position: fixed; bottom: 0; left: 50%;
      transform: translateX(-50%);
      width: calc(100% - 32px);
      max-width: 448px;
      background: var(--pine);
      border-radius: var(--r-pill);
      margin: 16px;
      padding: 8px;
      display: flex;
      justify-content: space-around;
      z-index: 100;
      box-shadow: var(--shadow-pine);
    }
    .nav-item {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; gap: 4px;
      padding: 10px 0;
      color: rgba(248,244,236,0.55);
      font-size: 10px; font-weight: 600;
      letter-spacing: 0.06em; text-transform: uppercase;
      border-radius: var(--r-pill);
      cursor: pointer;
    }
    .nav-item.active { background: var(--mint); color: var(--pine-darker); }
    .nav-item svg { width: 20px; height: 20px; }

    .page-header { animation: slideDown 0.5s var(--ease-out); }
    .progress-hero { animation: slideUp 0.7s var(--ease-out) 0.05s both; }
    .weight-card { animation: slideUp 0.7s var(--ease-out) 0.1s both; }
    .stats-grid { animation: slideUp 0.7s var(--ease-out) 0.15s both; }
    .checkin-heatmap { animation: slideUp 0.7s var(--ease-out) 0.2s both; }
    .macro-card { animation: slideUp 0.7s var(--ease-out) 0.25s both; }
    .bottom-nav { animation: slideUp 0.5s var(--ease-out) 0.3s both; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ProgressPage {
  readonly lastWeight = '86.2';

  readonly weightBars = signal([
    { label: '26 abr', height: 95, color: 'var(--mint)' },
    { label: '28 abr', height: 93, color: 'var(--mint)' },
    { label: '30 abr', height: 91, color: 'var(--mint-light)' },
    { label: '2 may', height: 89, color: 'var(--mint-light)' },
    { label: '4 may', height: 87, color: 'var(--mint)' },
    { label: '6 may', height: 85, color: 'var(--lake)' },
    { label: '8 may', height: 83, color: 'var(--lake)' },
  ]);

  get heatmap() {
    return () => {
      const days: { label: string; level: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const label = d.toLocaleDateString('es-MX', { weekday: 'short' });
        const level = i < 12 ? (i % 3 === 0 ? 3 : i % 2 === 0 ? 2 : 1) : 0;
        days.push({ label, level });
      }
      return days;
    };
  }
}
