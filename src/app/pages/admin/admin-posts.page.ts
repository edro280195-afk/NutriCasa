import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { AdminPostDto } from '../../models/admin.models';

@Component({
  selector: 'app-admin-posts',
  standalone: true,
  imports: [DatePipe],
  template: `
  @if (loading()) {
    <div class="skeleton-list">
      @for (_ of [1,2,3,4,5]; track $index) {
        <div class="post-row skeleton">&nbsp;</div>
      }
    </div>
  } @else if (error()) {
    <div class="error-card">{{ error() }}</div>
  } @else {
    <div class="posts-list">
      @for (post of posts(); track post.postId) {
        <div class="post-row">
          <div class="post-info">
            <div class="post-author">{{ post.authorName }}</div>
            <div class="post-content">{{ post.content }}</div>
            <div class="post-meta">
              <span class="post-group">{{ post.groupName }}</span>
              <span class="post-reactions">{{ post.reactionCount }} reacciones</span>
              <span class="post-date">{{ post.createdAt | date:'dd/MM/yy HH:mm' }}</span>
            </div>
          </div>
          <button class="delete-btn" (click)="confirmDelete(post)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      } @empty {
        <div class="empty">Sin publicaciones</div>
      }
    </div>
  }
  `,
  styles: [`
    .posts-list {
      background: var(--paper); border: 1px solid var(--line);
      border-radius: var(--r-lg); overflow: hidden;
    }
    .post-row {
      display: flex; align-items: flex-start; justify-content: space-between;
      padding: 14px 16px; border-bottom: 1px solid var(--line);
      gap: 12px;
    }
    .post-row:last-child { border-bottom: none; }
    .post-info { flex: 1; min-width: 0; }
    .post-author {
      font-size: 12px; font-weight: 600; color: var(--pine);
      margin-bottom: 2px;
    }
    .post-content {
      font-size: 13px; color: var(--ink); line-height: 1.4;
      margin-bottom: 6px;
    }
    .post-meta {
      display: flex; gap: 8px; flex-wrap: wrap;
      font-size: 10px; color: var(--ink-muted);
    }
    .post-group, .post-reactions, .post-date { font-weight: 500; }
    .delete-btn {
      width: 36px; height: 36px; display: flex;
      align-items: center; justify-content: center;
      border-radius: var(--r-lg); border: 1px solid var(--line);
      background: var(--paper); cursor: pointer;
      color: var(--ink-muted); flex-shrink: 0;
      transition: all 0.2s var(--ease-out);
    }
    .delete-btn:hover {
      background: var(--coral-bg); color: var(--coral);
      border-color: var(--coral-soft);
    }
    .skeleton-list { display: flex; flex-direction: column; gap: 1px; }
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
    .empty {
      padding: 32px; text-align: center; color: var(--ink-muted);
      font-size: 13px;
    }
  `]
})
export class AdminPostsPage {
  private readonly admin = inject(AdminService);

  readonly posts = signal<AdminPostDto[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  constructor() {
    this.admin.getPosts().subscribe({
      next: (p) => { this.posts.set(p); this.loading.set(false); },
      error: () => { this.error.set('Error al cargar publicaciones'); this.loading.set(false); },
    });
  }

  confirmDelete(post: AdminPostDto) {
    if (!confirm(`¿Eliminar publicación de ${post.authorName}?\n"${post.content}"`)) return;
    this.admin.deletePost(post.postId).subscribe({
      next: () => this.posts.update(p => p.filter(x => x.postId !== post.postId)),
      error: () => alert('Error al eliminar publicación'),
    });
  }
}
