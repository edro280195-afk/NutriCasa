import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'nc-adherence-ring',
  standalone: true,
  template: `
    <div class="ring-wrap">
      <svg [attr.viewBox]="'0 0 ' + size + ' ' + size" class="ring-svg">
        <!-- Círculo de fondo -->
        <circle
          [attr.cx]="half" [attr.cy]="half"
          [attr.r]="radius"
          fill="none"
          [attr.stroke]="bgColor"
          stroke-width="8" />
        <!-- Círculo de progreso -->
        <circle
          [attr.cx]="half" [attr.cy]="half"
          [attr.r]="radius"
          fill="none"
          [attr.stroke]="ringColor()"
          stroke-width="8"
          stroke-linecap="round"
          [attr.stroke-dasharray]="circumference"
          [attr.stroke-dashoffset]="dashOffset()"
          [attr.transform]="'rotate(-90, ' + half + ', ' + half + ')'"
          class="progress-ring" />
      </svg>
      <div class="ring-center">
        <span class="ring-value">{{ displayPercent() }}%</span>
        <span class="ring-label">Adherencia</span>
      </div>
    </div>
  `,
  styles: [`
    .ring-wrap { position: relative; width: 120px; height: 120px; margin: 0 auto; }
    .ring-svg { width: 100%; height: 100%; }
    .progress-ring { transition: stroke-dashoffset 1s var(--ease-out); }
    .ring-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .ring-value { font-family: var(--display); font-size: 28px; font-weight: 500; color: var(--ink); line-height: 1; }
    .ring-label { font-size: 10px; color: var(--ink-muted); font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; margin-top: 4px; }
  `]
})
export class NcAdherenceRingComponent {
  readonly percent = input(0);
  readonly size = 120;
  readonly half = this.size / 2;
  readonly radius = 48;
  readonly circumference = 2 * Math.PI * this.radius;
  readonly bgColor = 'var(--cream-warm)';

  readonly dashOffset = computed(() => {
    return this.circumference - (this.percent() / 100) * this.circumference;
  });

  readonly ringColor = computed(() => {
    const p = this.percent();
    if (p >= 80) return 'var(--mint)';
    if (p >= 50) return 'var(--gold)';
    return 'var(--coral)';
  });

  readonly displayPercent = computed(() => Math.round(this.percent()));
}
