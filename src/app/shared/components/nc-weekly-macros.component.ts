import { Component, input, computed } from '@angular/core';

export interface DayMacroBars {
  dayName: string;
  protein: number;
  fat: number;
  carbs: number;
  calories: number;
}

@Component({
  selector: 'nc-weekly-macros',
  standalone: true,
  template: `
    <div class="macros-chart">
      <div class="bars-container">
        @for (day of days(); track day.dayName) {
          <div class="bar-column">
            <div class="bars-stack">
              @let total = day.protein + day.fat + day.carbs;
              @if (total > 0) {
                <div class="bar-segment bar-protein" [style.height.%]="(day.protein / total) * 100" title="Proteína {{ day.protein }}g"></div>
                <div class="bar-segment bar-fat" [style.height.%]="(day.fat / total) * 100" title="Grasa {{ day.fat }}g"></div>
                <div class="bar-segment bar-carbs" [style.height.%]="(day.carbs / total) * 100" title="Carbs {{ day.carbs }}g"></div>
              } @else {
                <div class="bar-segment bar-empty"></div>
              }
              <div class="bar-cal-overlay">{{ day.calories }}</div>
            </div>
            <div class="bar-label">{{ day.dayName }}</div>
          </div>
        }
      </div>
      <div class="macros-legend">
        <span class="legend-item"><span class="legend-dot dot-protein"></span>Proteína</span>
        <span class="legend-item"><span class="legend-dot dot-fat"></span>Grasa</span>
        <span class="legend-item"><span class="legend-dot dot-carbs"></span>Carbs</span>
      </div>
    </div>
  `,
  styles: [`
    .macros-chart { }
    .bars-container { display: flex; gap: 6px; align-items: flex-end; height: 140px; }
    .bar-column { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
    .bars-stack { width: 100%; max-width: 36px; border-radius: 6px 6px 0 0; overflow: hidden; display: flex; flex-direction: column; position: relative; }
    .bar-segment { width: 100%; transition: height 0.6s var(--ease-out); }
    .bar-protein { background: var(--lake); }
    .bar-fat { background: var(--mint); }
    .bar-carbs { background: var(--coral); }
    .bar-empty { background: var(--cream-warm); height: 100%; }
    .bar-cal-overlay { position: absolute; bottom: -18px; left: 0; right: 0; text-align: center; font-size: 9px; color: var(--ink-muted); font-weight: 600; }
    .bar-label { font-size: 10px; color: var(--ink-muted); font-weight: 600; margin-top: 22px; text-align: center; }
    .macros-legend { display: flex; justify-content: center; gap: 16px; margin-top: 16px; }
    .legend-item { display: inline-flex; align-items: center; gap: 6px; font-size: 11px; color: var(--ink-light); }
    .legend-dot { width: 8px; height: 8px; border-radius: 2px; }
    .dot-protein { background: var(--lake); }
    .dot-fat { background: var(--mint); }
    .dot-carbs { background: var(--coral); }
  `]
})
export class NcWeeklyMacrosComponent {
  readonly days = input<DayMacroBars[]>([]);
}
