import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { AdminDashboardDto } from '../../models/admin.models';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [DatePipe],
  template: `
  @if (loading()) {
    <div class="skeleton-grid">
      @for (_ of [1,2,3,4,5,6]; track $index) {
        <div class="stat-card skeleton">&nbsp;</div>
      }
    </div>
  } @else if (error()) {
    <div class="error-card">{{ error() }}</div>
  } @else {
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-label">Usuarios totales</div>
        <div class="stat-value">{{ dash().totalUsers }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Suscripciones activas</div>
        <div class="stat-value">{{ dash().activeSubscriptions }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Posts hoy</div>
        <div class="stat-value">{{ dash().postsToday }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Nuevos hoy</div>
        <div class="stat-value">{{ dash().newUsersToday }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Recetas totales</div>
        <div class="stat-value">{{ dash().totalRecipes }}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Verif. pendientes</div>
        <div class="stat-value warn">{{ dash().pendingVerifications }}</div>
      </div>
    </div>

    @if (dash().recentPosts?.length ?? false) {
      <div class="section-title">Posts recientes</div>
      <div class="posts-card">
        @for (post of dash().recentPosts; track post.postId) {
          <div class="recent-post">
            <div class="rp-author">{{ post.authorName }}</div>
            <div class="rp-content">{{ post.content }}</div>
            <div class="rp-date">{{ post.createdAt | date:'dd/MM/yy HH:mm' }}</div>
          </div>
        }
      </div>
    }
  }
  `,
  styles: [`
    .stat-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
      margin-bottom: 24px;
    }
    .stat-card {
      background: var(--paper); border: 1px solid var(--line);
      border-radius: var(--r-lg); padding: 16px 12px;
      text-align: center;
    }
    .stat-label {
      font-size: 10px; font-weight: 600; color: var(--ink-muted);
      letter-spacing: 0.06em; text-transform: uppercase;
      margin-bottom: 6px;
    }
    .stat-value {
      font-family: var(--display); font-size: 28px;
      font-weight: 500; color: var(--pine); line-height: 1;
    }
    .stat-value.warn { color: var(--coral); }
    .skeleton-grid {
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;
      margin-bottom: 24px;
    }
    .skeleton {
      height: 72px; border-radius: var(--r-lg);
      background: var(--line); opacity: 0.5;
      animation: pulse 1.5s ease-in-out infinite;
    }
    @keyframes pulse { 0%,100% { opacity: 0.5; } 50% { opacity: 0.3; } }
    .error-card {
      background: var(--coral-bg); border: 1px solid var(--coral-soft);
      border-radius: var(--r-lg); padding: 20px;
      color: var(--coral); font-size: 14px; text-align: center;
    }
    .section-title {
      font-size: 11px; font-weight: 700; letter-spacing: 0.18em;
      text-transform: uppercase; color: var(--mint);
      margin-bottom: 12px;
    }
    .posts-card {
      background: var(--paper); border: 1px solid var(--line);
      border-radius: var(--r-lg); overflow: hidden;
    }
    .recent-post {
      padding: 14px 16px; border-bottom: 1px solid var(--line);
    }
    .recent-post:last-child { border-bottom: none; }
    .rp-author {
      font-size: 12px; font-weight: 600; color: var(--pine);
      margin-bottom: 2px;
    }
    .rp-content {
      font-size: 13px; color: var(--ink); line-height: 1.4;
      margin-bottom: 4px;
    }
    .rp-date {
      font-size: 10px; color: var(--ink-muted);
    }
  `]
})
export class AdminDashboardPage {
  private readonly admin = inject(AdminService);

  readonly dash = signal<AdminDashboardDto>({} as AdminDashboardDto);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.admin.getDashboard().subscribe({
      next: (d) => { this.dash.set(d); this.loading.set(false); },
      error: () => { this.error.set('Error al cargar dashboard'); this.loading.set(false); },
    });
  }
}
