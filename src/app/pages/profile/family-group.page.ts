import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FamilyService } from '../../services/family.service';
import { NcLoadingComponent, NcPageHeaderComponent } from '../../shared/components';
import type { FamilyMemberDto, FamilyStatsDto } from '../../models/family.models';

@Component({
  selector: 'app-family-group',
  standalone: true,
  imports: [DatePipe, NcLoadingComponent, NcPageHeaderComponent],
  template: `
  <div class="page">
    <nc-page-header title="Mi grupo familiar" backLink="/profile"></nc-page-header>

    @if (loading()) {
      <nc-loading></nc-loading>
    } @else {
      @if (stats(); as s) {
        <div class="group-card">
          <div class="group-name">{{ s.groupName }}</div>
          <div class="group-stats">
            <div class="gs-item">
              <span class="gs-value">{{ s.totalMembers }}</span>
              <span class="gs-label">Miembros</span>
            </div>
            <div class="gs-item">
              <span class="gs-value">{{ s.activeToday }}</span>
              <span class="gs-label">Activos hoy</span>
            </div>
            <div class="gs-item">
              <span class="gs-value">{{ s.dailyStreak }}</span>
              <span class="gs-label">Racha grupal</span>
            </div>
            <div class="gs-item">
              <span class="gs-value">{{ s.adherencePercent }}%</span>
              <span class="gs-label">Adherencia</span>
            </div>
          </div>
        </div>
      }

      <div class="members-section">
        <h2 class="section-title">Miembros</h2>
        @for (member of members(); track member.userId) {
          <div class="member">
            <div class="member-avatar">{{ member.fullName.charAt(0).toUpperCase() }}</div>
            <div class="member-info">
              <span class="member-name">{{ member.fullName }}</span>
              <span class="member-role">{{ roleLabel(member.role) }}</span>
            </div>
            <div class="member-date">Desde {{ member.joinedAt | date:'MMM y' }}</div>
          </div>
        }
      </div>
    }
  </div>
  `,
  styles: [`
    :host { display: contents; }
    .page { max-width: 480px; margin: 0 auto; padding: 0 20px 120px; background: var(--cream); }
    .group-card { background: linear-gradient(135deg, var(--pine), var(--pine-soft)); border-radius: var(--r-xl); padding: 24px; color: var(--cream); margin-bottom: 24px; }
    .group-name { font-family: var(--display); font-size: 24px; font-weight: 500; margin-bottom: 20px; }
    .group-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
    .gs-item { text-align: center; }
    .gs-value { display: block; font-family: var(--display); font-size: 22px; font-weight: 500; }
    .gs-label { display: block; font-size: 10px; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px; }
    .members-section { }
    .section-title { font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: var(--mint); margin-bottom: 12px; }
    .member { display: flex; align-items: center; gap: 14px; background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 14px; margin-bottom: 8px; }
    .member-avatar { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--mint), var(--lake)); display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; color: var(--pine-darker); flex-shrink: 0; }
    .member-info { flex: 1; }
    .member-name { display: block; font-size: 14px; font-weight: 600; color: var(--ink); }
    .member-role { display: block; font-size: 11px; color: var(--ink-muted); margin-top: 2px; }
    .member-date { font-size: 11px; color: var(--ink-muted); }
  `]
})
export class FamilyGroupPage {
  private readonly family = inject(FamilyService);

  readonly loading = signal(true);
  readonly members = signal<FamilyMemberDto[]>([]);
  readonly stats = signal<FamilyStatsDto | null>(null);

  constructor() {
    this.family.getMembers().subscribe(m => { this.members.set(m); this.loading.set(false); });
    this.family.getStats().subscribe(s => this.stats.set(s));
  }

  roleLabel(role: string): string {
    const map: Record<string, string> = { owner: 'Creador', admin: 'Admin', member: 'Miembro', pending: 'Pendiente' };
    return map[role] || role;
  }
}
