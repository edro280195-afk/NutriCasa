import { Component, input, computed, signal } from '@angular/core';

export interface WeightChartPoint {
  date: string;
  weightKg: number;
}

@Component({
  selector: 'nc-weight-chart',
  standalone: true,
  template: `
    @if (points().length < 2) {
      <div class="empty">Registra al menos 2 mediciones para ver la gráfica</div>
    } @else {
      <svg [attr.viewBox]="'0 0 ' + (chartWidth + padLeft + padRight) + ' ' + (chartHeight + padTop + padBottom)"
        class="chart-svg" (mousemove)="onMouseMove($event)" (mouseleave)="tooltipIndex.set(-1)">

        <!-- Línea meta -->
        @if (targetWeight()) {
          <line
            [attr.x1]="padLeft" [attr.y1]="targetY()" [attr.x2]="padLeft + chartWidth" [attr.y2]="targetY()"
            stroke="var(--mint)" stroke-width="1.5" stroke-dasharray="6,4" />
          <text [attr.x]="padLeft + chartWidth + 4" [attr.y]="targetY() + 4" fill="var(--mint)" font-size="10">{{ targetWeight() }} kg</text>
        }

        <!-- Eje Y (labels) -->
        @for (label of yLabels(); track label.value) {
          <text [attr.x]="padLeft - 8" [attr.y]="label.y" text-anchor="end" fill="var(--ink-muted)" font-size="9">{{ label.text }}</text>
          <line [attr.x1]="padLeft" [attr.y1]="label.y" [attr.x2]="padLeft + chartWidth" [attr.y2]="label.y"
            stroke="var(--line)" stroke-width="1" stroke-dasharray="3,3" />
        }

        <!-- Línea de datos -->
        <polyline
          [attr.points]="linePoints()"
          fill="none" stroke="var(--pine)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />

        <!-- Puntos de datos -->
        @for (pt of pointCircles(); track pt.index) {
          <circle
            [attr.cx]="pt.x" [attr.cy]="pt.y" r="5"
            fill="var(--paper)" stroke="var(--pine)" stroke-width="2.5"
            (mouseenter)="tooltipIndex.set(pt.index)"
            style="cursor:pointer" />
          <circle
            [attr.cx]="pt.x" [attr.cy]="pt.y" r="8"
            fill="transparent"
            (mouseenter)="tooltipIndex.set(pt.index)"
            style="cursor:pointer" />
        }

        <!-- Tooltip -->
        @if (activePoint(); as tp) {
          <g>
            <rect [attr.x]="tp.tooltipX" [attr.y]="tp.tooltipY - 34" width="80" height="28" rx="6"
              fill="var(--ink)" />
            <text [attr.x]="tp.tooltipX + 40" [attr.y]="tp.tooltipY - 16" text-anchor="middle"
              fill="var(--cream)" font-size="11" font-weight="600">
              {{ tp.weight }} kg
            </text>
            <text [attr.x]="tp.tooltipX + 40" [attr.y]="tp.tooltipY - 5" text-anchor="middle"
              fill="var(--cream)" font-size="8" opacity="0.7">
              {{ tp.date }}
            </text>
          </g>
        }
      </svg>
    }
  `,
  styles: [`
    .chart-svg { width: 100%; height: auto; display: block; }
    .empty { text-align: center; padding: 40px 20px; color: var(--ink-muted); font-size: 13px; }
  `]
})
export class NcWeightChartComponent {
  readonly points = input<WeightChartPoint[]>([]);
  readonly targetWeight = input<number>(0);

  readonly tooltipIndex = signal(-1);

  readonly padLeft = 40;
  readonly padRight = 20;
  readonly padTop = 16;
  readonly padBottom = 24;
  readonly chartWidth = 300;
  readonly chartHeight = 160;

  readonly minW = computed(() => {
    const vals = this.points().map(p => p.weightKg);
    return Math.min(...vals) - 2;
  });
  readonly maxW = computed(() => {
    const vals = this.points().map(p => p.weightKg);
    return Math.max(...vals) + 1;
  });

  readonly yLabels = computed(() => {
    const min = this.minW();
    const max = this.maxW();
    const range = max - min;
    const step = Math.max(1, Math.round(range / 4));
    const labels: { value: number; text: string; y: number }[] = [];
    for (let v = min; v <= max; v += step) {
      const y = this.padTop + this.chartHeight - ((v - min) / range) * this.chartHeight;
      labels.push({ value: v, text: v.toFixed(1), y });
    }
    return labels;
  });

  readonly scaleY = computed(() => {
    return (w: number) => this.padTop + this.chartHeight - ((w - this.minW()) / (this.maxW() - this.minW())) * this.chartHeight;
  });

  readonly scaleX = computed(() => {
    const n = this.points().length;
    return (i: number) => this.padLeft + (n > 1 ? (i / (n - 1)) * this.chartWidth : this.chartWidth / 2);
  });

  readonly pointCircles = computed(() => {
    const sx = this.scaleX();
    const sy = this.scaleY();
    return this.points().map((p, i) => ({ index: i, x: sx(i), y: sy(p.weightKg) }));
  });

  readonly linePoints = computed(() => {
    const sx = this.scaleX();
    const sy = this.scaleY();
    return this.points().map((p, i) => `${sx(i)},${sy(p.weightKg)}`).join(' ');
  });

  readonly activePoint = computed(() => {
    const idx = this.tooltipIndex();
    if (idx < 0 || idx >= this.points().length) return null;
    const p = this.points()[idx];
    const sx = this.scaleX();
    const sy = this.scaleY();
    const x = sx(idx);
    return {
      index: idx,
      x,
      y: sy(p.weightKg),
      weight: p.weightKg,
      date: p.date,
      tooltipX: Math.max(this.padLeft + 40, Math.min(x, this.padLeft + this.chartWidth - 40)),
      tooltipY: sy(p.weightKg),
    };
  });

  readonly targetY = computed(() => {
    const t = this.targetWeight();
    if (!t) return 0;
    return this.scaleY()(t);
  });

  onMouseMove(event: MouseEvent) {
    const svg = event.currentTarget as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const svgX = (x / rect.width) * (this.chartWidth + this.padLeft + this.padRight);
    const sx = this.scaleX();
    let closest = 0;
    let closestDist = Infinity;
    const len = this.points().length;
    for (let i = 0; i < len; i++) {
      const dist = Math.abs(sx(i) - svgX);
      if (dist < closestDist) { closestDist = dist; closest = i; }
    }
    if (closestDist < 20) this.tooltipIndex.set(closest);
    else this.tooltipIndex.set(-1);
  }
}
