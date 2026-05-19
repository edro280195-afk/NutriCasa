import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NcPageHeaderComponent, NcLoadingComponent } from '../../shared/components';
import { ProfileService } from '../../services/profile.service';
import type { MedicalProfileDto, UpdateMedicalProfileRequest } from '../../models/profile.models';

@Component({
  selector: 'app-medical-profile',
  standalone: true,
  imports: [FormsModule, NcPageHeaderComponent, NcLoadingComponent],
  template: `
  <div class="page">
    <nc-page-header title="Mi perfil médico" backLink="/profile"></nc-page-header>

    @if (loading()) {
      <nc-loading></nc-loading>
    } @else if (error()) {
      <div class="error-box">{{ error() }}</div>
    } @else {
      <form (ngSubmit)="save()" class="form">
        <section class="section">
          <h2 class="section-title">Condiciones</h2>
          <div class="conditions-grid">
            <label class="check-card" [class.active]="data().hasDiabetes">
              <input type="checkbox" [(ngModel)]="data().hasDiabetes" name="hasDiabetes" />
              Diabetes
            </label>
            <label class="check-card" [class.active]="data().hasKidneyIssues">
              <input type="checkbox" [(ngModel)]="data().hasKidneyIssues" name="hasKidneyIssues" />
              Renal
            </label>
            <label class="check-card" [class.active]="data().hasLiverIssues">
              <input type="checkbox" [(ngModel)]="data().hasLiverIssues" name="hasLiverIssues" />
              Hepático
            </label>
            <label class="check-card" [class.active]="data().hasPancreasIssues">
              <input type="checkbox" [(ngModel)]="data().hasPancreasIssues" name="hasPancreasIssues" />
              Pancreático
            </label>
            <label class="check-card" [class.active]="data().hasThyroidIssues">
              <input type="checkbox" [(ngModel)]="data().hasThyroidIssues" name="hasThyroidIssues" />
              Tiroides
            </label>
            <label class="check-card" [class.active]="data().hasHeartCondition">
              <input type="checkbox" [(ngModel)]="data().hasHeartCondition" name="hasHeartCondition" />
              Cardíaco
            </label>
            <label class="check-card" [class.active]="data().hasGallbladderIssues">
              <input type="checkbox" [(ngModel)]="data().hasGallbladderIssues" name="hasGallbladderIssues" />
              Vesícula
            </label>
          </div>
        </section>

        <section class="section">
          <h2 class="section-title">Alergias y medicamentos</h2>
          <label class="field-label">Alergias (una por línea)</label>
          <textarea class="form-input" [value]="allergiesText()" (input)="allergiesText.set($any($event.target).value)" rows="3" placeholder="Nueces, mariscos, lácteos..."></textarea>
          <label class="field-label">Medicamentos (una por línea)</label>
          <textarea class="form-input" [value]="medicationsText()" (input)="medicationsText.set($any($event.target).value)" rows="3" placeholder="Metformina, Losartán..."></textarea>
        </section>

        <section class="section">
          <h2 class="section-title">Restricciones</h2>
          <label class="field-label">Restricciones dietéticas (una por línea)</label>
          <textarea class="form-input" [value]="restrictionsText()" (input)="restrictionsText.set($any($event.target).value)" rows="3" placeholder="Sin gluten, sin lactosa..."></textarea>
          <label class="field-label">Ingredientes que no te gustan</label>
          <textarea class="form-input" [value]="dislikedText()" (input)="dislikedText.set($any($event.target).value)" rows="3" placeholder="Cilantro, hígado..."></textarea>
        </section>

        <section class="section">
          <h2 class="section-title">Experiencia keto</h2>
          <div class="radio-group">
            @for (level of experienceLevels; track level.value) {
              <label class="radio-card" [class.active]="data().ketoExperienceLevel === level.value">
                <input type="radio" [(ngModel)]="data().ketoExperienceLevel" name="ketoExp" [value]="level.value" />
                {{ level.label }}
              </label>
            }
          </div>
        </section>

        @if (saving()) {
          <div class="form-feedback saving">Guardando...</div>
        }
        @if (saveSuccess()) {
          <div class="form-feedback success">Perfil médico actualizado</div>
        }
        @if (saveError()) {
          <div class="form-feedback error">{{ saveError() }}</div>
        }

        <button type="submit" class="submit-btn" [disabled]="saving()">Guardar cambios</button>
      </form>
    }
  </div>
  `,
  styles: [`
    :host { display: contents; }
    .page { max-width: 480px; margin: 0 auto; padding: 0 20px 120px; background: var(--cream); }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--mint); margin-bottom: 12px; }
    .conditions-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .check-card, .radio-card { display: flex; align-items: center; gap: 8px; padding: 10px 14px; background: var(--paper); border: 1.5px solid var(--line); border-radius: var(--r-lg); font-size: 13px; font-weight: 500; color: var(--ink); cursor: pointer; transition: all 0.2s; }
    .check-card.active, .radio-card.active { border-color: var(--mint); background: var(--mint-soft); }
    .check-card input, .radio-card input { display: none; }
    .radio-group { display: flex; flex-direction: column; gap: 8px; }
    .field-label { display: block; font-size: 12px; font-weight: 600; color: var(--ink-muted); margin-bottom: 6px; }
    .form-input { width: 100%; padding: 10px 14px; border: 1.5px solid var(--line); border-radius: var(--r-md); font-size: 14px; background: var(--paper); color: var(--ink); margin-bottom: 12px; box-sizing: border-box; font-family: inherit; resize: vertical; }
    .form-input:focus { border-color: var(--mint); outline: none; box-shadow: 0 0 0 3px rgba(91,192,150,0.15); }
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
export class MedicalProfilePage implements OnInit {
  private readonly svc = inject(ProfileService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly saveSuccess = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly data = signal<MedicalProfileDto>({
    hasDiabetes: false, diabetesType: null, isPregnantOrLactating: false,
    hasKidneyIssues: false, hasLiverIssues: false, hasPancreasIssues: false,
    hasThyroidIssues: false, hasHeartCondition: false, hasEatingDisorderHistory: false,
    hasGallbladderIssues: false, otherConditions: null,
    allergies: [], medications: [], dietaryRestrictions: [],
    dislikedIngredients: [], preferredIngredients: [],
    ketoExperienceLevel: 'Beginner', requiresHumanReview: false, overrideAcceptedAt: null,
  });

  readonly allergiesText = signal('');
  readonly medicationsText = signal('');
  readonly restrictionsText = signal('');
  readonly dislikedText = signal('');

  readonly experienceLevels = [
    { value: 'Beginner', label: 'Principiante' },
    { value: 'Intermediate', label: 'Intermedio' },
    { value: 'Advanced', label: 'Avanzado' },
  ];

  ngOnInit() {
    this.svc.getMedicalProfile().subscribe({
      next: (p) => {
        this.data.set(p);
        this.allergiesText.set(p.allergies.join('\n'));
        this.medicationsText.set(p.medications.join('\n'));
        this.restrictionsText.set(p.dietaryRestrictions.join('\n'));
        this.dislikedText.set(p.dislikedIngredients.join('\n'));
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Error al cargar perfil médico');
        this.loading.set(false);
      },
    });
  }

  save() {
    const d = this.data();
    const req: UpdateMedicalProfileRequest = {
      hasDiabetes: d.hasDiabetes, diabetesType: d.diabetesType || undefined,
      isPregnantOrLactating: d.isPregnantOrLactating,
      hasKidneyIssues: d.hasKidneyIssues, hasLiverIssues: d.hasLiverIssues,
      hasPancreasIssues: d.hasPancreasIssues, hasThyroidIssues: d.hasThyroidIssues,
      hasHeartCondition: d.hasHeartCondition, hasEatingDisorderHistory: d.hasEatingDisorderHistory,
      hasGallbladderIssues: d.hasGallbladderIssues, otherConditions: d.otherConditions || undefined,
      allergies: this.allergiesText().split('\n').map(s => s.trim()).filter(Boolean),
      medications: this.medicationsText().split('\n').map(s => s.trim()).filter(Boolean),
      dietaryRestrictions: this.restrictionsText().split('\n').map(s => s.trim()).filter(Boolean),
      dislikedIngredients: this.dislikedText().split('\n').map(s => s.trim()).filter(Boolean),
      preferredIngredients: [],
      ketoExperienceLevel: d.ketoExperienceLevel,
    };

    this.saving.set(true);
    this.saveSuccess.set(false);
    this.saveError.set(null);

    this.svc.updateMedicalProfile(req).subscribe({
      next: () => {
        this.saving.set(false);
        this.saveSuccess.set(true);
        this.data.update(d => ({ ...d, allergies: req.allergies, medications: req.medications, dietaryRestrictions: req.dietaryRestrictions, dislikedIngredients: req.dislikedIngredients }));
        setTimeout(() => this.saveSuccess.set(false), 3000);
      },
      error: (err) => {
        this.saving.set(false);
        this.saveError.set(err?.error?.message || 'Error al guardar');
      },
    });
  }
}
