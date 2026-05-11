import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { ProgressService } from '../../services/progress.service';
import { PlanService } from '../../services/plan.service';
import { NcToastService } from '../../shared/components/nc-toast.service';
import type { ProgressSummaryDto, WeightEntryDto, CheckinDayDto, WeeklyMacrosDto, ProgressPhotoDto } from '../../models/progress.models';
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

      <div class="card">
        <div class="card-head">
          <h2 class="card-title">Fotos de progreso</h2>
          <button class="card-action" (click)="fileInput.click()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Subir
          </button>
          <input #fileInput type="file" accept="image/jpeg,image/png,image/webp" (change)="onFileSelected($event)" hidden>
        </div>

        @if (uploading()) {
          <div class="photo-uploading">
            <div class="spinner-sm"></div>
            <span>Subiendo foto...</span>
          </div>
        }

        @if (photos().length) {
          <div class="photo-grid">
            @for (p of photos(); track p.photoId) {
              <div class="photo-item" (click)="viewPhoto(p)">
                <img [src]="p.photoUrl" [alt]="'Foto ' + p.takenAt" loading="lazy">
                <div class="photo-overlay">
                  <span class="photo-date">{{ p.takenAt }}</span>
                  <button class="photo-delete" (click)="$event.stopPropagation(); deletePhoto(p.photoId)" title="Eliminar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  </button>
                </div>
              </div>
            }
          </div>
        } @else {
          <p class="photo-empty">Aún no has subido fotos. ¡Sube tu primera foto de progreso!</p>
        }
      </div>
    }

    @if (selectedPhoto(); as p) {
      <div class="photo-viewer" (click)="selectedPhoto.set(null)">
        <div class="photo-viewer-content" (click)="$event.stopPropagation()">
          <button class="photo-viewer-close" (click)="selectedPhoto.set(null)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
          </button>
          <img [src]="p.photoUrl" alt="Foto {{ p.takenAt }}">
          <div class="photo-viewer-meta">
            <span>{{ p.takenAt }}</span>
            @if (p.angle) { <span>· {{ p.angle }}</span> }
            <button class="photo-vis-btn" [class.group]="p.visibility === 'Group'" (click)="toggleVisibility(p)">
              {{ p.visibility === 'Group' ? 'Visible para el grupo' : 'Solo yo' }}
            </button>
          </div>
        </div>
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
    .card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .card-title { font-family: var(--display); font-size: 20px; font-weight: 400; letter-spacing: -0.01em; color: var(--ink); margin: 0; }
    .card-badge { font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: var(--r-pill); background: var(--cream); color: var(--ink-soft); }
    .card-badge.down { background: var(--mint-soft); color: var(--pine); }
    .card-badge.up { background: var(--coral-bg); color: var(--coral); }
    .card-action { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--r-pill); border: 1px solid var(--line); background: var(--cream); font-size: 12px; font-weight: 600; color: var(--pine); cursor: pointer; transition: all 0.2s; }
    .card-action:hover { background: var(--mint-soft); border-color: var(--mint); }
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
    .photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .photo-item { position: relative; aspect-ratio: 1; border-radius: var(--r-lg); overflow: hidden; cursor: pointer; background: var(--bg); }
    .photo-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
    .photo-item:hover img { transform: scale(1.05); }
    .photo-overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 6px; background: linear-gradient(transparent, rgba(0,0,0,0.5)); display: flex; justify-content: space-between; align-items: flex-end; opacity: 0; transition: opacity 0.2s; }
    .photo-item:hover .photo-overlay { opacity: 1; }
    .photo-date { font-size: 10px; color: white; font-weight: 600; }
    .photo-delete { width: 24px; height: 24px; border-radius: 50%; border: none; background: rgba(0,0,0,0.4); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .photo-delete:hover { background: var(--coral); }
    .photo-empty { text-align: center; padding: 24px 0; font-size: 13px; color: var(--ink-muted); }
    .photo-uploading { display: flex; align-items: center; gap: 10px; padding: 12px 0; font-size: 13px; color: var(--ink-muted); }
    .spinner-sm { width: 20px; height: 20px; border: 2px solid var(--line); border-top-color: var(--pine); border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
    .photo-viewer { position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; animation: fadeIn 0.2s; }
    .photo-viewer-content { max-width: 500px; width: 100%; position: relative; }
    .photo-viewer-content img { width: 100%; border-radius: var(--r-xl); }
    .photo-viewer-close { position: absolute; top: -40px; right: 0; background: none; border: none; color: white; cursor: pointer; padding: 8px; }
    .photo-viewer-meta { display: flex; align-items: center; gap: 8px; margin-top: 12px; color: rgba(255,255,255,0.7); font-size: 13px; }
    .photo-vis-btn { margin-left: auto; padding: 6px 14px; border-radius: var(--r-pill); border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.1); color: white; font-size: 11px; font-weight: 600; cursor: pointer; }
    .photo-vis-btn.group { background: var(--mint); border-color: var(--mint); color: var(--pine-darker); }
    .page-header { animation: slideDown 0.5s var(--ease-out); }
    .progress-hero { animation: slideUp 0.7s var(--ease-out) 0.05s both; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class ProgressPage implements OnInit {
  private readonly progressService = inject(ProgressService);
  private readonly planService = inject(PlanService);
  private readonly toast = inject(NcToastService);

  readonly summary = signal<ProgressSummaryDto | null>(null);
  readonly rawWeightData = signal<WeightEntryDto[]>([]);
  readonly heatmapData = signal<CheckinDayDto[]>([]);
  readonly weeklyMacros = signal<WeeklyMacrosDto | null>(null);
  readonly planDayMacros = signal<DayMacroBars[]>([]);

  readonly photos = signal<ProgressPhotoDto[]>([]);
  readonly uploading = signal(false);
  readonly selectedPhoto = signal<ProgressPhotoDto | null>(null);

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
    this.progressService.getPhotos().subscribe(p => this.photos.set(p));

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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const today = new Date().toISOString().split('T')[0];

    this.uploading.set(true);
    this.progressService.uploadPhoto(file, today).subscribe({
      next: (result) => {
        this.uploading.set(false);
        this.photos.update(p => [{
          photoId: result.photoId,
          photoUrl: result.photoUrl,
          storageKey: result.storageKey,
          angle: null,
          visibility: 'Private',
          takenAt: result.takenAt,
          createdAt: new Date().toISOString(),
          fileSizeBytes: file.size,
        }, ...p]);
        this.toast.success('Foto subida exitosamente');
        input.value = '';
      },
      error: () => {
        this.uploading.set(false);
        this.toast.error('Error al subir la foto');
        input.value = '';
      }
    });
  }

  viewPhoto(photo: ProgressPhotoDto) {
    this.selectedPhoto.set(photo);
  }

  deletePhoto(photoId: string) {
    this.progressService.deletePhoto(photoId).subscribe({
      next: () => {
        this.photos.update(p => p.filter(x => x.photoId !== photoId));
        this.selectedPhoto.update(cur => cur?.photoId === photoId ? null : cur);
        this.toast.success('Foto eliminada');
      },
      error: () => this.toast.error('Error al eliminar la foto'),
    });
  }

  toggleVisibility(photo: ProgressPhotoDto) {
    const next = photo.visibility === 'Group' ? 'Private' : 'Group';
    this.progressService.updatePhotoVisibility(photo.photoId, next).subscribe({
      next: () => {
        this.photos.update(p => p.map(x => x.photoId === photo.photoId ? { ...x, visibility: next } : x));
        this.selectedPhoto.update(cur => cur?.photoId === photo.photoId ? { ...cur, visibility: next } : cur);
        this.toast.success(next === 'Group' ? 'Foto visible para el grupo' : 'Foto privada');
      },
      error: () => this.toast.error('Error al cambiar visibilidad'),
    });
  }

  fmt(value: number): string {
    return Math.round(value).toLocaleString('es-MX');
  }
}
