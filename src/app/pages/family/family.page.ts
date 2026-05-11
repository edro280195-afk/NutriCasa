import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FamilyService } from '../../services/family.service';
import { AuthService } from '../../services/auth.service';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { NcToastService } from '../../shared/components/nc-toast.service';
import type { FamilyMemberDto, FamilyPostDto, FamilyStatsDto, PostResultDto, ReactionResultDto, CommentResultDto } from '../../models/family.models';

@Component({
  selector: 'app-family',
  standalone: true,
  imports: [FormsModule, TimeAgoPipe],
  template: `
  <div class="page">
    <div class="page-header">
      <div class="page-brand">
        <svg class="leaf-icon" viewBox="0 0 24 24"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>
        NutriCasa
      </div>
      <div class="page-actions">
        <span class="connection-dot" [class.online]="online()"></span>
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
          <h2 class="section-title">Muro</h2>
        </div>

        <div class="composer">
          <textarea [(ngModel)]="newPostContent" placeholder="¿Qué quieres compartir con tu familia?" maxlength="500" rows="2" class="composer-input"></textarea>
          <div class="composer-actions">
            <span class="composer-count">{{ newPostContent().length }}/500</span>
            <button class="btn-primary" [disabled]="!newPostContent().trim() || posting()" (click)="submitPost()">
              {{ posting() ? 'Publicando...' : 'Publicar' }}
            </button>
          </div>
        </div>

        <div class="feed">
          @for (post of feed(); track post.postId) {
            <div class="feed-card">
              <div class="feed-header-row">
                <div class="feed-av" [style.background]="getColor(post.authorUserId || post.postId)">{{ post.authorName.charAt(0) }}</div>
                <div class="feed-header-info">
                  <span class="feed-author">{{ post.authorName }}</span>
                  <span class="feed-time">{{ post.createdAt | timeAgo }}</span>
                </div>
                @if (post.authorUserId === currentUserId()) {
                  <button class="feed-delete" (click)="deletePost(post.postId)" title="Eliminar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  </button>
                }
              </div>
              <div class="feed-content">{{ post.content }}</div>

              <div class="feed-reactions">
                @if (post.reactions.length > 0) {
                  <div class="reaction-bubbles">
                    @for (r of post.reactions; track r.type) {
                      @if (r.count > 0) {
                        <button class="reaction-chip" [class.active]="r.hasCurrentUserReacted" (click)="toggleReaction(post.postId, r.type)">
                          <span class="reaction-emoji">{{ reactionEmoji(r.type) }}</span>
                          {{ r.count }}
                        </button>
                      }
                    }
                  </div>
                }
                <div class="reaction-actions">
                  @for (emoji of availableReactions; track emoji) {
                    <button class="reaction-btn" (click)="toggleReaction(post.postId, emoji)" [title]="emoji">
                      {{ reactionEmoji(emoji) }}
                    </button>
                  }
                </div>
              </div>

              <div class="feed-comments">
                @for (c of post.comments; track c.commentId) {
                  <div class="comment-row">
                    <strong>{{ c.authorName }}</strong>
                    <span class="comment-text">{{ c.content }}</span>
                    @if (c.isOwner) {
                      <button class="comment-delete" (click)="deleteComment(post.postId, c.commentId)">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
                      </button>
                    }
                  </div>
                }
                <div class="comment-composer">
                  <input #commentInput [(ngModel)]="commentText[post.postId]" (keydown.enter)="submitComment(post.postId, commentInput)" placeholder="Escribe un comentario..." maxlength="200">
                  <button class="comment-send" [disabled]="!commentText[post.postId]?.trim()" (click)="submitComment(post.postId, commentInput)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                  </button>
                </div>
              </div>
            </div>
          } @empty {
            <p class="feed-empty">Aún no hay actividad en tu grupo. ¡Sé el primero en publicar!</p>
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
    .page-actions { display: flex; gap: 10px; align-items: center; }
    .connection-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--ink-soft); transition: background 0.3s; }
    .connection-dot.online { background: var(--mint); box-shadow: 0 0 6px var(--mint); }

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
    .fh-av-check { position: absolute; bottom: -2px; right: -2px; width: 16px; height: 16px; background: var(--mint); border-radius: 50%; border: 2px solid var(--pine); }
    .fh-av-check::after { content: ''; position: absolute; left: 4px; top: 2px; width: 4px; height: 7px; border: solid var(--pine-darker); border-width: 0 2px 2px 0; transform: rotate(45deg); }

    .family-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
    .family-stat { background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 16px; text-align: center; }
    .family-stat-value { font-family: var(--display); font-size: 28px; font-weight: 500; color: var(--pine); line-height: 1; }
    .family-stat-label { font-size: 11px; font-weight: 600; color: var(--ink-muted); letter-spacing: 0.06em; margin-top: 6px; }

    .section-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px; }
    .section-title { font-family: var(--display); font-size: 20px; font-weight: 400; letter-spacing: -0.01em; color: var(--ink); }

    .composer { background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 14px; margin-bottom: 16px; }
    .composer-input { width: 100%; border: none; background: transparent; resize: none; font-family: inherit; font-size: 14px; color: var(--ink); outline: none; line-height: 1.5; }
    .composer-input::placeholder { color: var(--ink-soft); }
    .composer-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--line); }
    .composer-count { font-size: 11px; color: var(--ink-soft); }
    .btn-primary { background: var(--pine); color: var(--cream); border: none; padding: 8px 20px; border-radius: var(--r-pill); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-primary:disabled { opacity: 0.4; cursor: default; }
    .btn-primary:not(:disabled):hover { background: var(--pine-darker); }

    .feed { display: flex; flex-direction: column; gap: 14px; margin-bottom: 32px; }
    .feed-card { background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 16px; }
    .feed-header-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
    .feed-av { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: var(--pine-darker); flex-shrink: 0; }
    .feed-header-info { display: flex; flex-direction: column; flex: 1; }
    .feed-author { font-size: 13px; font-weight: 600; color: var(--ink); }
    .feed-time { font-size: 11px; color: var(--ink-muted); }
    .feed-delete { width: 28px; height: 28px; border-radius: 50%; border: none; background: transparent; color: var(--ink-soft); cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .feed-delete:hover { background: var(--bg); color: var(--coral); }
    .feed-content { font-size: 14px; color: var(--ink); line-height: 1.6; margin-bottom: 12px; white-space: pre-wrap; }

    .reaction-bubbles { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
    .reaction-chip { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: var(--r-pill); border: 1px solid var(--line); background: var(--bg); font-size: 12px; color: var(--ink-muted); cursor: pointer; transition: all 0.15s; }
    .reaction-chip.active { background: var(--mint-soft); border-color: var(--mint); color: var(--pine); font-weight: 600; }
    .reaction-emoji { font-size: 14px; }
    .reaction-actions { display: flex; gap: 4px; padding: 8px 0; border-top: 1px solid var(--line); }
    .reaction-btn { width: 30px; height: 30px; border-radius: 50%; border: none; background: transparent; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: transform 0.15s; }
    .reaction-btn:hover { transform: scale(1.3); background: var(--bg); }

    .feed-comments { border-top: 1px solid var(--line); padding-top: 10px; }
    .comment-row { font-size: 13px; color: var(--ink-light); padding: 4px 0; display: flex; align-items: baseline; gap: 6px; }
    .comment-row strong { font-size: 12px; color: var(--ink); white-space: nowrap; }
    .comment-text { flex: 1; }
    .comment-delete { background: none; border: none; color: var(--ink-soft); cursor: pointer; padding: 2px; opacity: 0; transition: opacity 0.15s; }
    .comment-row:hover .comment-delete { opacity: 1; }
    .comment-delete:hover { color: var(--coral); }
    .comment-composer { display: flex; gap: 8px; margin-top: 8px; }
    .comment-composer input { flex: 1; border: none; background: var(--bg); border-radius: var(--r-pill); padding: 8px 12px; font-size: 12px; font-family: inherit; outline: none; color: var(--ink); }
    .comment-composer input::placeholder { color: var(--ink-soft); }
    .comment-send { width: 32px; height: 32px; border-radius: 50%; border: none; background: var(--pine); color: var(--cream); cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .comment-send:disabled { opacity: 0.4; }
    .comment-send:not(:disabled):hover { background: var(--pine-darker); }

    .feed-empty { text-align: center; padding: 32px 0; font-size: 13px; color: var(--ink-muted); }

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
export class FamilyPage implements OnInit, OnDestroy {
  private readonly family = inject(FamilyService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(NcToastService);
  private subs: Subscription[] = [];

  readonly members = signal<FamilyMemberDto[]>([]);
  readonly feed = signal<FamilyPostDto[]>([]);
  readonly stats = signal<FamilyStatsDto>({ totalMembers: 0, activeToday: 0, dailyStreak: 0, adherencePercent: 0, groupName: 'Mi Familia', daysActive: 0 });
  readonly loading = signal(true);
  readonly online = signal(false);
  readonly posting = signal(false);
  readonly newPostContent = signal('');

  readonly currentUserId = signal<string | null>(null);
  readonly commentText: Record<string, string> = {};

  readonly availableReactions = ['Like', 'Fire', 'Heart', 'Clap', 'Wow'];

  ngOnInit() {
    this.currentUserId.set(this.auth.state().user?.userId ?? null);
    this.loadData();
    this.connectSignalR();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    this.family.disconnect();
  }

  private loadData() {
    this.family.getMembers().subscribe(m => this.members.set(m));
    this.family.getFeed().subscribe(f => this.feed.set(f));
    this.family.getStats().subscribe(s => { this.stats.set(s); this.loading.set(false); });
  }

  private async connectSignalR() {
    try {
      await this.family.connect();
      this.online.set(true);

      this.subs.push(
        this.family.connected.subscribe(c => this.online.set(c)),
        this.family.onPostCreated.subscribe(p => this.prependPost(p)),
        this.family.onReactionToggled.subscribe(d => this.updateReaction(d.postId, d.reaction)),
        this.family.onCommentAdded.subscribe(d => this.appendComment(d.postId, d.comment)),
      );
    } catch {
      this.online.set(false);
    }
  }

  private prependPost(post: PostResultDto) {
    this.feed.update(f => [{
      postId: post.postId, authorUserId: undefined, authorName: post.authorName,
      postType: post.postType, content: post.content, createdAt: post.createdAt,
      reactions: [], comments: [], commentCount: 0,
    }, ...f]);
  }

  private updateReaction(postId: string, reaction: ReactionResultDto) {
    this.feed.update(f => f.map(p => {
      if (p.postId !== postId) return p;
      const existing = p.reactions.find(r => r.type.toLowerCase() === reaction.reactionType.toLowerCase());
      if (existing) {
        existing.count = reaction.count;
        existing.hasCurrentUserReacted = reaction.hasReacted;
      } else {
        p.reactions.push({ type: reaction.reactionType.toLowerCase(), count: reaction.count, hasCurrentUserReacted: reaction.hasReacted, users: [] });
      }
      return { ...p };
    }));
  }

  private appendComment(postId: string, comment: CommentResultDto) {
    this.feed.update(f => f.map(p => {
      if (p.postId !== postId) return p;
      return {
        ...p,
        comments: [...p.comments, { ...comment, isOwner: comment.userId === this.currentUserId() }],
        commentCount: p.commentCount + 1,
      };
    }));
  }

  submitPost() {
    const content = this.newPostContent().trim();
    if (!content || this.posting()) return;

    this.posting.set(true);
    this.family.createPost(content).subscribe({
      next: (post) => {
        this.prependPost(post);
        this.newPostContent.set('');
        this.posting.set(false);
        this.toast.success('Publicado en el muro');
      },
      error: () => {
        this.posting.set(false);
        this.toast.error('Error al publicar');
      }
    });
  }

  toggleReaction(postId: string, type: string) {
    this.family.toggleReaction(postId, type).subscribe({
      error: () => this.toast.error('Error al reaccionar')
    });
  }

  submitComment(postId: string, input: HTMLInputElement) {
    const content = this.commentText[postId]?.trim();
    if (!content) return;

    this.family.addComment(postId, content).subscribe({
      next: () => {
        this.commentText[postId] = '';
        input.value = '';
        input.focus();
      },
      error: () => this.toast.error('Error al comentar')
    });
  }

  deletePost(postId: string) {
    this.family.deletePost(postId).subscribe({
      next: () => {
        this.feed.update(f => f.filter(p => p.postId !== postId));
        this.toast.success('Post eliminado');
      },
      error: () => this.toast.error('Error al eliminar')
    });
  }

  deleteComment(postId: string, commentId: string) {
    this.family.deleteComment(postId, commentId).subscribe({
      next: () => {
        this.feed.update(f => f.map(p => {
          if (p.postId !== postId) return p;
          return { ...p, comments: p.comments.filter(c => c.commentId !== commentId), commentCount: Math.max(0, p.commentCount - 1) };
        }));
      },
      error: () => this.toast.error('Error al eliminar comentario')
    });
  }

  reactionEmoji(type: string): string {
    const map: Record<string, string> = { like: '👍', fire: '🔥', strong: '💪', heart: '❤️', clap: '👏', wow: '😮' };
    return map[type.toLowerCase()] || '👍';
  }

  getColor(id: string): string {
    const colors = [
      'linear-gradient(135deg, var(--mint), var(--lake))',
      'linear-gradient(135deg, var(--coral-soft), var(--coral))',
      'linear-gradient(135deg, var(--mint-light), var(--mint))',
      'linear-gradient(135deg, var(--lake-light), var(--lake))',
      'linear-gradient(135deg, var(--gold-soft), var(--gold))',
    ];
    return colors[id?.charCodeAt(0) % colors.length] ?? colors[0];
  }
}
