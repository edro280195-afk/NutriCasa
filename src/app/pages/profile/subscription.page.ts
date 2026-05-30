import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { SubscriptionService } from '../../services/subscription.service';
import { NcToastService } from '../../shared/components/nc-toast.service';
import type { SubscriptionPlanDto, UserSubscriptionDto } from '../../models/subscription.models';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
  <div class="page">
    <div class="page-header">
      <button class="icon-btn" routerLink="/profile">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
      </button>
      <div class="page-brand">
        <img src="icons/logonutricasa.jpeg" alt="Logo" class="brand-logo-img-mini" style="margin-right: 8px;">
        NutriCasa
      </div>
      <div style="width:42px;"></div>
    </div>

    <div class="greeting">
      <div class="greeting-eyebrow">Suscripción</div>
      <h1 class="greeting-title">Tu plan actual</h1>
    </div>

    @if (loading()) {
      <div class="loading">Cargando...</div>
    } @else if (subscription(); as sub) {
      <div class="current-plan-card">
        <div class="cpc-header">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--pine)" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <div>
            <div class="cpc-name">{{ sub.planName }}</div>
            <div class="cpc-price">{{ '$' + sub.priceMonthlyMxn + '/mes' }}</div>
          </div>
          <span class="cpc-status" [class]="'status-' + sub.status.toLowerCase()">{{ statusLabel(sub.status) }}</span>
        </div>
        @if (sub.currentPeriodEnd) {
          <div class="cpc-period">
            @if (sub.cancelAtPeriodEnd) {
              <span>⏳ Se cancelará el {{ sub.currentPeriodEnd | date:'d MMM, yyyy' }}</span>
            } @else {
              <span>🔄 Renovación el {{ sub.currentPeriodEnd | date:'d MMM, yyyy' }}</span>
            }
          </div>
        }
        @if (sub.planCode !== 'free') {
          <div class="cpc-actions">
            <button class="btn-outline-danger" (click)="cancelSubscription()" [disabled]="cancelling()">
              Cancelar suscripción
            </button>
          </div>
        }
      </div>

      <div class="settings-head" style="margin-top:24px;">Todos los planes</div>
      <div class="plans-grid">
        @for (plan of plans(); track plan.planId) {
          <div class="plan-card" [class.plan-current]="plan.planId === sub.planId" [class.plan-recommended]="plan.code === 'family' && plan.planId !== sub.planId">
            @if (plan.code === 'family' && plan.planId !== sub.planId) {
              <div class="plan-badge">Recomendado</div>
            }
            <h3 class="plan-name">{{ plan.name }}</h3>
            <div class="plan-price">
              <strong>{{ '$' + plan.priceMonthlyMxn }}</strong>
              <span>/mes</span>
            </div>
            @if (plan.trialDays > 0) {
              <div class="plan-trial">{{ plan.trialDays }} días gratis</div>
            }
            <p class="plan-desc">{{ plan.description }}</p>
            <ul class="plan-features">
              <li>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--mint)"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Miembros: {{ plan.maxGroupMembers ?? 'Ilimitados' }}
              </li>
              <li>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--mint)"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Regeneraciones/sem: {{ plan.maxRegenerationsWeek ?? 'Ilimitadas' }}
              </li>
              <li>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--mint)"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Chat IA: {{ plan.hasAiChat ? 'Sí' : 'No' }}
              </li>
              <li>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--mint)"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Análisis de fotos: {{ plan.hasPhotoAnalysis ? 'Sí' : 'No' }}
              </li>
            </ul>
            @if (plan.planId !== sub.planId) {
              <button class="btn-primary" (click)="selectPlan(plan)" [disabled]="changing()">
                {{ plan.priceMonthlyMxn === 0 ? 'Mantenerme gratis' : plan.trialDays > 0 ? 'Probar gratis' : 'Cambiar a ' + plan.name }}
              </button>
            } @else {
              <button class="btn-primary" disabled>Plan actual</button>
            }
          </div>
        }
      </div>
    } @else {
      <div class="plans-grid">
        @for (plan of plans(); track plan.planId) {
          <div class="plan-card" [class.plan-recommended]="plan.code === 'family'">
            @if (plan.code === 'family') {
              <div class="plan-badge">Recomendado</div>
            }
            <h3 class="plan-name">{{ plan.name }}</h3>
            <div class="plan-price">
              <strong>{{ '$' + plan.priceMonthlyMxn }}</strong>
              <span>/mes</span>
            </div>
            @if (plan.trialDays > 0) {
              <div class="plan-trial">{{ plan.trialDays }} días gratis</div>
            }
            <p class="plan-desc">{{ plan.description }}</p>
            <ul class="plan-features">
              <li>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--mint)"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Miembros: {{ plan.maxGroupMembers ?? 'Ilimitados' }}
              </li>
              <li>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--mint)"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Regeneraciones/sem: {{ plan.maxRegenerationsWeek ?? 'Ilimitadas' }}
              </li>
              <li>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--mint)"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Chat IA: {{ plan.hasAiChat ? 'Sí' : 'No' }}
              </li>
              <li>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--mint)"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                Análisis de fotos: {{ plan.hasPhotoAnalysis ? 'Sí' : 'No' }}
              </li>
            </ul>
            <button class="btn-primary" (click)="selectPlan(plan)" [disabled]="changing()">
              {{ plan.priceMonthlyMxn === 0 ? 'Gratis' : plan.trialDays > 0 ? 'Probar gratis' : 'Elegir ' + plan.name }}
            </button>
          </div>
        }
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
    .icon-btn { width: 42px; height: 42px; background: var(--paper); border-radius: var(--r-pill); display: flex; align-items: center; justify-content: center; color: var(--ink); box-shadow: var(--shadow-sm); border: none; cursor: pointer; }
    .loading { text-align: center; padding: 60px 20px; color: var(--ink-muted); }
    .greeting { margin-bottom: 22px; }
    .greeting-eyebrow { font-size: 12px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; color: var(--mint); margin-bottom: 8px; }
    .greeting-title { font-family: var(--display); font-size: 28px; font-weight: 400; line-height: 1.15; color: var(--ink); }
    .page-header { animation: slideDown 0.5s var(--ease-out); }
    .greeting { animation: slideDown 0.5s var(--ease-out); }

    .current-plan-card { background: var(--paper); border: 2px solid var(--mint); border-radius: var(--r-lg); padding: 20px; margin-bottom: 20px; }
    .cpc-header { display: flex; align-items: center; gap: 12px; }
    .cpc-name { font-family: var(--display); font-size: 20px; font-weight: 500; color: var(--ink); }
    .cpc-price { font-size: 13px; color: var(--ink-muted); }
    .cpc-status { margin-left: auto; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; padding: 4px 10px; border-radius: var(--r-pill); }
    .status-trialing { background: var(--lake-light); color: #2a6b8a; }
    .status-active { background: var(--mint-soft); color: var(--pine); }
    .status-cancelled { background: var(--coral-bg); color: var(--coral); }
    .cpc-period { font-size: 12px; color: var(--ink-light); margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--line); }
    .cpc-actions { margin-top: 14px; }
    .btn-outline-danger { width: 100%; padding: 12px; border: 1.5px solid var(--coral-soft); border-radius: var(--r-pill); background: var(--paper); color: var(--coral); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.15s; }
    .btn-outline-danger:hover { background: var(--coral-bg); }
    .btn-outline-danger:disabled { opacity: 0.5; }

    .settings-head { font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--mint); margin-bottom: 12px; }

    .plans-grid { display: flex; flex-direction: column; gap: 16px; }
    .plan-card { background: var(--paper); border: 1.5px solid var(--line); border-radius: var(--r-lg); padding: 24px 20px; position: relative; }
    .plan-card.plan-current { border-color: var(--mint); background: linear-gradient(135deg, var(--mint-soft), var(--paper)); }
    .plan-card.plan-recommended { border-color: var(--pine); }
    .plan-badge { position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: var(--pine); color: var(--cream); font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; padding: 3px 14px; border-radius: var(--r-pill); }
    .plan-name { font-family: var(--display); font-size: 22px; font-weight: 500; color: var(--ink); margin: 0 0 8px; }
    .plan-price { font-size: 13px; color: var(--ink-muted); margin-bottom: 4px; }
    .plan-price strong { font-family: var(--display); font-size: 28px; font-weight: 500; color: var(--pine); }
    .plan-trial { display: inline-block; font-size: 11px; font-weight: 700; color: var(--cream); background: var(--pine); padding: 3px 10px; border-radius: var(--r-pill); margin-bottom: 10px; }
    .plan-desc { font-size: 13px; color: var(--ink-light); line-height: 1.5; margin-bottom: 14px; }
    .plan-features { list-style: none; padding: 0; margin: 0 0 20px; display: flex; flex-direction: column; gap: 8px; }
    .plan-features li { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--ink-soft); }
    .btn-primary { width: 100%; padding: 14px; border: none; border-radius: var(--r-pill); background: var(--pine); color: var(--cream); font-size: 14px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
    .btn-primary:hover { background: var(--pine-dark); }
    .btn-primary:disabled { opacity: 0.5; cursor: default; }

    @keyframes slideDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
  `],
})
export class SubscriptionPage {
  private readonly subscriptionService = inject(SubscriptionService);
  private readonly toast = inject(NcToastService);
  private readonly router = inject(Router);

  readonly plans = signal<SubscriptionPlanDto[]>([]);
  readonly subscription = signal<UserSubscriptionDto | null>(null);
  readonly loading = signal(true);
  readonly changing = signal(false);
  readonly cancelling = signal(false);

  constructor() {
    this.confirmReturnedPayment();
    this.loadData();
  }

  private loadData() {
    this.loading.set(true);
    this.subscriptionService.getPlans().subscribe({
      next: (plans) => {
        this.plans.set(plans);
        this.subscriptionService.getMySubscription().subscribe({
          next: (sub) => {
            this.subscription.set(sub);
            this.loading.set(false);
          },
          error: () => { this.loading.set(false); },
        });
      },
      error: () => { this.loading.set(false); },
    });
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      pending: 'Pendiente', trialing: 'Prueba', active: 'Activo', cancelled: 'Cancelado', expired: 'Expirado',
    };
    return map[status.toLowerCase()] || status;
  }

  selectPlan(plan: SubscriptionPlanDto) {
    this.changing.set(true);
    if (plan.priceMonthlyMxn === 0) {
      this.subscriptionService.createCheckout({ planId: plan.planId }).subscribe({
        next: (sub) => this.handleCheckoutResponse(sub, `Plan ${plan.name} activado`),
        error: () => { this.changing.set(false); this.toast.error('Error al cambiar de plan'); },
      });
    } else if (plan.trialDays > 0) {
      this.subscriptionService.startTrial({ planId: plan.planId }).subscribe({
        next: () => {
          this.toast.success(`¡Prueba de ${plan.trialDays} días iniciada!`);
          this.loadData();
          this.changing.set(false);
        },
        error: (err) => {
          this.changing.set(false);
          this.toast.error(err.error?.message || 'Error al iniciar prueba');
        },
      });
    } else {
      this.subscriptionService.createCheckout({ planId: plan.planId }).subscribe({
        next: (sub) => this.handleCheckoutResponse(sub, `Plan ${plan.name} activado`),
        error: () => { this.changing.set(false); this.toast.error('Error al cambiar de plan'); },
      });
    }
  }

  cancelSubscription() {
    this.cancelling.set(true);
    this.subscriptionService.cancel(false).subscribe({
      next: () => {
        this.toast.success('Suscripción cancelada. Seguirá activa hasta el fin del período.');
        this.loadData();
        this.cancelling.set(false);
      },
      error: () => { this.cancelling.set(false); this.toast.error('Error al cancelar'); },
    });
  }

  private handleCheckoutResponse(sub: UserSubscriptionDto, successMessage: string) {
    if (sub.checkoutUrl) {
      window.location.href = sub.checkoutUrl;
      return;
    }

    this.toast.success(successMessage);
    this.loadData();
    this.changing.set(false);
  }

  private confirmReturnedPayment() {
    const params = new URLSearchParams(window.location.search);
    const paymentId = params.get('payment_id');
    const status = params.get('status');

    if (!paymentId || status !== 'approved') {
      return;
    }

    this.changing.set(true);
    this.subscriptionService.confirmPayment({ paymentId }).subscribe({
      next: () => {
        this.toast.success('Pago confirmado. Tu plan ya esta activo.');
        this.router.navigate(['/profile/subscription'], { replaceUrl: true });
        this.loadData();
        this.changing.set(false);
      },
      error: () => {
        this.toast.error('No pudimos confirmar el pago todavia.');
        this.changing.set(false);
      },
    });
  }
}
