import { Component, input } from '@angular/core';

@Component({
  selector: 'nc-badge',
  standalone: true,
  template: `<span class="badge" [class]="'badge--' + variant()">{{ label() }}</span>`,
  styles: [`
    :host { display: contents; }
    .badge { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: var(--r-pill); letter-spacing: 0.04em; text-transform: uppercase; white-space: nowrap; }
    .badge--success { background: var(--mint-soft); color: var(--pine); }
    .badge--warning { background: var(--cream-warm); color: var(--gold); }
    .badge--error { background: var(--coral-bg); color: var(--coral); }
    .badge--info { background: var(--lake-light); color: var(--lake); }
    .badge--neutral { background: var(--line); color: var(--ink-muted); }
  `]
})
export class NcBadgeComponent {
  readonly label = input.required<string>();
  readonly variant = input<'success' | 'warning' | 'error' | 'info' | 'neutral'>('neutral');
}
