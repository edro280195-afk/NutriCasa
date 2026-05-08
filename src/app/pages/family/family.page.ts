import { Component, inject, signal, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FamilyService } from '../../services/family.service';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import type { FamilyMemberDto, FamilyPostDto, FamilyStatsDto } from '../../models/family.models';

@Component({
  selector: 'app-family',
  standalone: true,
  imports: [TimeAgoPipe],
  template: `
  <div class="page">
    <div class="page-header">
      <div class="page-brand">
        <svg class="leaf-icon" viewBox="0 0 24 24"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>
        NutriCasa
      </div>
      <div class="page-actions">
        <button class="icon-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
        </button>
      </div>
    </div>

    @if (loading()) {
      <div class="loading-state">
        <div class="spinner-lg"></div>
        <p>Cargando familia...</p>
      </div>
    } @else {
      <div class="family-hero">
        <div class="family-hero-badge">Mi familia</div>
        <h1 class="family-hero-title">
          <span class="italic">{{ stats().groupName }}</span>
        </h1>
        <p class="family-hero-meta">
          <strong>{{ stats().totalMembers }} miembros</strong> · {{ stats().daysActive }} días activos
        </p>
        <div class="family-hero-avatars">
          @for (m of members(); track m.userId) {
            <div class="fh-av" [style.background]="getColor(m.userId)">
              {{ m.fullName.charAt(0) }}{{ m.fullName.split(' ').pop()?.charAt(0) }}
              <span class="fh-av-check"></span>
            </div>
          }
          <div class="fh-av fh-av-add">+</div>
        </div>
      </div>

      <div class="family-stats">
        <div class="family-stat">
          <div class="family-stat-value">{{ stats().activeToday }}</div>
          <div class="family-stat-label">Activos hoy</div>
        </div>
        <div class="family-stat">
          <div class="family-stat-value">{{ stats().dailyStreak }}</div>
          <div class="family-stat-label">Días racha</div>
        </div>
        <div class="family-stat">
          <div class="family-stat-value">{{ stats().adherencePercent }}%</div>
          <div class="family-stat-label">Adherencia</div>
        </div>
      </div>

      <div class="family-section">
        <div class="section-head">
          <h2 class="section-title">Miembros</h2>
        </div>
        <div class="member-list">
          @for (m of members(); track m.userId) {
            <div class="member-row">
              <div class="member-av" [style.background]="getColor(m.userId)">
                {{ m.fullName.charAt(0) }}{{ m.fullName.split(' ').pop()?.charAt(0) }}
              </div>
              <div class="member-info">
                <div class="member-name">{{ m.fullName }}</div>
                <div class="member-role">{{ m.role }}</div>
              </div>
            </div>
          }
        </div>
      </div>

      <div class="family-section">
        <div class="section-head">
          <h2 class="section-title">Actividad reciente</h2>
        </div>
        <div class="feed">
          @for (post of feed(); track post.postId) {
            <div class="feed-item">
              <div class="feed-av" [style.background]="getColor(post.postId)">{{ post.authorName.charAt(0) }}</div>
              <div class="feed-body">
                <div class="feed-header">
                  <span class="feed-author">{{ post.authorName }}</span>
                  <span class="feed-time">{{ post.createdAt | timeAgo }}</span>
                </div>
                <div class="feed-content">{{ post.content }}</div>
              </div>
            </div>
          } @empty {
            <p style="font-size:13px;color:var(--ink-muted);text-align:center;padding:32px 0;">Aún no hay actividad en tu grupo.</p>
          }
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
    .page-actions { display: flex; gap: 10px; }
    .icon-btn { width: 42px; height: 42px; background: var(--paper); border-radius: var(--r-pill); display: flex; align-items: center; justify-content: center; color: var(--ink); box-shadow: var(--shadow-sm); }

    .family-hero { background: var(--pine); color: var(--cream); border-radius: var(--r-xl); padding: 24px; margin-bottom: 20px; position: relative; overflow: hidden; }
    .family-hero::before { content: ''; position: absolute; top: -40px; right: -30px; width: 160px; height: 160px; background: radial-gradient(circle, rgba(91,192,150,0.15), transparent 70%); border-radius: 50%; }
    .family-hero-badge { display: inline-block; font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; background: rgba(91,192,150,0.2); color: var(--mint-light); padding: 4px 10px; border-radius: var(--r-pill); margin-bottom: 12px; position: relative; }
    .family-hero-title { font-family: var(--display); font-size: 28px; font-weight: 400; letter-spacing: -0.01em; margin-bottom: 6px; position: relative; }
    .family-hero-title .italic { font-style: italic; color: var(--mint-light); }
    .family-hero-meta { font-size: 13px; color: rgba(248,244,236,0.6); margin-bottom: 16px; position: relative; }
    .family-hero-meta strong { color: var(--cream); }
    .family-hero-avatars { display: flex; gap: 0; position: relative; }
    .fh-av { width: 40px; height: 40px; border-radius: 50%; border: 3px solid var(--pine); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: var(--pine-darker); position: relative; }
    .fh-av:not(:first-child) { margin-left: -12px; }
    .fh-av-add { background: rgba(248,244,236,0.15); border: 2px dashed rgba(248,244,236,0.4); color: var(--cream); font-size: 18px; }
    .fh-av-check { position: absolute; bottom: -2px; right: -2px; width: 16px; height: 16px; background: var(--mint); border-radius: 50%; border: 2px solid var(--pine); }
    .fh-av-check::after { content: ''; position: absolute; left: 4px; top: 2px; width: 4px; height: 7px; border: solid var(--pine-darker); border-width: 0 2px 2px 0; transform: rotate(45deg); }

    .family-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
    .family-stat { background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 16px; text-align: center; }
    .family-stat-value { font-family: var(--display); font-size: 28px; font-weight: 500; color: var(--pine); line-height: 1; }
    .family-stat-label { font-size: 11px; font-weight: 600; color: var(--ink-muted); letter-spacing: 0.06em; margin-top: 6px; }

    .section-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px; }
    .section-title { font-family: var(--display); font-size: 20px; font-weight: 400; letter-spacing: -0.01em; color: var(--ink); }

    .member-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
    .member-row { background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 14px; display: flex; align-items: center; gap: 14px; }
    .member-av { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: var(--pine-darker); flex-shrink: 0; }
    .member-info { flex: 1; }
    .member-name { font-size: 14px; font-weight: 600; color: var(--ink); }
    .member-role { font-size: 11px; color: var(--ink-muted); margin-top: 2px; text-transform: capitalize; }

    .feed { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
    .feed-item { background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 16px; display: flex; gap: 12px; }
    .feed-av { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: var(--pine-darker); flex-shrink: 0; }
    .feed-body { flex: 1; }
    .feed-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .feed-author { font-size: 13px; font-weight: 600; color: var(--ink); }
    .feed-time { font-size: 11px; color: var(--ink-muted); }
    .feed-content { font-size: 13px; color: var(--ink-light); line-height: 1.5; margin-bottom: 10px; }

    .loading-state { text-align: center; padding: 60px 20px; }
    .loading-state p { font-size: 15px; color: var(--ink-soft); margin-top: 20px; }
    .spinner-lg { width: 40px; height: 40px; border: 3px solid var(--line); border-top-color: var(--pine); border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .page-header { animation: slideDown 0.5s var(--ease-out); }
    .family-hero { animation: slideUp 0.7s var(--ease-out) 0.05s both; }
    .family-stats { animation: slideUp 0.7s var(--ease-out) 0.1s both; }
    .family-section:nth-of-type(1) { animation: slideUp 0.7s var(--ease-out) 0.15s both; }
    .family-section:nth-of-type(2) { animation: slideUp 0.7s var(--ease-out) 0.2s both; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class FamilyPage implements OnInit {
  private readonly family = inject(FamilyService);

  readonly members = signal<FamilyMemberDto[]>([]);
  readonly feed = signal<FamilyPostDto[]>([]);
  readonly stats = signal<FamilyStatsDto>({ totalMembers: 0, activeToday: 0, dailyStreak: 0, adherencePercent: 0, groupName: 'Mi Familia', daysActive: 0 });
  readonly loading = signal(true);

  ngOnInit() {
    this.family.getMembers().subscribe(m => this.members.set(m));
    this.family.getFeed().subscribe(f => this.feed.set(f));
    this.family.getStats().subscribe(s => { this.stats.set(s); this.loading.set(false); });
  }

  getColor(id: string): string {
    const colors = [
      'linear-gradient(135deg, var(--mint), var(--lake))',
      'linear-gradient(135deg, var(--coral-soft), var(--coral))',
      'linear-gradient(135deg, var(--mint-light), var(--mint))',
      'linear-gradient(135deg, var(--lake-light), var(--lake))',
      'linear-gradient(135deg, var(--gold-soft), var(--gold))',
    ];
    return colors[id.charCodeAt(0) % colors.length];
  }
}
