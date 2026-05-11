import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'nc-macro-bar',
  standalone: true,
  template: `
  <div class="macro">
    <div class="macro-label">
      <span>{{ label() }}</span>
      <span class="macro-val">{{ value() }} / {{ target() }} {{ unit() }}</span>
    </div>
    <div class="macro-track">
      <div class="macro-fill" [style.width.%]="pct()" [class]="'fill--' + color()"></div>
    </div>
    <span class="macro-pct">{{ pct() }}%</span>
  </div>
  `,
  styles: [`
    :host { display: contents; }
    .macro { display: flex; align-items: center; gap: 10px; }
    .macro-label { flex: 1; font-size: 12px; color: var(--ink-light); display: flex; justify-content: space-between; }
    .macro-val { font-weight: 600; color: var(--ink); }
    .macro-track { flex: 0 0 80px; height: 6px; background: var(--cream-warm); border-radius: 6px; overflow: hidden; }
    .macro-fill { height: 100%; border-radius: 6px; transition: width 0.5s var(--ease-out); }
    .fill--mint { background: var(--mint); }
    .fill--lake { background: var(--lake); }
    .fill--coral { background: var(--coral); }
    .macro-pct { font-family: var(--display); font-size: 16px; font-weight: 500; color: var(--ink); min-width: 36px; text-align: right; }
  `]
})
export class NcMacroBarComponent {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly target = input.required<number>();
  readonly unit = input('');
  readonly color = input<'mint' | 'lake' | 'coral'>('mint');
  readonly pct = computed(() => {
    if (!this.target()) return 0;
    return Math.min(Math.round((this.value() / this.target()) * 100), 100);
  });
}
