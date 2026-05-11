import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NcPageHeaderComponent, NcLoadingComponent } from '../../shared/components';
import { ProfileService } from '../../services/profile.service';
import { PushNotificationService } from '../../services/push-notification.service';
import type { PreferencesDto, UpdatePreferencesRequest } from '../../models/profile.models';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [FormsModule, NcPageHeaderComponent, NcLoadingComponent],
  template: `
  <div class="page">
    <nc-page-header title="Notificaciones" backLink="/profile"></nc-page-header>

    @if (loading()) {
      <nc-loading></nc-loading>
    } @else if (error()) {
      <div class="error-box">{{ error() }}</div>
    } @else {
      <div class="settings-group">
        <h2 class="group-title">Canales</h2>

        <label class="toggle-row">
          <span class="toggle-label">Notificaciones push</span>
          @if (pushStatus(); as ps) {
            <span class="push-status" [class.active]="ps.subscribed">{{ ps.subscribed ? 'Suscrito' : 'No suscrito' }}</span>
          }
          <input type="checkbox" [checked]="data().allowPush" (change)="togglePush($any($event.target).checked)" class="toggle-input" [disabled]="pushBusy()" />
          <span class="toggle-slider"></span>
        </label>
        @if (!pushSupported()) {
          <p class="hint">Tu navegador no soporta notificaciones push.</p>
        }
        <label class="toggle-row">
          <span class="toggle-label">Notificaciones por correo</span>
          <input type="checkbox" [(ngModel)]="data().allowEmail" class="toggle-input" />
          <span class="toggle-slider"></span>
        </label>
        <label class="toggle-row">
          <span class="toggle-label">Resumen semanal</span>
          <span class="toggle-desc">Recibe un resumen cada domingo</span>
          <input type="checkbox" [(ngModel)]="data().weeklyDigest" class="toggle-input" />
          <span class="toggle-slider"></span>
        </label>
      </div>

      <div class="settings-group">
        <h2 class="group-title">Horario de silencio</h2>
        <p class="group-desc">No recibirás notificaciones durante este período.</p>
        <div class="quiet-row">
          <label class="quiet-label">
            Inicio
            <input type="time" class="form-input" [value]="data().quietHoursStart" (change)="data().quietHoursStart = $any($event.target).value" />
          </label>
          <label class="quiet-label">
            Fin
            <input type="time" class="form-input" [value]="data().quietHoursEnd" (change)="data().quietHoursEnd = $any($event.target).value" />
          </label>
        </div>
      </div>

      @if (saving()) {
        <div class="form-feedback saving">Guardando...</div>
      }
      @if (saveSuccess()) {
        <div class="form-feedback success">Preferencias de notificación actualizadas</div>
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
    .settings-group { margin-bottom: 28px; }
    .group-title { font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--mint); margin-bottom: 8px; }
    .group-desc { font-size: 12px; color: var(--ink-muted); margin-bottom: 12px; }
    .toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 0; border-bottom: 1px solid var(--line); cursor: pointer; flex-wrap: wrap; }
    .toggle-label { font-size: 14px; font-weight: 500; color: var(--ink); }
    .toggle-desc { width: 100%; font-size: 11px; color: var(--ink-muted); margin-top: 4px; }
    .toggle-input { display: none; }
    .toggle-slider { width: 44px; height: 24px; background: var(--line); border-radius: 12px; position: relative; transition: background 0.2s; flex-shrink: 0; }
    .toggle-slider::after { content: ''; position: absolute; top: 3px; left: 3px; width: 18px; height: 18px; background: var(--paper); border-radius: 50%; transition: transform 0.2s; }
    .toggle-input:checked + .toggle-slider { background: var(--mint); }
    .toggle-input:checked + .toggle-slider::after { transform: translateX(20px); }
    .toggle-input:disabled + .toggle-slider { opacity: 0.5; }
    .push-status { font-size: 10px; font-weight: 600; padding: 2px 10px; border-radius: var(--r-pill); background: var(--cream-warm); color: var(--ink-muted); }
    .push-status.active { background: var(--mint-soft); color: var(--pine); }
    .hint { font-size: 11px; color: var(--ink-muted); margin-top: 4px; width: 100%; }
    .quiet-row { display: flex; gap: 12px; }
    .quiet-label { flex: 1; display: flex; flex-direction: column; gap: 4px; font-size: 12px; font-weight: 600; color: var(--ink-muted); }
    .form-input { width: 100%; padding: 10px 14px; border: 1.5px solid var(--line); border-radius: var(--r-md); font-size: 14px; background: var(--paper); color: var(--ink); box-sizing: border-box; }
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
export class NotificationsPage implements OnInit {
  private readonly svc = inject(ProfileService);
  private readonly pushSvc = inject(PushNotificationService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly saveSuccess = signal(false);
  readonly saveError = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly pushSupported = signal(this.pushSvc.isSupported);
  readonly pushStatus = signal<{ subscribed: boolean; endpoint?: string }>({ subscribed: false });
  readonly pushBusy = signal(false);

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
      error: (err) => { this.error.set(err?.error?.message || 'Error al cargar configuración'); this.loading.set(false); },
    });

    if (this.pushSupported()) {
      this.pushSvc.getSubscriptions().subscribe({
        next: (subs) => {
          if (subs.length > 0) {
            this.pushStatus.set({ subscribed: true, endpoint: subs[0].endpoint });
          }
        },
      });
    }
  }

  async togglePush(enabled: boolean) {
    this.data.update(d => ({ ...d, allowPush: enabled }));

    if (!this.pushSupported()) return;

    this.pushBusy.set(true);
    try {
      if (enabled) {
        const sub = await this.pushSvc.requestSubscription().toPromise();
        if (sub) {
          const json = sub.toJSON();
          await this.pushSvc.subscribeBackend(
            json.endpoint!,
            (json.keys as any).p256dh,
            (json.keys as any).auth
          ).toPromise();
          this.pushStatus.set({ subscribed: true, endpoint: json.endpoint! });
        }
      } else {
        const current = this.pushStatus();
        if (current.endpoint) {
          await this.pushSvc.unsubscribeBackend(current.endpoint).toPromise();
        }
        const browserSub = await this.pushSvc.subscription$.toPromise();
        if (browserSub) {
          await this.pushSvc.unsubscribe(browserSub).toPromise();
        }
        this.pushStatus.set({ subscribed: false });
      }
    } catch (err: any) {
      this.pushStatus.set({ subscribed: false });
      this.data.update(d => ({ ...d, allowPush: false }));
    }
    this.pushBusy.set(false);
  }

  save() {
    const d = this.data();
    const req: UpdatePreferencesRequest = {
      allowPush: d.allowPush,
      allowEmail: d.allowEmail,
      weeklyDigest: d.weeklyDigest,
      quietHoursStart: d.quietHoursStart,
      quietHoursEnd: d.quietHoursEnd,
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
