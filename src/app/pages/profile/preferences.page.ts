import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NcPageHeaderComponent, NcLoadingComponent } from '../../shared/components';
import { ProfileService } from '../../services/profile.service';
import type { PreferencesDto, UpdatePreferencesRequest } from '../../models/profile.models';

@Component({
  selector: 'app-preferences',
  standalone: true,
  imports: [FormsModule, NcPageHeaderComponent, NcLoadingComponent],
  template: `
  <div class="page">
    <nc-page-header title="Preferencias" backLink="/profile"></nc-page-header>

    @if (loading()) {
      <nc-loading></nc-loading>
    } @else if (error()) {
      <div class="error-box">{{ error() }}</div>
    } @else {
      <div class="settings-group">
        <h2 class="group-title">Visibilidad</h2>
        <div class="setting-row">
          <span class="setting-label">Peso</span>
          <select class="form-select" [(ngModel)]="data().shareWeight">
            <option value="Private">Solo yo</option>
            <option value="Group">Mi grupo</option>
            <option value="Public">Público</option>
          </select>
        </div>
        <div class="setting-row">
          <span class="setting-label">Check-ins</span>
          <select class="form-select" [(ngModel)]="data().shareCheckIns">
            <option value="Private">Solo yo</option>
            <option value="Group">Mi grupo</option>
            <option value="Public">Público</option>
          </select>
        </div>
        <div class="setting-row">
          <span class="setting-label">Medidas</span>
          <select class="form-select" [(ngModel)]="data().shareMeasurements">
            <option value="Private">Solo yo</option>
            <option value="Group">Mi grupo</option>
            <option value="Public">Público</option>
          </select>
        </div>
        <div class="setting-row">
          <span class="setting-label">Fotos de progreso</span>
          <select class="form-select" [(ngModel)]="data().sharePhotos">
            <option value="Private">Solo yo</option>
            <option value="Group">Mi grupo</option>
            <option value="Public">Público</option>
          </select>
        </div>
        <label class="toggle-row">
          <span class="toggle-label">Menciones IA en el muro</span>
          <input type="checkbox" [(ngModel)]="data().allowAiMentions" class="toggle-input" />
          <span class="toggle-slider"></span>
        </label>
      </div>

      @if (saving()) {
        <div class="form-feedback saving">Guardando...</div>
      }
      @if (saveSuccess()) {
        <div class="form-feedback success">Preferencias actualizadas</div>
      }
      @if (saveError()) {
        <div class="form-feedback error">{{ saveError() }}</div>
      }

      <button class="submit-btn" (click)="save()" [disabled]="saving()">Guardar cambios</button>
    }
  </div>
  `,
  styles: [`
    :host { display: contents; }
    .page { max-width: 480px; margin: 0 auto; padding: 0 20px 120px; background: var(--cream); }
    .settings-group { margin-bottom: 24px; }
    .group-title { font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--mint); margin-bottom: 12px; }
    .setting-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid var(--line); }
    .setting-label { font-size: 14px; font-weight: 500; color: var(--ink); }
    .form-select { padding: 8px 12px; border: 1.5px solid var(--line); border-radius: var(--r-md); font-size: 13px; background: var(--paper); color: var(--ink); }
    .form-select:focus { border-color: var(--mint); outline: none; }
    .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid var(--line); cursor: pointer; }
    .toggle-label { font-size: 14px; font-weight: 500; color: var(--ink); }
    .toggle-input { display: none; }
    .toggle-slider { width: 44px; height: 24px; background: var(--line); border-radius: 12px; position: relative; transition: background 0.2s; flex-shrink: 0; }
    .toggle-slider::after { content: ''; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; background: var(--paper); border-radius: 50%; transition: transform 0.2s; }
    .toggle-input:checked + .toggle-slider { background: var(--mint); }
    .toggle-input:checked + .toggle-slider::after { transform: translateX(20px); }
    .form-feedback { font-size: 12px; font-weight: 600; text-align: center; padding: 8px; border-radius: var(--r-md); margin-bottom: 12px; }
    .form-feedback.saving { color: var(--ink-muted); background: var(--cream-warm); }
    .form-feedback.success { color: var(--pine); background: var(--mint-soft); }
    .form-feedback.error { color: var(--coral); background: rgba(229,115,115,0.10); }
    .submit-btn { width: 100%; padding: 14px; background: var(--pine); color: var(--cream); border-radius: var(--r-pill); font-size: 14px; font-weight: 600; transition: transform 0.2s var(--ease-out); }
    .submit-btn:hover:not(:disabled) { transform: translateY(-1px); }
    .submit-btn:disabled { opacity: 0.5; }
    .error-box { text-align: center; padding: 40px 20px; color: var(--coral); font-size: 14px; }
  `]
})
export class PreferencesPage implements OnInit {
  private readonly svc = inject(ProfileService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly saveSuccess = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly data = signal<PreferencesDto>({
    shareWeight: 'Private', shareBodyFat: 'Private', shareMeasurements: 'Private',
    sharePhotos: 'Private', shareCheckIns: 'Group', allowAiMentions: true,
    allowPush: true, allowEmail: true, weeklyDigest: true,
    quietHoursStart: '21:00', quietHoursEnd: '08:00',
    timezone: 'America/Mexico_City', preferredLanguage: 'es-MX',
    nutritionTrack: 'Keto', budgetModeCode: null, budgetModeName: null,
  });

  ngOnInit() {
    this.svc.getPreferences().subscribe({
      next: (p) => { this.data.set(p); this.loading.set(false); },
      error: (err) => { this.error.set(err?.error?.message || 'Error al cargar preferencias'); this.loading.set(false); },
    });
  }

  save() {
    const d = this.data();
    const req: UpdatePreferencesRequest = {
      shareWeight: d.shareWeight, shareCheckIns: d.shareCheckIns,
      shareMeasurements: d.shareMeasurements, sharePhotos: d.sharePhotos,
      allowAiMentions: d.allowAiMentions,
    };

    this.saving.set(true);
    this.saveSuccess.set(false);
    this.saveError.set(null);

    this.svc.updatePreferences(req).subscribe({
      next: () => { this.saving.set(false); this.saveSuccess.set(true); setTimeout(() => this.saveSuccess.set(false), 3000); },
      error: (err) => { this.saving.set(false); this.saveError.set(err?.error?.message || 'Error al guardar'); },
    });
  }
}
