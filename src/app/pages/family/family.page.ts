import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface FamilyMember {
  initials: string;
  name: string;
  role: string;
  streak: number;
  checkInToday: boolean;
  color: string;
}

interface FamilyPost {
  author: string;
  authorInitials: string;
  type: 'checkin' | 'milestone' | 'message';
  content: string;
  time: string;
  likes: number;
}

@Component({
  selector: 'app-family',
  standalone: true,
  imports: [RouterLink],
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

    <div class="family-hero">
      <div class="family-hero-badge">Mi familia</div>
      <h1 class="family-hero-title">
        <span class="italic">Casa</span> Rodríguez
      </h1>
      <p class="family-hero-meta">
        <strong>{{ members().length }} miembros</strong> · Creada hace 12 días
      </p>
      <div class="family-hero-avatars">
        @for (m of members(); track m.name) {
          <div class="fh-av" [style.background]="m.color">
            {{ m.initials }}
            @if (m.checkInToday) {
              <span class="fh-av-check"></span>
            }
          </div>
        }
        <div class="fh-av fh-av-add">+</div>
      </div>
    </div>

    <div class="family-stats">
      <div class="family-stat">
        <div class="family-stat-value">4</div>
        <div class="family-stat-label">Activos hoy</div>
      </div>
      <div class="family-stat">
        <div class="family-stat-value">6</div>
        <div class="family-stat-label">Días racha</div>
      </div>
      <div class="family-stat">
        <div class="family-stat-value">82%</div>
        <div class="family-stat-label">Adherencia</div>
      </div>
    </div>

    <div class="family-section">
      <div class="section-head">
        <h2 class="section-title">Miembros</h2>
      </div>
      <div class="member-list">
        @for (m of members(); track m.name) {
          <div class="member-row">
            <div class="member-av" [style.background]="m.color">{{ m.initials }}</div>
            <div class="member-info">
              <div class="member-name">{{ m.name }}</div>
              <div class="member-role">{{ m.role }} · {{ m.streak }} días</div>
            </div>
            @if (m.checkInToday) {
              <span class="member-done">Hecho</span>
            } @else {
              <span class="member-pending">Pendiente</span>
            }
          </div>
        }
      </div>
    </div>

    <div class="family-section">
      <div class="section-head">
        <h2 class="section-title">Actividad reciente</h2>
      </div>
      <div class="feed">
        @for (post of feed(); track post.content) {
          <div class="feed-item">
            <div class="feed-av" [style.background]="getColor(post.authorInitials)">{{ post.authorInitials }}</div>
            <div class="feed-body">
              <div class="feed-header">
                <span class="feed-author">{{ post.author }}</span>
                <span class="feed-time">{{ post.time }}</span>
              </div>
              <div class="feed-content">{{ post.content }}</div>
              <div class="feed-actions">
                <button class="feed-like">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                  {{ post.likes }}
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  </div>

  <nav class="bottom-nav">
    <a routerLink="/dashboard" class="nav-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
      Hoy
    </a>
    <a routerLink="/plan" class="nav-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
      Plan
    </a>
    <a class="nav-item active">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
      Familia
    </a>
    <a routerLink="/progress" class="nav-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
      Avances
    </a>
    <a routerLink="/profile" class="nav-item">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      Yo
    </a>
  </nav>
  `,
  styles: [`
    :host { display: contents; }
    .page {
      max-width: 480px; margin: 0 auto;
      padding: 0 20px 120px;
      background: var(--cream);
      position: relative; z-index: 1;
    }
    .page-header {
      padding: 24px 0 20px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .page-brand {
      font-family: var(--display); font-size: 22px; font-weight: 500;
      color: var(--pine);
      display: flex; align-items: center; gap: 8px;
    }
    .page-brand svg { width: 22px; height: 22px; fill: var(--mint); }
    .page-actions { display: flex; gap: 10px; }
    .icon-btn {
      width: 42px; height: 42px;
      background: var(--paper); border-radius: var(--r-pill);
      display: flex; align-items: center; justify-content: center;
      color: var(--ink); box-shadow: var(--shadow-sm);
    }

    .family-hero {
      background: var(--pine); color: var(--cream);
      border-radius: var(--r-xl); padding: 24px;
      margin-bottom: 20px;
      position: relative; overflow: hidden;
    }
    .family-hero::before {
      content: '';
      position: absolute; top: -40px; right: -30px;
      width: 160px; height: 160px;
      background: radial-gradient(circle, rgba(91,192,150,0.15), transparent 70%);
      border-radius: 50%;
    }
    .family-hero-badge {
      display: inline-block;
      font-size: 10px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;
      background: rgba(91,192,150,0.2); color: var(--mint-light);
      padding: 4px 10px; border-radius: var(--r-pill);
      margin-bottom: 12px; position: relative;
    }
    .family-hero-title {
      font-family: var(--display); font-size: 28px; font-weight: 400;
      letter-spacing: -0.01em; margin-bottom: 6px; position: relative;
    }
    .family-hero-title .italic { font-style: italic; color: var(--mint-light); }
    .family-hero-meta { font-size: 13px; color: rgba(248,244,236,0.6); margin-bottom: 16px; position: relative; }
    .family-hero-meta strong { color: var(--cream); }
    .family-hero-avatars { display: flex; gap: 0; position: relative; }
    .fh-av {
      width: 40px; height: 40px; border-radius: 50%;
      border: 3px solid var(--pine);
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 700; color: var(--pine-darker);
      position: relative;
    }
    .fh-av:not(:first-child) { margin-left: -12px; }
    .fh-av-add {
      background: rgba(248,244,236,0.15);
      border: 2px dashed rgba(248,244,236,0.4);
      color: var(--cream); font-size: 18px;
    }
    .fh-av-check {
      position: absolute; bottom: -2px; right: -2px;
      width: 16px; height: 16px; background: var(--mint);
      border-radius: 50%; border: 2px solid var(--pine);
    }
    .fh-av-check::after {
      content: ''; position: absolute;
      left: 4px; top: 2px; width: 4px; height: 7px;
      border: solid var(--pine-darker); border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }

    .family-stats {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
      margin-bottom: 24px;
    }
    .family-stat {
      background: var(--paper); border: 1px solid var(--line);
      border-radius: var(--r-lg); padding: 16px; text-align: center;
    }
    .family-stat-value {
      font-family: var(--display); font-size: 28px; font-weight: 500;
      color: var(--pine); line-height: 1;
    }
    .family-stat-label {
      font-size: 11px; font-weight: 600; color: var(--ink-muted);
      letter-spacing: 0.06em; margin-top: 6px;
    }

    .section-head {
      display: flex; justify-content: space-between;
      align-items: baseline; margin-bottom: 16px;
    }
    .section-title {
      font-family: var(--display); font-size: 20px; font-weight: 400;
      letter-spacing: -0.01em; color: var(--ink);
    }

    .member-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
    .member-row {
      background: var(--paper); border: 1px solid var(--line);
      border-radius: var(--r-lg); padding: 14px;
      display: flex; align-items: center; gap: 14px;
    }
    .member-av {
      width: 40px; height: 40px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 700; color: var(--pine-darker);
      flex-shrink: 0;
    }
    .member-info { flex: 1; }
    .member-name { font-size: 14px; font-weight: 600; color: var(--ink); }
    .member-role { font-size: 11px; color: var(--ink-muted); margin-top: 2px; }
    .member-done {
      font-size: 11px; font-weight: 600; color: var(--pine);
      background: var(--mint-soft); padding: 4px 10px;
      border-radius: var(--r-pill);
    }
    .member-pending {
      font-size: 11px; font-weight: 600; color: var(--ink-muted);
      background: var(--cream-warm); padding: 4px 10px;
      border-radius: var(--r-pill);
    }

    .feed { display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
    .feed-item {
      background: var(--paper); border: 1px solid var(--line);
      border-radius: var(--r-lg); padding: 16px;
      display: flex; gap: 12px;
    }
    .feed-av {
      width: 36px; height: 36px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 12px; font-weight: 700; color: var(--pine-darker);
      flex-shrink: 0;
    }
    .feed-body { flex: 1; }
    .feed-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 6px;
    }
    .feed-author { font-size: 13px; font-weight: 600; color: var(--ink); }
    .feed-time { font-size: 11px; color: var(--ink-muted); }
    .feed-content { font-size: 13px; color: var(--ink-light); line-height: 1.5; margin-bottom: 10px; }
    .feed-actions { display: flex; gap: 12px; }
    .feed-like {
      display: inline-flex; align-items: center; gap: 4px;
      font-size: 12px; color: var(--ink-muted);
    }

    .bottom-nav {
      position: fixed; bottom: 0; left: 50%;
      transform: translateX(-50%);
      width: calc(100% - 32px);
      max-width: 448px;
      background: var(--pine);
      border-radius: var(--r-pill);
      margin: 16px;
      padding: 8px;
      display: flex;
      justify-content: space-around;
      z-index: 100;
      box-shadow: var(--shadow-pine);
    }
    .nav-item {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; gap: 4px;
      padding: 10px 0;
      color: rgba(248,244,236,0.55);
      font-size: 10px; font-weight: 600;
      letter-spacing: 0.06em; text-transform: uppercase;
      border-radius: var(--r-pill);
      cursor: pointer;
    }
    .nav-item.active { background: var(--mint); color: var(--pine-darker); }
    .nav-item svg { width: 20px; height: 20px; }

    .page-header { animation: slideDown 0.5s var(--ease-out); }
    .family-hero { animation: slideUp 0.7s var(--ease-out) 0.05s both; }
    .family-stats { animation: slideUp 0.7s var(--ease-out) 0.1s both; }
    .family-section:nth-of-type(1) { animation: slideUp 0.7s var(--ease-out) 0.15s both; }
    .family-section:nth-of-type(2) { animation: slideUp 0.7s var(--ease-out) 0.2s both; }
    .bottom-nav { animation: slideUp 0.5s var(--ease-out) 0.25s both; }
    @keyframes slideDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class FamilyPage {
  private readonly auth = inject(AuthService);
  readonly user = this.auth.state;

  readonly members = signal<FamilyMember[]>([
    { initials: 'ER', name: 'Eduardo', role: 'Organizador', streak: 12, checkInToday: true, color: 'linear-gradient(135deg, var(--mint), var(--lake))' },
    { initials: 'MP', name: 'María', role: 'Miembro', streak: 8, checkInToday: true, color: 'linear-gradient(135deg, var(--coral-soft), var(--coral))' },
    { initials: 'LJ', name: 'Luis', role: 'Miembro', streak: 6, checkInToday: false, color: 'linear-gradient(135deg, var(--mint-light), var(--mint))' },
    { initials: 'AG', name: 'Ana', role: 'Miembro', streak: 4, checkInToday: true, color: 'linear-gradient(135deg, var(--lake-light), var(--lake))' },
  ]);

  readonly feed = signal<FamilyPost[]>([
    { author: 'María', authorInitials: 'MP', type: 'checkin', content: '✅ Check-in completado. Energía 8/10, estado de ánimo 10/10!', time: 'Hace 2h', likes: 3 },
    { author: 'Eduardo', authorInitials: 'ER', type: 'milestone', content: '🎉 ¡Primer kilo alcanzado! 87.4 kg → 86.2 kg en 12 días.', time: 'Hace 4h', likes: 7 },
    { author: 'Ana', authorInitials: 'AG', type: 'checkin', content: '💪 Día 4 y sigo firme. El salmón al chipotle del plan está increíble.', time: 'Hace 6h', likes: 5 },
  ]);

  getColor(initials: string): string {
    const colors = [
      'linear-gradient(135deg, var(--mint), var(--lake))',
      'linear-gradient(135deg, var(--coral-soft), var(--coral))',
      'linear-gradient(135deg, var(--mint-light), var(--mint))',
      'linear-gradient(135deg, var(--lake-light), var(--lake))',
      'linear-gradient(135deg, var(--gold-soft), var(--gold))',
    ];
    return colors[initials.charCodeAt(0) % colors.length];
  }
}
