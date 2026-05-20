import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ChallengeService } from '../../services/challenge.service';
import { NcToastService } from '../../shared/components/nc-toast.service';
import {
  ChallengeDto,
  ChallengeLeaderboardDto,
  GOAL_TYPE_LABELS,
} from '../../models/challenge.models';

type Section = 'active' | 'mine' | 'leaderboard';

@Component({
  selector: 'app-challenges',
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink],
  template: `
  <div class="page">
    <div class="page-header">
      <div class="page-brand">
        <svg class="leaf-icon" viewBox="0 0 24 24"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>
        NutriCasa
      </div>
      <a routerLink="/family" class="btn-sm btn-outline">Volver</a>
    </div>

    <div class="ch-hero">
      <h1 class="ch-hero-title">Retos <span class="italic">entre familia</span></h1>
      <p class="ch-hero-meta">Compitan sanamente y manténganse motivados</p>
    </div>

    <div class="ch-tabs">
      <button class="ch-tab" [class.active]="section() === 'active'" (click)="section.set('active')">Activos</button>
      <button class="ch-tab" [class.active]="section() === 'mine'" (click)="switchToMine()">Mis retos</button>
      @if (canCreate()) {
        <button class="ch-tab" [class.active]="showCreateForm()" (click)="toggleCreateForm()">+ Crear</button>
      }
    </div>

    @if (loading()) {
      <div class="loading-state"><div class="spinner-lg"></div><p>Cargando retos...</p></div>
    }

    @if (section() === 'active' && !loading()) {
      <div class="ch-list">
        @for (c of activeChallenges(); track c.challengeId) {
          <div class="ch-card" (click)="openLeaderboard(c)">
            <div class="ch-card-top">
              <div class="ch-card-title">{{ c.title }}</div>
              <span class="ch-badge">{{ GOAL_TYPE_LABELS[c.goalType] || c.goalType }}</span>
            </div>
            @if (c.description) {
              <p class="ch-card-desc">{{ c.description }}</p>
            }
            <div class="ch-card-meta">
              <span>📅 {{ c.startDate | date:'d MMM' }} — {{ c.endDate | date:'d MMM' }}</span>
              <span>👥 {{ c.participantCount }}</span>
            </div>
            <div class="ch-card-footer">
              <span class="ch-card-author">Por {{ c.createdBy }}</span>
              @if (!c.hasJoined) {
                <button class="btn-sm" (click)="join($event, c.challengeId)">Unirme</button>
              } @else {
                <button class="btn-sm btn-outline" (click)="leave($event, c.challengeId)">Salir</button>
              }
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <p>No hay retos activos en tu grupo.</p>
            @if (canCreate()) {
              <button class="btn-primary" (click)="toggleCreateForm()">Crear primer reto</button>
            }
          </div>
        }
      </div>
    }

    @if (section() === 'mine' && !loading()) {
      <div class="ch-list">
        @for (c of myChallenges(); track c.challengeId) {
          <div class="ch-card" (click)="openLeaderboard(c)">
            <div class="ch-card-top">
              <div class="ch-card-title">{{ c.title }}</div>
              <span class="ch-badge">{{ GOAL_TYPE_LABELS[c.goalType] || c.goalType }}</span>
            </div>
            @if (c.description) {
              <p class="ch-card-desc">{{ c.description }}</p>
            }
            <div class="ch-card-meta">
              <span>📅 {{ c.startDate | date:'d MMM' }} — {{ c.endDate | date:'d MMM' }}</span>
              <span>🏅 {{ c.myCurrentScore }}</span>
            </div>
            <div class="ch-card-footer">
              <span class="ch-card-author">{{ c.participantCount }} participantes</span>
            </div>
          </div>
        } @empty {
          <div class="empty-state">
            <p>Aún no te has unido a ningún reto.</p>
            <button class="btn-primary" (click)="section.set('active')">Ver retos activos</button>
          </div>
        }
      </div>
    }

    @if (showCreateForm()) {
      <div class="ch-form-overlay" (click)="showCreateForm.set(false)">
        <div class="ch-form" (click)="$event.stopPropagation()">
          <h2 class="ch-form-title">Crear nuevo reto</h2>
          <div class="form-group">
            <label>Título</label>
            <input [(ngModel)]="formTitle" placeholder="Ej: Quién pierde más en junio" />
          </div>
          <div class="form-group">
            <label>Descripción (opcional)</label>
            <textarea [(ngModel)]="formDescription" rows="2" placeholder="Descripción del reto..."></textarea>
          </div>
          <div class="form-group">
            <label>Tipo de reto</label>
            <select [(ngModel)]="formGoalType">
              <option value="MostWeightLoss">Mayor pérdida de peso (%)</option>
              <option value="MostFatLoss">Mayor pérdida de peso (kg)</option>
              <option value="BestStreak">Mejor racha de check-ins</option>
              <option value="HighestAdherence">Mayor adherencia</option>
              <option value="MostCheckIns">Más check-ins</option>
              <option value="Custom">Personalizado</option>
            </select>
          </div>
          <div class="form-group">
            <label>Descripción de meta (opcional)</label>
            <input [(ngModel)]="formGoalDesc" placeholder="Ej: mínimo 4 check-ins por semana" />
          </div>
          <div class="form-group">
            <label>Premio o recompensa (opcional)</label>
            <input [(ngModel)]="formReward" placeholder="Ej: cena gratis el perdedor" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Inicio</label>
              <input type="date" [(ngModel)]="formStartDate" />
            </div>
            <div class="form-group">
              <label>Fin</label>
              <input type="date" [(ngModel)]="formEndDate" />
            </div>
          </div>
          @if (formError()) {
            <p class="form-error">{{ formError() }}</p>
          }
          <div class="form-actions">
            <button class="btn-primary" (click)="create()" [disabled]="saving()">{{ saving() ? 'Creando...' : 'Crear reto' }}</button>
            <button class="btn-outline" (click)="showCreateForm.set(false)">Cancelar</button>
          </div>
        </div>
      </div>
    }

    @if (leaderboard(); as lb) {
      <div class="ch-form-overlay" (click)="closeLeaderboard()">
        <div class="ch-form ch-leaderboard" (click)="$event.stopPropagation()">
          <div class="lb-header">
            <h2>{{ lb.title }}</h2>
            <button class="btn-sm btn-outline" (click)="closeLeaderboard()">✕</button>
          </div>
          <div class="lb-type">{{ GOAL_TYPE_LABELS[lb.goalType] || lb.goalType }}</div>
          @for (e of lb.entries; track e.userId) {
            <div class="lb-entry" [class.is-me]="e.isCurrentUser">
              <div class="lb-rank">
                @if (e.rank <= 3) {
                  <span class="lb-medal">{{ ['🏆','🥈','🥉'][e.rank - 1] }}</span>
                } @else {
                  <span class="lb-rank-num">#{{ e.rank }}</span>
                }
              </div>
              <div class="lb-av" [style.background]="'var(--mint)'">
                {{ e.fullName.charAt(0) }}{{ e.fullName.split(' ').pop()?.charAt(0) }}
              </div>
              <div class="lb-info">
                <div class="lb-name">{{ e.fullName }}</div>
                <div class="lb-bar-track">
                  <div class="lb-bar-fill" [style.width.%]="leaderboardBarWidth(e)"></div>
                </div>
              </div>
              <div class="lb-value">{{ e.currentValueDisplay }}</div>
            </div>
          } @empty {
            <p class="empty-state">Sin participantes aún.</p>
          }
        </div>
      </div>
    }
  </div>
  `,
  styles: [`
    :host { display: contents; }
    .page { padding: 24px 16px 96px; max-width: 480px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-brand { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 18px; color: var(--pine); }
    .leaf-icon { width: 24px; height: 24px; fill: var(--mint); }
    .ch-hero { margin-bottom: 24px; }
    .ch-hero-title { font-size: 24px; font-weight: 700; color: var(--pine); margin: 0 0 4px; }
    .ch-hero-meta { color: var(--pine-light); font-size: 14px; margin: 0; }
    .ch-tabs { display: flex; gap: 8px; margin-bottom: 20px; }
    .ch-tab { flex: 1; padding: 10px; border: none; border-radius: var(--r-pill); background: var(--cream); color: var(--pine); font-weight: 600; cursor: pointer; font-size: 13px; }
    .ch-tab.active { background: var(--mint); color: var(--pine-darker); }
    .ch-list { display: flex; flex-direction: column; gap: 12px; }
    .ch-card { background: white; border-radius: var(--r-card); padding: 16px; cursor: pointer; transition: transform 0.15s; }
    .ch-card:active { transform: scale(0.98); }
    .ch-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; margin-bottom: 8px; }
    .ch-card-title { font-weight: 700; font-size: 16px; color: var(--pine); }
    .ch-badge { font-size: 11px; font-weight: 600; background: var(--cream); color: var(--pine); padding: 2px 8px; border-radius: var(--r-pill); white-space: nowrap; }
    .ch-card-desc { color: var(--pine-light); font-size: 13px; margin: 0 0 8px; }
    .ch-card-meta { display: flex; gap: 16px; font-size: 12px; color: var(--pine-light); margin-bottom: 8px; }
    .ch-card-footer { display: flex; justify-content: space-between; align-items: center; }
    .ch-card-author { font-size: 12px; color: var(--pine-lighter); }
    /* Form overlay */
    .ch-form-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: flex-end; z-index: 200; }
    .ch-form { background: white; width: 100%; max-width: 480px; margin: 0 auto; border-radius: 20px 20px 0 0; padding: 24px; max-height: 85vh; overflow-y: auto; }
    .ch-form-title { font-size: 20px; font-weight: 700; color: var(--pine); margin: 0 0 20px; }
    .form-group { margin-bottom: 16px; }
    .form-group label { display: block; font-size: 13px; font-weight: 600; color: var(--pine); margin-bottom: 4px; }
    .form-group input, .form-group textarea, .form-group select { width: 100%; padding: 10px 12px; border: 1.5px solid var(--cream-dark); border-radius: var(--r-input); font-size: 14px; background: var(--cream); color: var(--pine); box-sizing: border-box; }
    .form-group textarea { resize: vertical; }
    .form-row { display: flex; gap: 12px; }
    .form-row .form-group { flex: 1; }
    .form-error { color: #e74c3c; font-size: 13px; margin: 0 0 12px; }
    .form-actions { display: flex; gap: 12px; margin-top: 8px; }
    .form-actions .btn-primary { flex: 1; }
    /* Leaderboard overlay */
    .ch-leaderboard { max-height: 75vh; }
    .lb-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
    .lb-header h2 { font-size: 18px; font-weight: 700; color: var(--pine); margin: 0; }
    .lb-type { font-size: 13px; color: var(--pine-light); margin-bottom: 16px; }
    .lb-entry { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--cream); }
    .lb-entry.is-me { background: rgba(91,192,150,0.08); margin: 0 -16px; padding: 10px 16px; border-radius: var(--r-card); }
    .lb-rank { width: 28px; text-align: center; font-size: 14px; }
    .lb-medal { font-size: 20px; }
    .lb-rank-num { font-weight: 700; color: var(--pine-light); }
    .lb-av { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; color: var(--pine-darker); flex-shrink: 0; }
    .lb-info { flex: 1; min-width: 0; }
    .lb-name { font-weight: 600; font-size: 14px; color: var(--pine); }
    .lb-bar-track { height: 6px; background: var(--cream); border-radius: 3px; margin-top: 4px; }
    .lb-bar-fill { height: 100%; background: var(--mint); border-radius: 3px; transition: width 0.3s; }
    .lb-value { font-weight: 700; font-size: 14px; color: var(--mint); white-space: nowrap; }
    .loading-state, .empty-state { text-align: center; padding: 40px 0; color: var(--pine-light); }
    .empty-state p { margin: 0 0 16px; }
    .spinner-lg { width: 32px; height: 32px; border: 3px solid var(--cream); border-top-color: var(--mint); border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 12px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .btn-sm { padding: 6px 14px; font-size: 12px; font-weight: 600; border: none; border-radius: var(--r-pill); cursor: pointer; background: var(--mint); color: var(--pine-darker); }
    .btn-outline { background: transparent; border: 1.5px solid var(--cream-dark); color: var(--pine); }
    .btn-primary { padding: 12px 24px; font-size: 14px; font-weight: 700; border: none; border-radius: var(--r-pill); cursor: pointer; background: var(--mint); color: var(--pine-darker); }
    .btn-primary:disabled { opacity: 0.5; cursor: default; }
  `]
})
export class ChallengesPage implements OnInit {
  private readonly challengeService = inject(ChallengeService);
  private readonly toast = inject(NcToastService);

  readonly GOAL_TYPE_LABELS = GOAL_TYPE_LABELS;
  readonly section = signal<Section>('active');
  readonly loading = signal(true);
  readonly activeChallenges = signal<ChallengeDto[]>([]);
  readonly myChallenges = signal<ChallengeDto[]>([]);
  readonly leaderboard = signal<ChallengeLeaderboardDto | null>(null);
  readonly showCreateForm = signal(false);
  readonly canCreate = signal(false);
  readonly saving = signal(false);
  readonly formError = signal('');

  formTitle = '';
  formDescription = '';
  formGoalType = 'MostWeightLoss';
  formGoalDesc = '';
  formReward = '';
  formStartDate = '';
  formEndDate = '';

  ngOnInit() {
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.activeChallenges.set([]);
    this.myChallenges.set([]);

    this.challengeService.getActive().subscribe({
      next: (cs) => { this.activeChallenges.set(cs); this.canCreate.set(true); },
      error: () => {},
    });

    this.challengeService.getMine().subscribe({
      next: (cs) => this.myChallenges.set(cs),
      error: () => this.loading.set(false),
      complete: () => this.loading.set(false),
    });
  }

  switchToMine() {
    this.section.set('mine');
  }

  toggleCreateForm() {
    this.showCreateForm.update(v => !v);
    if (!this.showCreateForm()) return;
    const today = new Date();
    this.formStartDate = today.toISOString().slice(0, 10);
    const end = new Date(today);
    end.setDate(end.getDate() + 28);
    this.formEndDate = end.toISOString().slice(0, 10);
  }

  join(event: MouseEvent, challengeId: string) {
    event.stopPropagation();
    this.challengeService.join(challengeId).subscribe({
      next: () => {
        this.toast.success('Te has unido al reto');
        this.load();
      },
      error: (err) => this.toast.error(err?.error?.message || 'Error al unirte'),
    });
  }

  leave(event: MouseEvent, challengeId: string) {
    event.stopPropagation();
    this.challengeService.leave(challengeId).subscribe({
      next: () => {
        this.toast.info('Has salido del reto');
        this.load();
      },
      error: (err) => this.toast.error(err?.error?.message || 'Error al salir'),
    });
  }

  openLeaderboard(challenge: ChallengeDto) {
    this.challengeService.getLeaderboard(challenge.challengeId).subscribe({
      next: (lb) => this.leaderboard.set(lb),
      error: () => this.toast.error('Error al cargar leaderboard'),
    });
  }

  closeLeaderboard() {
    this.leaderboard.set(null);
  }

  create() {
    if (!this.formTitle.trim()) {
      this.formError.set('El título es obligatorio');
      return;
    }
    if (!this.formStartDate || !this.formEndDate) {
      this.formError.set('Fecha de inicio y fin son obligatorias');
      return;
    }
    this.formError.set('');
    this.saving.set(true);

    this.challengeService.create({
      title: this.formTitle.trim(),
      description: this.formDescription.trim() || null,
      goalType: this.formGoalType,
      goalDescription: this.formGoalDesc.trim() || null,
      rewardDescription: this.formReward.trim() || null,
      startDate: this.formStartDate,
      endDate: this.formEndDate,
    }).subscribe({
      next: () => {
        this.toast.success('Reto creado');
        this.showCreateForm.set(false);
        this.formTitle = '';
        this.formDescription = '';
        this.saving.set(false);
        this.load();
      },
      error: (err) => {
        this.formError.set(err?.error?.message || 'Error al crear');
        this.saving.set(false);
      },
    });
  }

  leaderboardBarWidth(entry: { score: number }): number {
    const lb = this.leaderboard();
    if (!lb || lb.entries.length === 0) return 0;
    const maxScore = Math.max(...lb.entries.map(e => e.score), 1);
    return (entry.score / maxScore) * 100;
  }
}
