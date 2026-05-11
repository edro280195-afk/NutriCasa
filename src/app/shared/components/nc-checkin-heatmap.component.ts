import { Component, input, computed } from '@angular/core';

export interface HeatmapDay {
  date: string;
  level: number;
}

@Component({
  selector: 'nc-checkin-heatmap',
  standalone: true,
  template: `
    <div class="heatmap">
      <div class="heatmap-months">
        @for (m of months(); track m.label) {
          <span class="month-label" [style.grid-column]="m.startCol + ' / span ' + m.span">{{ m.label }}</span>
        }
      </div>
      <div class="heatmap-grid">
        @for (day of days(); track day.key) {
          <div class="heat-cell" [class]="'h-' + day.level" [title]="day.date + ': ' + day.tooltip"></div>
        }
      </div>
      <div class="heatmap-legend">
        <span>Sin registro</span>
        <span class="h-sample h-0"></span>
        <span class="h-sample h-1"></span>
        <span class="h-sample h-2"></span>
        <span class="h-sample h-3"></span>
        <span>Completado</span>
        @if (todayIndex(); as idx) {
          <span class="today-indicator">Hoy</span>
        }
      </div>
    </div>
  `,
  styles: [`
    .heatmap { margin-bottom: 8px; }
    .heatmap-months { display: grid; grid-template-columns: repeat(12, 1fr); gap: 3px; margin-bottom: 4px; font-size: 9px; color: var(--ink-muted); font-weight: 600; }
    .month-label { text-transform: uppercase; letter-spacing: 0.1em; }
    .heatmap-grid { display: grid; grid-template-columns: repeat(12, 1fr); gap: 3px; }
    .heat-cell { aspect-ratio: 1; border-radius: 3px; min-width: 10px; min-height: 10px; background: var(--cream-warm); }
    .heat-cell.h-0 { background: var(--cream-warm); }
    .heat-cell.h-1 { background: var(--mint-soft); }
    .heat-cell.h-2 { background: var(--mint-light); }
    .heat-cell.h-3 { background: var(--mint); }
    .heat-cell.today { outline: 2px solid var(--pine); outline-offset: -1px; border-radius: 3px; }
    .heatmap-legend { display: flex; align-items: center; gap: 3px; margin-top: 8px; font-size: 9px; color: var(--ink-muted); justify-content: flex-end; }
    .h-sample { width: 10px; height: 10px; border-radius: 2px; }
    .h-sample.h-0 { background: var(--cream-warm); }
    .h-sample.h-1 { background: var(--mint-soft); }
    .h-sample.h-2 { background: var(--mint-light); }
    .h-sample.h-3 { background: var(--mint); }
    .today-indicator { margin-left: 8px; font-weight: 700; color: var(--pine); font-size: 9px; }
  `]
})
export class NcCheckinHeatmapComponent {
  readonly data = input<HeatmapDay[]>([]);

  readonly days = computed(() => {
    const items = this.data();
    if (!items.length) return [];

    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const lastDay = new Date(today);
    const firstDay = new Date(today);
    firstDay.setDate(firstDay.getDate() - 83);

    const result: { key: string; date: string; level: number; tooltip: string; isToday: boolean }[] = [];
    const dayMap = new Map<string, number>();
    for (const d of items) dayMap.set(d.date, d.level);

    for (let i = 0; i < 84; i++) {
      const d = new Date(firstDay);
      d.setDate(firstDay.getDate() + i);
      const key = d.toISOString().split('T')[0];
      const level = dayMap.get(key) ?? 0;
      result.push({
        key,
        date: `${d.getDate()} ${monthNames[d.getMonth()]}`,
        level,
        tooltip: level > 0 ? 'Completado' : 'Sin registro',
        isToday: key === todayStr,
      });
    }
    return result;
  });

  readonly months = computed(() => {
    const items = this.data();
    if (!items.length) return [];
    const today = new Date();
    const firstDay = new Date(today);
    firstDay.setDate(firstDay.getDate() - 83);
    const monthLabels: { label: string; startCol: number; span: number }[] = [];
    let currentMonth = -1;
    let startCol = 1;
    for (let i = 0; i < 12; i++) {
      const d = new Date(firstDay);
      d.setDate(firstDay.getDate() + i * 7);
      const m = d.getMonth();
      if (m !== currentMonth) {
        if (currentMonth >= 0) monthLabels[monthLabels.length - 1].span = i - startCol + 1;
        currentMonth = m;
        startCol = i + 1;
        monthLabels.push({ label: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][m], startCol, span: 1 });
      } else {
        monthLabels[monthLabels.length - 1].span = i - startCol + 2;
      }
    }
    return monthLabels;
  });

  readonly todayIndex = computed(() => {
    const items = this.data();
    if (!items.length) return 0;
    return 83; // last cell is today
  });
}
