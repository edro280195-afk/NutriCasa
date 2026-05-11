import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProgressService } from '../../services/progress.service';
import { NcLoadingComponent, NcPageHeaderComponent } from '../../shared/components';
import type { ProgressSummaryDto } from '../../models/progress.models';

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [RouterLink, NcLoadingComponent, NcPageHeaderComponent],
  template: `
  <div class="page">
    <nc-page-header title="Mis métricas" backLink="/profile"></nc-page-header>

    @if (progress(); as p) {
      <div class="metrics-grid">
        <div class="metric-card highlight">
          <span class="metric-label">Peso actual</span>
          <span class="metric-value">{{ p.currentWeight }} <small>kg</small></span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Peso inicial</span>
          <span class="metric-value">{{ p.startWeight }} <small>kg</small></span>
        </div>
        <div class="metric-card" [class.green]="(p.weightChange || 0) < 0">
          <span class="metric-label">Cambio</span>
          <span class="metric-value">{{ p.weightChange > 0 ? '+' : '' }}{{ p.weightChange }} <small>kg</small></span>
        </div>
        <div class="metric-card">
          <span class="metric-label">Meta</span>
          <span class="metric-value">{{ p.goalWeight }} <small>kg</small></span>
        </div>
      </div>

      <div class="info-section">
        <div class="info-row">
          <span class="info-label">Racha de check-ins</span>
          <span class="info-value">{{ p.streakDays }} días</span>
        </div>
        <div class="info-row">
          <span class="info-label">Adherencia semanal</span>
          <span class="info-value">{{ p.weeklyAdherence }}%</span>
        </div>
        <div class="info-row">
          <span class="info-label">Adherencia general</span>
          <span class="info-value">{{ p.overallAdherence }}%</span>
        </div>
        <div class="info-row">
          <span class="info-label">Check-ins completados</span>
          <span class="info-value">{{ p.checkinsCompleted }}/{{ p.totalCheckins }}</span>
        </div>
      </div>

      <div class="user-info">
        <h2 class="section-title">Datos personales</h2>
        <div class="info-row">
          <span class="info-label">Nombre</span>
          <span class="info-value">{{ user().user?.fullName }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Correo</span>
          <span class="info-value">{{ user().user?.email }}</span>
        </div>
        @if (user().user?.heightCm) {
          <div class="info-row">
            <span class="info-label">Estatura</span>
            <span class="info-value">{{ user().user?.heightCm }} cm</span>
          </div>
        }
        @if (user().user?.birthDate) {
          <div class="info-row">
            <span class="info-label">Fecha de nacimiento</span>
            <span class="info-value">{{ user().user?.birthDate }}</span>
          </div>
        }
      </div>
    } @else {
      <nc-loading></nc-loading>
    }

    <a routerLink="/progress" class="btn-primary" style="margin-top:20px;display:flex;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
      Ver progreso completo
    </a>
  </div>
  `,
  styles: [`
    :host { display: contents; }
    .page { max-width: 480px; margin: 0 auto; padding: 0 20px 120px; background: var(--cream); }
    .metrics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 24px; }
    .metric-card { background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 20px; text-align: center; }
    .metric-card.highlight { border-color: var(--mint-light); background: linear-gradient(135deg, var(--mint-soft), var(--paper)); }
    .metric-card.green { color: var(--mint); }
    .metric-label { display: block; font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink-muted); margin-bottom: 6px; }
    .metric-value { font-family: var(--display); font-size: 28px; font-weight: 500; color: var(--ink); }
    .metric-value small { font-size: 14px; color: var(--ink-light); }
    .info-section, .user-info { background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 16px; margin-bottom: 16px; }
    .section-title { font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--mint); margin-bottom: 12px; }
    .info-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--line); }
    .info-row:last-child { border-bottom: none; }
    .info-label { font-size: 13px; color: var(--ink-light); }
    .info-value { font-size: 14px; font-weight: 600; color: var(--ink); }
  `]
})
export class MetricsPage {
  private readonly auth = inject(AuthService);
  private readonly progressService = inject(ProgressService);

  readonly user = this.auth.state;
  readonly progress = signal<ProgressSummaryDto | null>(null);

  constructor() {
    this.progressService.getSummary().subscribe({
      next: (data) => this.progress.set(data),
    });
  }
}
