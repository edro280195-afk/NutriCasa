import { Component, inject, signal, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FamilyService } from '../../services/family.service';
import { AuthService } from '../../services/auth.service';
import { ShoppingListService } from '../../services/shopping-list.service';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { NcToastService } from '../../shared/components/nc-toast.service';
import type { FamilyMemberDto, FamilyPostDto, FamilyStatsDto, PostResultDto, ReactionResultDto, CommentResultDto, GroupLeaderboardDto, LeaderboardEntryDto, InviteCodeDto, SubgroupCreatedDto } from '../../models/family.models';
import type { ShoppingListDto, ShoppingListItemDto } from '../../models/shopping-list.models';
import { gsap } from 'gsap';

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
        @if (currentMemberRole() && currentMemberRole() !== 'owner') {
          <button class="header-action danger" type="button" (click)="confirmLeaveGroup()">Salir del grupo</button>
        }
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
        <button type="button" class="challenge-cta" (click)="goToChallenges()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          Retos entre miembros
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

      @if (inviteCode(); as ic) {
        <div class="invite-card">
          <div class="invite-label">Código de invitación</div>
          <div class="invite-row">
            <code class="invite-code">{{ ic.inviteCode }}</code>
            <button class="btn-sm" (click)="copyInviteCode(ic.inviteCode)">
              {{ copied() ? 'Copiado' : 'Copiar' }}
            </button>
            <button class="btn-sm btn-outline" (click)="refreshInviteCode()" [disabled]="refreshing()">
              {{ refreshing() ? '...' : 'Renovar' }}
            </button>
          </div>
          @if (ic.isExpiringSoon) {
            <p class="invite-warn">El código expira pronto. Renueva para generar uno nuevo.</p>
          }
        </div>
      } @else {
        <button class="btn-link" (click)="loadInviteCode()">Mostrar código de invitación</button>
      }

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
          <div>
            <h2 class="section-title">Leaderboard</h2>
            <p class="section-subtitle">Progreso compartido sin perder de vista el esfuerzo individual.</p>
          </div>
        </div>

        <div class="lb-tabs">
          @for (tab of leaderboardTabs; track tab.key) {
            <button class="lb-tab" [class.active]="leaderboardCategory() === tab.key" (click)="switchLeaderboard(tab.key)">
              {{ tab.label }}
            </button>
          }
        </div>

        @if (leaderboardLoading()) {
          <div class="lb-loading">
            <div class="spinner-sm"></div>
          </div>
        } @else {
          <div class="lb-list" [class.has-winners]="leaderboard().entries.length > 0">
            @for (e of leaderboard().entries; track e.userId) {
              <div class="lb-row">
                <div class="lb-rank">
                  @if (e.rank <= 3) {
                    <span class="lb-rank-medal">{{ medalEmoji(e.rank) }}</span>
                  } @else {
                    <span class="lb-rank-num">#{{ e.rank }}</span>
                  }
                </div>
                <div class="lb-av" [style.background]="getColor(e.userId)">
                  {{ e.fullName.charAt(0) }}{{ e.fullName.split(' ').pop()?.charAt(0) }}
                </div>
                <div class="lb-info">
                  <div class="lb-name">{{ e.fullName }}</div>
                  <div class="lb-bar-track">
                    <div class="lb-bar-fill" [style.width.%]="barWidth(e.value, leaderboard().entries)"></div>
                  </div>
                </div>
                <div class="lb-value">{{ e.valueDisplay }}</div>
              </div>
            } @empty {
              <p class="lb-empty">Sin datos para esta categoría. Los miembros deben aceptar compartir su información en privacidad.</p>
            }
          </div>
        }
      </div>

      <div class="family-section">
        <div class="section-head">
          <div>
            <h2 class="section-title">Miembros</h2>
            <p class="section-subtitle">Vista rápida del grupo y permisos disponibles.</p>
          </div>
          @if (currentMemberRole() === 'owner' || currentMemberRole() === 'admin') {
            <button class="btn-sm btn-outline" (click)="showCreateSubgroup.set(true)">Crear subgrupo</button>
          }
        </div>
        <div class="member-list">
          @for (m of members(); track m.userId) {
            <div class="member-row" [class.is-current]="m.userId === currentUserId()">
              <div class="member-av" [style.background]="getColor(m.userId)">{{ initials(m.fullName) }}</div>
              <div class="member-info">
                <span class="member-name">{{ m.fullName }}</span>
                <span class="member-meta">{{ roleLabel(m.role) }} · desde {{ formatIsoDate(m.joinedAt) }}</span>
              </div>
              @if (m.userId === currentUserId()) {
                <span class="member-self">Tú</span>
              }
              @if ((currentMemberRole() === 'owner' || currentMemberRole() === 'admin') && m.userId !== currentUserId()) {
                <div class="member-actions">
                  @if (m.role !== 'owner' && m.role !== 'pending') {
                    <select class="member-role-select" [value]="m.role" (change)="onRoleChange(m.userId, $any($event.target).value)">
                      <option value="member">Miembro</option>
                      <option value="admin">Admin</option>
                    </select>
                  }
                  @if (m.role === 'owner') {
                    <button class="btn-sm btn-outline" (click)="showTransfer()">Transferir</button>
                  }
                  @if (m.role !== 'owner') {
                    <button class="btn-remove" (click)="confirmRemoveMember(m)" title="Remover del grupo">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
                    </button>
                  }
                </div>
              }
            </div>
          }
        </div>
      </div>

      <div class="family-section sl-section">
        <div class="section-head">
          <div>
            <h2 class="section-title">Lista de compras</h2>
            <p class="section-subtitle">Consolidada por ingrediente para la semana actual.</p>
          </div>
          <button class="btn-sm" (click)="loadShoppingList()" [disabled]="shoppingListLoading()">
            {{ shoppingListLoading() ? 'Cargando...' : 'Actualizar' }}
          </button>
        </div>

        @if (shoppingListLoading()) {
          <div class="lb-loading"><div class="spinner-sm"></div></div>
        } @else if (shoppingListError()) {
          <div class="sl-empty sl-error">
            <p>{{ shoppingListError() }}</p>
            <button class="btn-sm" (click)="loadShoppingList()">Reintentar</button>
          </div>
        } @else if (shoppingList(); as sl) {
          @if (sl.items.length > 0) {
            <div class="sl-card">
              <div class="print-header">
                <div class="print-logo">NutriCasa Hub</div>
                <div class="print-title">Lista de compras consolidada</div>
                <div class="print-dates">Semana: {{ formatIsoDate(sl.weekStart) }} al {{ formatIsoDate(sl.weekEnd) }}</div>
              </div>
              <div class="sl-overview">
                <div>
                  <strong>{{ purchasedCount(sl) }}</strong>
                  <span>comprados</span>
                </div>
                <div>
                  <strong>{{ sl.items.length - purchasedCount(sl) }}</strong>
                  <span>pendientes</span>
                </div>
                @if (sl.totalCost) {
                  <div>
                    <strong>{{ formatMoney(sl.totalCost) }}</strong>
                    <span>estimado</span>
                  </div>
                }
              </div>
              <div class="sl-progress-track">
                <div class="sl-progress-fill" [style.width.%]="shoppingProgress(sl)"></div>
              </div>
              @for (group of groupedShoppingItems(sl.items); track group.category) {
                <div class="sl-group">
                  <div class="sl-group-title">
                    <span>{{ group.category }}</span>
                    <small>{{ group.purchased }}/{{ group.items.length }}</small>
                  </div>
                  @for (item of group.items; track item.itemId) {
                    <div class="sl-item" [class.purchased]="item.isPurchased">
                      <button class="sl-check" (click)="toggleItem(item.itemId)" [class.checked]="item.isPurchased" [attr.aria-label]="item.isPurchased ? 'Marcar como pendiente' : 'Marcar como comprado'">
                        @if (item.isPurchased) {
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
                        }
                      </button>
                      <span class="sl-name">{{ item.ingredientName }}</span>
                      <span class="sl-amount">{{ item.totalAmount }} {{ item.unit }}</span>
                      @if (item.estimatedCostMxn) {
                        <span class="sl-cost">{{ formatMoney(item.estimatedCostMxn) }}</span>
                      }
                    </div>
                  }
                </div>
              }
              @if (sl.totalCost) {
                <div class="sl-total">Total estimado: <strong>{{ formatMoney(sl.totalCost) }} MXN</strong></div>
              }
              <div class="sl-actions">
                <button class="btn-sm btn-outline" (click)="exportPdf(sl)">Exportar PDF</button>
                <button class="btn-sm" (click)="shareWhatsApp(sl)">Compartir en WhatsApp</button>
              </div>
            </div>
          } @else {
            <div class="sl-empty">
              <p>Aún no hay lista de compras para esta semana.</p>
              @if (currentMemberRole() === 'owner' || currentMemberRole() === 'admin') {
                <button class="btn-primary" (click)="generateShoppingList()" [disabled]="generatingList()">
                  {{ generatingList() ? 'Generando...' : 'Generar lista' }}
                </button>
              }
            </div>
          }
        } @else {
          <div class="sl-empty">
            <p>Aún no hay lista de compras para esta semana.</p>
            @if (currentMemberRole() === 'owner' || currentMemberRole() === 'admin') {
              <button class="btn-primary" (click)="generateShoppingList()" [disabled]="generatingList()">
                {{ generatingList() ? 'Generando...' : 'Generar lista' }}
              </button>
            }
          </div>
        }
      </div>

      <div class="family-section">
        <div class="section-head">
          <div>
            <h2 class="section-title">Muro familiar</h2>
            <p class="section-subtitle">Logros, comidas y mensajes rápidos del grupo.</p>
          </div>
        </div>

        <div class="composer">
          <div class="composer-types">
            @for (pt of postTypes; track pt.key) {
              <button class="ctype-pill" [class.active]="selectedPostType() === pt.key" (click)="selectedPostType.set(pt.key)">
                <span>{{ pt.emoji }}</span> {{ pt.label }}
              </button>
            }
          </div>
          <textarea [(ngModel)]="newPostContent" [placeholder]="composerPlaceholder()" maxlength="500" rows="3" class="composer-input"></textarea>
          @if (imagePreviewUrl()) {
            <div class="composer-preview">
              <img [src]="imagePreviewUrl()!" class="composer-img-preview" alt="Vista previa" />
              <button class="composer-remove-img" (click)="removeImage()" title="Quitar imagen">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          }
          <div class="composer-actions">
            <div class="composer-left">
              <span class="composer-count">{{ newPostContent().length }}/500</span>
              <label class="composer-attach" title="Adjuntar imagen">
                <input type="file" accept="image/*" (change)="onImageSelected($event)" style="display:none" />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                @if (uploadingImage()) { <span class="uploading-dot"></span> }
              </label>
            </div>
            <button class="btn-primary" [disabled]="!newPostContent().trim() || posting() || uploadingImage()" (click)="submitPost()">
              {{ posting() ? 'Publicando...' : 'Publicar' }}
            </button>
          </div>
        </div>

        <div class="feed">
          @for (post of feed(); track post.postId) {
            <div class="feed-card" [attr.data-post-id]="post.postId" [class]="'feed-card post-type-' + post.postType" [style.--card-accent]="postTypeColor(post.postType)">
              <div class="feed-header-row">
                <div class="feed-av" [style.background]="getColor(post.authorUserId || post.postId)">{{ post.authorName.charAt(0) }}</div>
                <div class="feed-header-info">
                  <div class="feed-author-row">
                    <span class="feed-author">{{ post.authorName }}</span>
                    <span class="feed-type-badge">{{ postTypeEmoji(post.postType) }} {{ postTypeLabel(post.postType) }}</span>
                  </div>
                  <span class="feed-time">{{ post.createdAt | timeAgo }}</span>
                </div>
                @if (post.authorUserId === currentUserId()) {
                  <button class="feed-delete" (click)="deletePost(post.postId)" title="Eliminar">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  </button>
                }
              </div>
              <div class="feed-content">{{ post.content }}</div>
              @if (post.imageUrl) {
                <div class="feed-image-wrap">
                  <img [src]="post.imageUrl" class="feed-image" loading="lazy" alt="Imagen del post" (click)="openImageFullscreen(post.imageUrl)" />
                </div>
              }

              <div class="feed-reactions">
                <div class="reaction-bubbles">
                  @for (r of post.reactions; track r.type) {
                    @if (r.count > 0) {
                      <button class="reaction-chip reaction-chip-{{ r.type.toLowerCase() }}" [class.active]="r.hasCurrentUserReacted" (click)="toggleReaction(post.postId, r.type)">
                        <span class="reaction-emoji">{{ reactionEmoji(r.type) }}</span>
                        {{ r.count }}
                      </button>
                    }
                  }
                </div>

                <div class="reaction-container">
                  <button class="react-trigger-btn" (click)="toggleReactionMenu(post.postId, $event)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"/></svg>
                    Reaccionar
                  </button>

                  <div class="reaction-menu" [class.show]="activeReactionMenuId() === post.postId" (click)="$event.stopPropagation()">
                    @for (emoji of availableReactions; track emoji) {
                      <button class="reaction-menu-btn" (click)="triggerReactionWithAnim(post.postId, emoji, $event)" [title]="emoji">
                        {{ reactionEmoji(emoji) }}
                      </button>
                    }
                  </div>
                </div>
              </div>

              <div class="feed-comments">
                @if (post.commentCount > 2 && !expandedComments[post.postId]) {
                  <button class="show-comments-btn" (click)="expandedComments[post.postId] = true">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                    Ver {{ post.commentCount - 2 }} comentario{{ post.commentCount - 2 > 1 ? 's' : '' }} más
                  </button>
                }
                @for (c of visibleComments(post); track c.commentId) {
                  <div class="comment-row" [attr.data-comment-id]="c.commentId">
                    <div class="comment-header">
                      <span class="comment-author">{{ c.authorName }}</span>
                      @if (c.isOwner) {
                        <button class="comment-delete" (click)="deleteComment(post.postId, c.commentId)" title="Eliminar comentario">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
                        </button>
                      }
                    </div>
                    <span class="comment-text">{{ c.content }}</span>
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

      @if (showCreateSubgroup()) {
        <div class="modal-backdrop" (click)="showCreateSubgroup.set(false)">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <h3 class="modal-title">Crear subgrupo</h3>
            <p class="modal-hint">Un subgrupo es un grupo separado con su propio muro y código de invitación.</p>
            <input class="modal-input" [(ngModel)]="subgroupName" placeholder="Nombre del subgrupo" maxlength="100">
            <textarea class="modal-input modal-textarea" [(ngModel)]="subgroupDescription" placeholder="Descripción (opcional)" rows="2"></textarea>
            <div class="modal-actions">
              <button class="btn-ghost" (click)="showCreateSubgroup.set(false)">Cancelar</button>
              <button class="btn-primary" (click)="onCreateSubgroup()" [disabled]="!subgroupName().trim() || creatingSubgroup()">
                {{ creatingSubgroup() ? 'Creando...' : 'Crear subgrupo' }}
              </button>
            </div>
          </div>
        </div>
      }

      @if (newSubgroup(); as sg) {
        <div class="modal-backdrop" (click)="newSubgroup.set(null)">
          <div class="modal-card subgroup-created-card" (click)="$event.stopPropagation()">
            <div class="sg-success-icon">✅</div>
            <h3 class="modal-title">¡Subgrupo creado!</h3>
            <p class="sg-name">{{ sg.subgroupName }}</p>
            <p class="sg-instruction">Comparte este código con las personas que quieras agregar al subgrupo:</p>
            <div class="sg-code-row">
              <code class="sg-code">{{ sg.inviteCode }}</code>
              <button class="btn-sm" (click)="copySubgroupCode(sg.inviteCode)">
                {{ subgroupInviteCopied() ? '¡Copiado!' : 'Copiar' }}
              </button>
            </div>
            <p class="sg-note">Los miembros usan este código en "Unirse a grupo" desde su perfil. Cada subgrupo tiene su propio muro y lista de miembros.</p>
            <button class="btn-primary sg-done-btn" (click)="newSubgroup.set(null)">Entendido</button>
          </div>
        </div>
      }

      @if (showTransferModal()) {
        <div class="modal-backdrop" (click)="showTransferModal.set(false)">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <h3 class="modal-title">Transferir propiedad</h3>
            <p class="modal-desc">Selecciona el nuevo owner del grupo. Tu rol cambiará a admin.</p>
            <select class="modal-input" [(ngModel)]="transferTargetUserId">
              @for (m of members(); track m.userId) {
                @if (m.role !== 'owner') {
                  <option [value]="m.userId">{{ m.fullName }}</option>
                }
              }
            </select>
            <div class="modal-actions">
              <button class="btn-ghost" (click)="showTransferModal.set(false)">Cancelar</button>
              <button class="btn-primary" (click)="onTransfer()" [disabled]="!transferTargetUserId() || transferring()">
                {{ transferring() ? 'Transfiriendo...' : 'Transferir' }}
              </button>
            </div>
          </div>
        </div>
      }

      @if (removeTarget(); as rt) {
        <div class="modal-backdrop" (click)="removeTarget.set(null)">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <h3 class="modal-title">Remover miembro</h3>
            <p class="modal-desc">¿Estás seguro de remover a <strong>{{ rt.fullName }}</strong> del grupo?</p>
            <div class="modal-actions">
              <button class="btn-ghost" (click)="removeTarget.set(null)">Cancelar</button>
              <button class="btn-coral" (click)="onRemoveMember()" [disabled]="removing()">
                {{ removing() ? 'Removiendo...' : 'Remover' }}
              </button>
            </div>
          </div>
        </div>
      }

      @if (showLeaveGroupModal()) {
        <div class="modal-backdrop" (click)="showLeaveGroupModal.set(false)">
          <div class="modal-card" (click)="$event.stopPropagation()">
            <h3 class="modal-title">Salir del grupo</h3>
            <p class="modal-desc">Tus datos personales e historial se conservan. Si vuelves a entrar con el mismo código, recuperas tu membresía anterior.</p>
            <div class="modal-actions">
              <button class="btn-ghost" (click)="showLeaveGroupModal.set(false)">Cancelar</button>
              <button class="btn-coral" (click)="onLeaveGroup()" [disabled]="leavingGroup()">
                {{ leavingGroup() ? 'Saliendo...' : 'Salir del grupo' }}
              </button>
            </div>
          </div>
        </div>
      }
    }
  </div>
  `,
  styles: [`
    :host { display: contents; }
    .page { max-width: 940px; margin: 0 auto; padding: 0 20px 120px; background: var(--cream); position: relative; z-index: 1; }
    .page-header { padding: 24px 0 20px; display: flex; align-items: center; justify-content: space-between; }
    .page-brand { font-family: var(--display); font-size: 22px; font-weight: 500; color: var(--pine); display: flex; align-items: center; gap: 8px; }
    .page-brand svg { width: 22px; height: 22px; fill: var(--mint); }
    .page-actions { display: flex; gap: 10px; align-items: center; }
    .header-action { border: 1px solid var(--line); background: var(--paper); color: var(--ink-soft); border-radius: var(--r-pill); padding: 7px 12px; font-size: 11px; font-weight: 700; }
    .header-action.danger { border-color: color-mix(in srgb, var(--coral) 45%, var(--line)); color: var(--coral); }
    .header-action:hover { background: var(--cream-warm); }
    .connection-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--ink-soft); transition: background 0.3s; }
    .connection-dot.online { background: var(--mint); box-shadow: 0 0 6px var(--mint); }

    .family-hero { background: var(--pine); color: var(--cream); border-radius: var(--r-xl); padding: 28px; margin-bottom: 14px; position: relative; overflow: hidden; box-shadow: var(--shadow-pine); }
    .family-hero::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(91,192,150,0.18), transparent 42%); }
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
    .challenge-cta { display: flex; align-items: center; gap: 6px; margin-top: 16px; padding: 10px 16px; background: rgba(91,192,150,0.15); border: 1px solid var(--mint); border-radius: var(--r-pill); color: var(--mint-light); font-size: 13px; font-weight: 600; text-decoration: none; transition: background 0.2s; }
    .challenge-cta:hover { background: rgba(91,192,150,0.25); }

    .invite-card { background: var(--paper); border: 1px solid var(--mint); border-radius: var(--r-lg); padding: 14px; margin-bottom: 16px; }
    .invite-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: var(--ink-muted); margin-bottom: 8px; }
    .invite-row { display: flex; gap: 8px; align-items: center; }
    .invite-code { flex: 1; font-size: 16px; font-weight: 700; color: var(--pine); letter-spacing: 0.08em; background: var(--cream); padding: 8px 12px; border-radius: var(--r-md); }
    .invite-warn { font-size: 11px; color: var(--coral); margin-top: 8px; }
    .btn-link { background: none; border: none; color: var(--mint); font-size: 13px; cursor: pointer; padding: 8px 0; display: block; margin-bottom: 12px; text-decoration: underline; }
    .btn-sm { background: var(--pine); color: var(--cream); border: none; padding: 6px 14px; border-radius: var(--r-pill); font-size: 11px; font-weight: 600; cursor: pointer; white-space: nowrap; }
    .btn-sm:disabled { opacity: 0.4; }
    .btn-outline { background: transparent; border: 1px solid var(--pine); color: var(--pine); }
    .btn-coral { background: var(--coral); color: white; border: none; padding: 8px 20px; border-radius: var(--r-pill); font-size: 13px; font-weight: 600; cursor: pointer; }
    .btn-ghost { background: transparent; border: 1px solid var(--line); color: var(--ink); padding: 8px 20px; border-radius: var(--r-pill); font-size: 13px; font-weight: 600; cursor: pointer; }

    .family-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 26px; }
    .family-stat { background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 16px; text-align: center; }
    .family-stat-value { font-family: var(--display); font-size: 28px; font-weight: 500; color: var(--pine); line-height: 1; }
    .family-stat-label { font-size: 11px; font-weight: 600; color: var(--ink-muted); letter-spacing: 0.06em; margin-top: 6px; }

    .family-section { margin-bottom: 26px; }
    .section-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
    .section-title { font-family: var(--display); font-size: 20px; font-weight: 400; letter-spacing: -0.01em; color: var(--ink); }
    .section-subtitle { margin-top: 3px; font-size: 12px; color: var(--ink-light); line-height: 1.45; max-width: 56ch; }

    .member-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 10px; margin-bottom: 12px; }
    .member-row { display: flex; align-items: center; gap: 12px; background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-lg); padding: 12px; min-width: 0; }
    .member-row.is-current { border-color: color-mix(in srgb, var(--mint) 55%, var(--line)); background: color-mix(in srgb, var(--mint-soft) 52%, var(--paper)); }
    .member-av { width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; color: var(--pine-darker); flex-shrink: 0; }
    .member-info { flex: 1; min-width: 0; }
    .member-name { font-size: 13px; font-weight: 600; color: var(--ink); display: block; }
    .member-meta { display: block; margin-top: 3px; font-size: 11px; color: var(--ink-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .member-self { display: inline-flex; align-items: center; justify-content: center; border-radius: var(--r-pill); background: var(--pine); color: var(--cream); padding: 4px 9px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
    .member-actions { display: flex; gap: 6px; align-items: center; }
    .member-role-select { font-size: 11px; padding: 4px 6px; border: 1px solid var(--line); border-radius: var(--r-md); background: var(--paper); color: var(--ink); cursor: pointer; }
    .btn-remove { width: 28px; height: 28px; border-radius: 50%; border: none; background: transparent; color: var(--ink-soft); cursor: pointer; display: flex; align-items: center; justify-content: center; }
    .btn-remove:hover { background: var(--cream); color: var(--coral); }

    .sl-card { background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-xl); padding: 16px; margin-bottom: 16px; box-shadow: var(--shadow-sm); }
    .sl-overview { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px; }
    .sl-overview > div { background: var(--cream); border: 1px solid var(--line); border-radius: var(--r-md); padding: 10px; }
    .sl-overview strong { display: block; font-family: var(--display); font-size: 20px; line-height: 1; color: var(--pine); }
    .sl-overview span { display: block; margin-top: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--ink-muted); }
    .sl-progress-track { height: 8px; background: var(--cream); border: 1px solid var(--line); border-radius: var(--r-pill); overflow: hidden; margin-bottom: 14px; }
    .sl-progress-fill { height: 100%; background: var(--mint); border-radius: var(--r-pill); transition: width 0.35s var(--ease-out); }
    .sl-group { border: 1px solid var(--line); border-radius: var(--r-lg); overflow: hidden; margin-bottom: 10px; }
    .sl-group-title { display: flex; align-items: center; justify-content: space-between; gap: 10px; background: var(--cream); padding: 9px 12px; font-size: 12px; font-weight: 800; color: var(--pine); }
    .sl-group-title small { font-size: 11px; color: var(--ink-muted); font-weight: 700; }
    .sl-item { display: grid; grid-template-columns: 28px minmax(0, 1fr) auto auto; align-items: center; gap: 10px; padding: 10px 12px; border-top: 1px solid var(--line); font-size: 13px; }
    .sl-item.purchased { opacity: 0.5; }
    .sl-item.purchased .sl-name { text-decoration: line-through; }
    .sl-check { width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--mint); background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--cream); transition: all 0.15s; }
    .sl-check.checked { background: var(--mint); }
    .sl-name { color: var(--ink); min-width: 0; overflow-wrap: anywhere; }
    .sl-amount { font-size: 12px; color: var(--ink-muted); white-space: nowrap; }
    .sl-cost { font-size: 12px; color: var(--pine); font-weight: 600; white-space: nowrap; }
    .sl-total { text-align: right; padding-top: 10px; font-size: 13px; color: var(--ink); }
    .sl-actions { margin-top: 10px; display: flex; gap: 8px; justify-content: flex-end; }
    .sl-empty { text-align: center; padding: 22px; background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-lg); margin-bottom: 16px; }
    .sl-error { border-color: var(--coral-soft); background: var(--coral-bg); }
    .sl-empty p { font-size: 13px; color: var(--ink-muted); margin-bottom: 12px; }

    .print-header { display: none; }
    @media print {
      body { background: white !important; color: black !important; }
      .page-header, .family-hero, .family-stats, .family-section:not(.sl-section), .sl-actions, .modal-backdrop, .composer, .feed, .section-head button {
        display: none !important;
      }
      .sl-section { width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; border: none !important; box-shadow: none !important; }
      .sl-card { border: none !important; box-shadow: none !important; padding: 0 !important; background: transparent !important; }
      .sl-item { border-bottom: 1px solid #ccc !important; padding: 10px 0 !important; font-size: 14px !important; opacity: 1 !important; }
      .sl-item.purchased .sl-name { text-decoration: none !important; }
      .sl-check { border: 2px solid #000 !important; background: transparent !important; color: #000 !important; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .sl-check.checked { background: #000 !important; color: white !important; }
      .print-header { display: block !important; margin-bottom: 24px; border-bottom: 2px solid #1b4332; padding-bottom: 12px; }
      .print-logo { font-family: var(--display); font-size: 26px; font-weight: 700; color: #1b4332; }
      .print-title { font-size: 18px; color: #333; margin-top: 4px; font-weight: 600; }
      .print-dates { font-size: 13px; color: #666; margin-top: 2px; }
    }

    .composer { background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-xl); padding: 18px; margin-bottom: 18px; box-shadow: var(--shadow-sm); position: relative; overflow: hidden; transition: border-color 0.2s, box-shadow 0.2s; }
    .composer:focus-within { border-color: var(--mint); box-shadow: 0 6px 24px rgba(91, 192, 150, 0.1); }
    .composer::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, var(--mint), var(--lake), var(--gold)); }
    .composer-input { width: 100%; border: none; background: transparent; resize: none; font-family: inherit; font-size: 14px; color: var(--ink); outline: none; line-height: 1.6; }
    .composer-input::placeholder { color: var(--ink-soft); }
    .composer-actions { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--line); }
    .composer-count { font-size: 11px; color: var(--ink-soft); }
    .btn-primary { background: var(--pine); color: var(--cream); border: none; padding: 8px 20px; border-radius: var(--r-pill); font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-primary:disabled { opacity: 0.4; cursor: default; }
    .btn-primary:not(:disabled):hover { background: var(--pine-darker); }

    .feed { display: flex; flex-direction: column; gap: 16px; margin-bottom: 32px; }
    .feed-card { position: relative; background: var(--paper); border: 1px solid color-mix(in srgb, var(--card-accent, var(--mint)) 32%, var(--line)); border-radius: var(--r-xl); padding: 20px; box-shadow: var(--shadow-sm); transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease, border-color 0.3s ease; overflow: hidden; }
    .feed-card::after { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--card-accent, var(--mint)); }
    .feed-card:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(15, 61, 46, 0.06), 0 4px 12px rgba(15, 61, 46, 0.03); border-color: rgba(91, 192, 150, 0.2); }
    .feed-header-row { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
    .feed-av { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: var(--cream); flex-shrink: 0; box-shadow: inset 0 -2px 4px rgba(0,0,0,0.15); text-transform: uppercase; }
    .feed-header-info { display: flex; flex-direction: column; flex: 1; }
    .feed-author { font-size: 14px; font-weight: 600; color: var(--ink); }
    .feed-time { font-size: 11px; color: var(--ink-muted); margin-top: 1px; }
    .feed-delete { width: 28px; height: 28px; border-radius: 50%; border: none; background: transparent; color: var(--ink-soft); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
    .feed-delete:hover { background: var(--cream); color: var(--coral); }
    .feed-content { font-size: 14.5px; color: var(--ink-soft); line-height: 1.6; margin-bottom: 16px; white-space: pre-wrap; padding-left: 2px; }

    .feed-reactions { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 0; border-top: 1px dashed var(--line); border-bottom: 1px dashed var(--line); margin-bottom: 16px; position: relative; }
    .reaction-bubbles { display: flex; gap: 6px; flex-wrap: wrap; }
    .reaction-chip { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: var(--r-pill); border: 1px solid var(--line); background: var(--cream); font-size: 12px; font-weight: 500; color: var(--ink-soft); cursor: pointer; transition: all 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    .reaction-chip:hover { transform: scale(1.08); }
    .reaction-chip.active { border-color: transparent; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .reaction-chip-like.active { background: rgba(91, 192, 150, 0.15); color: var(--pine); border: 1px solid rgba(91, 192, 150, 0.3); }
    .reaction-chip-fire.active { background: rgba(232, 134, 107, 0.15); color: var(--coral); border: 1px solid rgba(232, 134, 107, 0.3); }
    .reaction-chip-heart.active { background: rgba(229, 115, 115, 0.15); color: #d32f2f; border: 1px solid rgba(229, 115, 115, 0.3); }
    .reaction-chip-clap.active { background: rgba(255, 193, 7, 0.15); color: #b78103; border: 1px solid rgba(255, 193, 7, 0.3); }
    .reaction-chip-wow.active { background: rgba(91, 163, 208, 0.15); color: var(--lake); border: 1px solid rgba(91, 163, 208, 0.3); }
    .reaction-emoji { font-size: 14px; transition: transform 0.2s; }
    
    @keyframes emoji-bounce {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.3) translateY(-2px); }
    }
    .reaction-chip:hover .reaction-emoji { animation: emoji-bounce 0.4s ease-out; }

    .reaction-container { position: relative; display: inline-block; }
    .react-trigger-btn { display: flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: var(--r-pill); border: 1px solid var(--line); background: var(--cream); color: var(--ink-muted); font-size: 12px; font-weight: 600; cursor: pointer; transition: all 0.25s; }
    .react-trigger-btn:hover { background: var(--line); color: var(--ink); transform: scale(1.02); }
    .react-trigger-btn svg { color: var(--ink-soft); transition: transform 0.2s; }
    .react-trigger-btn:hover svg { transform: rotate(-8deg) scale(1.1); }

    .reaction-menu { position: absolute; bottom: 100%; left: 50%; transform: translate(-50%, -10px) scale(0.9); background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-pill); padding: 6px 12px; display: flex; gap: 8px; box-shadow: var(--shadow-md); z-index: 110; pointer-events: none; opacity: 0; transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.22, 1, 0.36, 1); }
    .reaction-menu.show { pointer-events: auto; opacity: 1; transform: translate(-50%, -10px) scale(1); }
    .reaction-menu-btn { width: 38px; height: 38px; border-radius: 50%; border: none; background: transparent; cursor: pointer; font-size: 24px; display: flex; align-items: center; justify-content: center; transition: transform 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275), background-color 0.2s; }
    .reaction-menu-btn:hover { transform: scale(1.4) translateY(-6px); background: rgba(15, 61, 46, 0.05); }

    .feed-comments { display: flex; flex-direction: column; gap: 10px; padding-top: 8px; }
    .comment-row { background: var(--cream); border: 1px solid var(--line); border-radius: var(--r-md); padding: 10px 14px; font-size: 13px; color: var(--ink); position: relative; display: flex; flex-direction: column; gap: 4px; transition: background-color 0.2s, border-color 0.2s; }
    .comment-row:hover { background: var(--line); border-color: var(--mint-light); }
    .comment-header { display: flex; justify-content: space-between; align-items: center; }
    .comment-author { font-weight: 700; color: var(--pine-darker); font-size: 12.5px; }
    .comment-text { line-height: 1.5; color: var(--ink-soft); }
    .comment-delete { background: none; border: none; color: var(--ink-soft); cursor: pointer; padding: 4px; opacity: 0; transition: opacity 0.2s, color 0.2s; display: flex; align-items: center; justify-content: center; }
    .comment-row:hover .comment-delete { opacity: 1; }
    .comment-delete:hover { color: var(--coral); }
    .comment-composer { display: flex; gap: 10px; margin-top: 12px; position: relative; }
    .comment-composer input { flex: 1; border: 1px solid var(--line); background: var(--paper); border-radius: var(--r-pill); padding: 10px 44px 10px 18px; font-size: 13px; font-family: inherit; outline: none; color: var(--ink); transition: border-color 0.2s, box-shadow 0.2s; }
    .comment-composer input:focus { border-color: var(--mint); box-shadow: 0 0 0 3px rgba(91, 192, 150, 0.15); }
    .comment-send { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); width: 32px; height: 32px; border-radius: 50%; border: none; background: var(--pine); color: var(--cream); cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s, transform 0.2s; }
    .comment-send:disabled { background: transparent; color: var(--ink-soft); cursor: default; }
    .comment-send:not(:disabled):hover { background: var(--pine-darker); transform: translateY(-50%) scale(1.05); }

    .lb-tabs { display: flex; gap: 6px; margin-bottom: 14px; flex-wrap: wrap; }
    .lb-tab { flex: 1; min-width: 0; padding: 8px 6px; border-radius: var(--r-pill); border: 1px solid var(--line); background: var(--paper); font-size: 11px; font-weight: 600; color: var(--ink-muted); cursor: pointer; text-align: center; transition: all 0.2s; white-space: nowrap; }
    .lb-tab.active { background: var(--pine); border-color: var(--pine); color: var(--cream); }
    .lb-loading { text-align: center; padding: 24px; }
    .spinner-sm { width: 24px; height: 24px; border: 2px solid var(--line); border-top-color: var(--pine); border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
    .lb-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
    .lb-row { display: flex; align-items: center; gap: 10px; padding: 12px; background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-lg); box-shadow: var(--shadow-sm); }
    .lb-list.has-winners .lb-row:first-child { background: var(--pine); border-color: var(--pine); color: var(--cream); }
    .lb-list.has-winners .lb-row:first-child .lb-name,
    .lb-list.has-winners .lb-row:first-child .lb-value { color: var(--cream); }
    .lb-list.has-winners .lb-row:first-child .lb-bar-track { background: rgba(248, 244, 236, 0.16); }
    .lb-list.has-winners .lb-row:first-child .lb-bar-fill { background: var(--mint-light); }
    .lb-rank { width: 28px; text-align: center; flex-shrink: 0; }
    .lb-rank-medal { font-size: 18px; }
    .lb-rank-num { font-size: 12px; font-weight: 700; color: var(--ink-muted); }
    .lb-av { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: var(--pine-darker); flex-shrink: 0; }
    .lb-info { flex: 1; min-width: 0; }
    .lb-name { font-size: 13px; font-weight: 600; color: var(--ink); margin-bottom: 4px; }
    .lb-bar-track { height: 4px; background: var(--cream); border-radius: 2px; overflow: hidden; }
    .lb-bar-fill { height: 100%; background: var(--mint); border-radius: 2px; transition: width 0.4s var(--ease-out); }
    .lb-value { font-size: 13px; font-weight: 700; color: var(--pine); white-space: nowrap; flex-shrink: 0; }
    .lb-empty { text-align: center; padding: 24px 0; font-size: 12px; color: var(--ink-muted); line-height: 1.6; }

    .feed-empty { text-align: center; padding: 32px 0; font-size: 13px; color: var(--ink-muted); }

    .loading-state { text-align: center; padding: 60px 20px; }
    .loading-state p { font-size: 15px; color: var(--ink-soft); margin-top: 20px; }
    .spinner-lg { width: 40px; height: 40px; border: 3px solid var(--line); border-top-color: var(--pine); border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
    .modal-card { background: var(--paper); border-radius: var(--r-xl); padding: 24px; max-width: 400px; width: 100%; }
    .modal-title { font-family: var(--display); font-size: 20px; font-weight: 500; color: var(--pine); margin-bottom: 16px; }
    .modal-desc { font-size: 13px; color: var(--ink-muted); line-height: 1.6; margin-bottom: 16px; }
    .modal-input { width: 100%; padding: 10px 12px; border: 1px solid var(--line); border-radius: var(--r-md); font-family: inherit; font-size: 14px; color: var(--ink); background: var(--paper); margin-bottom: 12px; outline: none; }
    .modal-input:focus { border-color: var(--mint); }
    .modal-textarea { resize: vertical; min-height: 60px; }
    .modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px; }

    .composer-types { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 12px; }
    .ctype-pill { display: inline-flex; align-items: center; gap: 4px; padding: 5px 12px; border-radius: var(--r-pill); border: 1px solid var(--line); background: var(--cream); color: var(--ink-muted); font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .ctype-pill.active { background: var(--pine); border-color: var(--pine); color: var(--cream); }
    .ctype-pill:not(.active):hover { border-color: var(--mint); color: var(--pine); }

    .composer-left { display: flex; align-items: center; gap: 10px; }
    .composer-attach { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; cursor: pointer; color: var(--ink-muted); position: relative; transition: color 0.2s, background 0.2s; }
    .composer-attach:hover { color: var(--pine); background: var(--cream); }
    .uploading-dot { position: absolute; top: 2px; right: 2px; width: 8px; height: 8px; background: var(--mint); border-radius: 50%; animation: spin 0.7s linear infinite; }

    .composer-preview { position: relative; margin: 10px 0; border-radius: var(--r-md); overflow: hidden; max-height: 200px; }
    .composer-img-preview { width: 100%; object-fit: cover; display: block; max-height: 200px; }
    .composer-remove-img { position: absolute; top: 6px; right: 6px; width: 28px; height: 28px; border-radius: 50%; border: none; background: rgba(0,0,0,0.55); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s; }
    .composer-remove-img:hover { background: rgba(0,0,0,0.8); }

    .feed-author-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .feed-type-badge { font-size: 11px; font-weight: 600; color: var(--ink-muted); background: var(--cream); border: 1px solid var(--line); border-radius: var(--r-pill); padding: 2px 8px; }

    .feed-image-wrap { margin: 0 -20px 16px; overflow: hidden; max-height: 320px; }
    .feed-image { width: 100%; object-fit: cover; display: block; max-height: 320px; cursor: zoom-in; transition: transform 0.3s ease; }
    .feed-image:hover { transform: scale(1.01); }

    .show-comments-btn { display: flex; align-items: center; gap: 6px; background: none; border: none; color: var(--pine); font-size: 12px; font-weight: 600; cursor: pointer; padding: 4px 0; }
    .show-comments-btn:hover { color: var(--pine-darker); text-decoration: underline; }

    .post-type-achievement { --card-accent: var(--gold); }
    .post-type-mealshare { --card-accent: var(--lake); }
    .post-type-motivation { --card-accent: var(--coral); }
    .post-type-usertext { --card-accent: var(--mint); }

    .modal-hint { font-size: 12px; color: var(--ink-muted); margin-bottom: 14px; line-height: 1.5; }

    .subgroup-created-card { text-align: center; }
    .sg-success-icon { font-size: 40px; margin-bottom: 8px; }
    .sg-name { font-size: 15px; font-weight: 700; color: var(--pine); margin-bottom: 12px; }
    .sg-instruction { font-size: 13px; color: var(--ink-muted); margin-bottom: 12px; line-height: 1.5; }
    .sg-code-row { display: flex; align-items: center; gap: 10px; justify-content: center; background: var(--cream); border-radius: var(--r-md); padding: 12px 16px; margin-bottom: 14px; }
    .sg-code { font-size: 20px; font-weight: 700; color: var(--pine); letter-spacing: 0.12em; flex: 1; text-align: left; }
    .sg-note { font-size: 11px; color: var(--ink-soft); line-height: 1.6; margin-bottom: 20px; background: rgba(91,192,150,0.06); border-radius: var(--r-md); padding: 10px 12px; border: 1px solid rgba(91,192,150,0.15); }
    .sg-done-btn { width: 100%; }

    @media (max-width: 620px) {
      .page { padding-inline: 14px; }
      .page-actions { gap: 8px; }
      .header-action { padding-inline: 10px; }
      .family-stats { gap: 8px; }
      .member-list { grid-template-columns: 1fr; }
      .sl-overview { grid-template-columns: 1fr 1fr; }
      .sl-item { grid-template-columns: 28px minmax(0, 1fr) auto; }
      .sl-cost { grid-column: 2 / -1; justify-self: start; }
      .feed-reactions { align-items: flex-start; flex-direction: column; }
      .reaction-container { align-self: flex-end; }
    }
  `]
})
export class FamilyPage implements OnInit, OnDestroy {
  private readonly family = inject(FamilyService);
  private readonly auth = inject(AuthService);
  private readonly shoppingListService = inject(ShoppingListService);
  private readonly toast = inject(NcToastService);
  private readonly router = inject(Router);
  private subs: Subscription[] = [];

  readonly members = signal<FamilyMemberDto[]>([]);
  readonly feed = signal<FamilyPostDto[]>([]);
  readonly stats = signal<FamilyStatsDto>({ totalMembers: 0, activeToday: 0, dailyStreak: 0, adherencePercent: 0, groupName: 'Mi Familia', daysActive: 0 });
  readonly loading = signal(true);
  readonly online = signal(false);
  readonly posting = signal(false);
  readonly newPostContent = signal('');
  readonly activeReactionMenuId = signal<string | null>(null);

  readonly currentUserId = signal<string | null>(null);
  readonly currentMemberRole = signal<string>('');
  readonly commentText: Record<string, string> = {};

  readonly availableReactions = ['Like', 'Fire', 'Heart', 'Clap', 'Wow'];

  readonly leaderboardCategory = signal('weight_loss');
  readonly leaderboard = signal<GroupLeaderboardDto>({ category: '', categoryLabel: '', entries: [] });
  readonly leaderboardLoading = signal(false);
  readonly leaderboardTabs = [
    { key: 'weight_loss', label: 'Peso' },
    { key: 'streak', label: 'Racha' },
    { key: 'adherence', label: 'Adherencia' },
    { key: 'checkins', label: 'Check-ins' },
  ];

  // Group management
  readonly inviteCode = signal<InviteCodeDto | null>(null);
  readonly copied = signal(false);
  readonly refreshing = signal(false);
  readonly showCreateSubgroup = signal(false);
  readonly subgroupName = signal('');
  readonly subgroupDescription = signal('');
  readonly creatingSubgroup = signal(false);
  readonly newSubgroup = signal<SubgroupCreatedDto | null>(null);
  readonly subgroupInviteCopied = signal(false);
  readonly showTransferModal = signal(false);
  readonly transferTargetUserId = signal('');
  readonly transferring = signal(false);
  readonly removeTarget = signal<{ userId: string; fullName: string } | null>(null);
  readonly removing = signal(false);
  readonly showLeaveGroupModal = signal(false);
  readonly leavingGroup = signal(false);

  // Post composer
  readonly selectedPostType = signal('usertext');
  readonly imageFile = signal<File | null>(null);
  readonly imagePreviewUrl = signal<string | null>(null);
  readonly uploadingImage = signal(false);
  readonly expandedComments: Record<string, boolean> = {};

  readonly postTypes = [
    { key: 'usertext', label: 'Texto', emoji: '📝' },
    { key: 'achievement', label: 'Logro', emoji: '🏆' },
    { key: 'mealshare', label: 'Comida', emoji: '🥗' },
    { key: 'motivation', label: 'Ánimo', emoji: '💪' },
  ];

  // Shopping list
  readonly shoppingList = signal<ShoppingListDto | null>(null);
  readonly shoppingListLoading = signal(false);
  readonly generatingList = signal(false);
  readonly shoppingListError = signal('');

  ngOnInit() {
    this.currentUserId.set(this.auth.state().user?.userId ?? null);
    this.loadData();
    this.switchLeaderboard('weight_loss');
    this.connectSignalR();
  }

  ngOnDestroy() {
    this.subs.forEach(s => s.unsubscribe());
    this.family.disconnect();
  }

  private loadData() {
    this.family.getMembers().subscribe({
      next: (m) => {
        this.members.set(m);
        const me = m.find(x => x.userId === this.currentUserId());
        this.currentMemberRole.set(me?.role ?? '');
        if (me?.role === 'owner' || me?.role === 'admin') this.loadInviteCode();
      },
      error: () => {}
    });
    this.family.getFeed().subscribe({
      next: (f) => this.feed.set(f),
      error: () => {}
    });
    this.family.getStats().subscribe({
      next: (s) => {
        this.stats.set(s);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
    this.loadShoppingList();
  }

  @HostListener('document:click')
  closeAllReactionMenus() {
    this.activeReactionMenuId.set(null);
  }

  toggleReactionMenu(postId: string, event: MouseEvent) {
    event.stopPropagation();
    if (this.activeReactionMenuId() === postId) {
      this.activeReactionMenuId.set(null);
    } else {
      this.activeReactionMenuId.set(postId);
      setTimeout(() => {
        const menu = document.querySelector(`[data-post-id="${postId}"] .reaction-menu`);
        if (menu) {
          const items = menu.querySelectorAll('.reaction-menu-btn');
          gsap.fromTo(items,
            { scale: 0, opacity: 0, y: 10 },
            { scale: 1, opacity: 1, y: 0, duration: 0.25, stagger: 0.04, ease: 'back.out(1.5)' }
          );
        }
      }, 10);
    }
  }

  triggerReactionWithAnim(postId: string, emojiType: string, event: MouseEvent) {
    this.toggleReaction(postId, emojiType);
    this.createEmojiBurst(event.clientX, event.clientY, this.reactionEmoji(emojiType));
    this.activeReactionMenuId.set(null);
  }

  createEmojiBurst(x: number, y: number, emoji: string) {
    const burstContainer = document.createElement('div');
    burstContainer.style.position = 'fixed';
    burstContainer.style.left = `${x}px`;
    burstContainer.style.top = `${y}px`;
    burstContainer.style.pointerEvents = 'none';
    burstContainer.style.zIndex = '9999';
    document.body.appendChild(burstContainer);

    const count = 12;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.innerText = emoji;
      el.style.position = 'absolute';
      el.style.fontSize = `${gsap.utils.random(18, 30)}px`;
      el.style.userSelect = 'none';
      burstContainer.appendChild(el);

      const angle = gsap.utils.random(0, Math.PI * 2);
      const velocity = gsap.utils.random(50, 150);
      const destX = Math.cos(angle) * velocity;
      const destY = Math.sin(angle) * velocity - gsap.utils.random(40, 100);

      gsap.fromTo(el,
        { x: 0, y: 0, opacity: 1, scale: 0.5 },
        {
          x: destX,
          y: destY,
          opacity: 0,
          scale: gsap.utils.random(1.2, 1.8),
          rotation: gsap.utils.random(-180, 180),
          duration: gsap.utils.random(0.8, 1.2),
          ease: 'power2.out',
          onComplete: () => {
            el.remove();
            if (burstContainer.children.length === 0) {
              burstContainer.remove();
            }
          }
        }
      );
    }
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
        this.family.onPostDeleted.subscribe(postId => this.removePostFromFeed(postId)),
        this.family.onCommentDeleted.subscribe(d => this.removeCommentFromFeed(d.postId, d.commentId)),
      );
    } catch {
      this.online.set(false);
    }
  }

  private prependPost(post: PostResultDto, authorUserId?: string) {
    const exists = this.feed().some(p => p.postId === post.postId);
    if (exists) return;

    this.feed.update(f => [{
      postId: post.postId, authorUserId, authorName: post.authorName,
      postType: post.postType, content: post.content, imageUrl: post.imageUrl,
      createdAt: post.createdAt, reactions: [], comments: [], commentCount: 0,
    }, ...f]);

    setTimeout(() => {
      const card = document.querySelector(`[data-post-id="${post.postId}"]`);
      if (card) {
        gsap.fromTo(card,
          { height: 0, opacity: 0, y: -20, scale: 0.95 },
          { height: 'auto', opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power2.out' }
        );
      }
    }, 50);
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

    if (reaction.hasReacted) {
      setTimeout(() => {
        const chip = document.querySelector(`[data-post-id="${postId}"] .reaction-chip-${reaction.reactionType.toLowerCase()}`);
        if (chip) {
          const rect = chip.getBoundingClientRect();
          this.createEmojiBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, this.reactionEmoji(reaction.reactionType));
        }
      }, 50);
    }
  }

  private appendComment(postId: string, comment: CommentResultDto) {
    this.feed.update(f => f.map(p => {
      if (p.postId !== postId) return p;
      const commentExists = p.comments.some(c => c.commentId === comment.commentId);
      if (commentExists) return p;

      return {
        ...p,
        comments: [...p.comments, { ...comment, isOwner: comment.userId === this.currentUserId() }],
        commentCount: p.commentCount + 1,
      };
    }));

    setTimeout(() => {
      const commentEl = document.querySelector(`[data-comment-id="${comment.commentId}"]`);
      if (commentEl) {
        gsap.fromTo(commentEl,
          { opacity: 0, y: 10, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'back.out(1.2)' }
        );
      }
    }, 50);
  }

  private removePostFromFeed(postId: string) {
    const card = document.querySelector(`[data-post-id="${postId}"]`);
    if (card) {
      gsap.to(card, {
        opacity: 0,
        y: -10,
        height: 0,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
        borderWidth: 0,
        duration: 0.35,
        ease: 'power2.out',
        onComplete: () => {
          this.feed.update(f => f.filter(p => p.postId !== postId));
        }
      });
    } else {
      this.feed.update(f => f.filter(p => p.postId !== postId));
    }
  }

  private removeCommentFromFeed(postId: string, commentId: string) {
    const commentEl = document.querySelector(`[data-comment-id="${commentId}"]`);
    if (commentEl) {
      gsap.to(commentEl, {
        opacity: 0,
        x: -10,
        height: 0,
        paddingTop: 0,
        paddingBottom: 0,
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => {
          this.feed.update(f => f.map(p => {
            if (p.postId !== postId) return p;
            return { ...p, comments: p.comments.filter(c => c.commentId !== commentId), commentCount: Math.max(0, p.commentCount - 1) };
          }));
        }
      });
    } else {
      this.feed.update(f => f.map(p => {
        if (p.postId !== postId) return p;
        return { ...p, comments: p.comments.filter(c => c.commentId !== commentId), commentCount: Math.max(0, p.commentCount - 1) };
      }));
    }
  }

  submitPost() {
    const content = this.newPostContent().trim();
    if (!content || this.posting() || this.uploadingImage()) return;
    this.posting.set(true);

    const doPost = (imageUrl?: string) => {
      this.family.createPost(content, this.selectedPostType(), imageUrl).subscribe({
        next: (post) => {
          this.prependPost({ ...post, imageUrl }, this.currentUserId() ?? undefined);
          this.newPostContent.set('');
          this.selectedPostType.set('usertext');
          this.imageFile.set(null);
          this.imagePreviewUrl.set(null);
          this.posting.set(false);
          this.toast.success('Publicado en el muro');
        },
        error: () => {
          this.posting.set(false);
          this.toast.error('Error al publicar');
        }
      });
    };

    const file = this.imageFile();
    if (file) {
      this.uploadingImage.set(true);
      this.family.uploadPostImage(file).subscribe({
        next: (url) => {
          this.uploadingImage.set(false);
          doPost(url);
        },
        error: (err) => {
          this.uploadingImage.set(false);
          this.posting.set(false);
          this.toast.error(this.errorMessage(err, 'No se pudo subir la imagen'));
        }
      });
    } else {
      doPost();
    }
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
      next: (comment) => {
        this.appendComment(postId, comment);
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
        this.removePostFromFeed(postId);
        this.toast.success('Post eliminado');
      },
      error: () => this.toast.error('Error al eliminar')
    });
  }

  deleteComment(postId: string, commentId: string) {
    this.family.deleteComment(postId, commentId).subscribe({
      next: () => {
        this.removeCommentFromFeed(postId, commentId);
      },
      error: () => this.toast.error('Error al eliminar comentario')
    });
  }

  switchLeaderboard(category: string) {
    this.leaderboardCategory.set(category);
    this.leaderboardLoading.set(true);
    this.family.getLeaderboard(category).subscribe({
      next: (d) => {
        this.leaderboard.set(d);
        this.leaderboardLoading.set(false);
      },
      error: () => this.leaderboardLoading.set(false)
    });
  }

  // ── Invite Code ──

  loadInviteCode() {
    this.family.getInviteCode().subscribe({
      next: (ic) => this.inviteCode.set(ic),
      error: () => {}
    });
  }

  copyInviteCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      this.copied.set(true);
      this.toast.success('Código copiado');
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  refreshInviteCode() {
    this.refreshing.set(true);
    this.family.regenerateInviteCode().subscribe({
      next: () => {
        this.refreshing.set(false);
        this.loadInviteCode();
        this.toast.success('Código renovado');
      },
      error: () => {
        this.refreshing.set(false);
        this.toast.error('Error al renovar código');
      }
    });
  }

  // ── Subgroup ──

  onCreateSubgroup() {
    const name = this.subgroupName().trim();
    if (!name || this.creatingSubgroup()) return;

    this.creatingSubgroup.set(true);
    this.family.createSubgroup(name, this.subgroupDescription().trim() || undefined).subscribe({
      next: (dto) => {
        this.creatingSubgroup.set(false);
        this.showCreateSubgroup.set(false);
        this.subgroupName.set('');
        this.subgroupDescription.set('');
        this.newSubgroup.set(dto);
      },
      error: () => {
        this.creatingSubgroup.set(false);
        this.toast.error('Error al crear subgrupo');
      }
    });
  }

  // ── Member management ──

  onRoleChange(userId: string, role: string) {
    this.family.changeMemberRole(userId, role).subscribe({
      next: () => {
        this.members.update(m => m.map(x => x.userId === userId ? { ...x, role } : x));
        this.toast.success('Rol actualizado');
      },
      error: () => this.toast.error('Error al cambiar rol')
    });
  }

  showTransfer() {
    this.transferTargetUserId.set('');
    this.showTransferModal.set(true);
  }

  onTransfer() {
    if (!this.transferTargetUserId() || this.transferring()) return;

    this.transferring.set(true);
    this.family.transferOwnership(this.transferTargetUserId()).subscribe({
      next: () => {
        this.transferring.set(false);
        this.showTransferModal.set(false);
        this.currentMemberRole.set('admin');
        this.members.update(m => m.map(x => ({
          ...x,
          role: x.userId === this.currentUserId() ? 'admin'
               : x.userId === this.transferTargetUserId() ? 'owner'
               : x.role
        })));
        this.toast.success('Propiedad transferida');
      },
      error: () => {
        this.transferring.set(false);
        this.toast.error('Error al transferir');
      }
    });
  }

  confirmRemoveMember(member: FamilyMemberDto) {
    this.removeTarget.set({ userId: member.userId, fullName: member.fullName });
  }

  onRemoveMember() {
    const target = this.removeTarget();
    if (!target || this.removing()) return;

    this.removing.set(true);
    this.family.removeMember(target.userId).subscribe({
      next: () => {
        this.removing.set(false);
        this.removeTarget.set(null);
        this.members.update(m => m.filter(x => x.userId !== target.userId));
        this.stats.update(s => ({ ...s, totalMembers: Math.max(0, s.totalMembers - 1) }));
        this.toast.success('Miembro removido');
      },
      error: () => {
        this.removing.set(false);
        this.toast.error('Error al remover miembro');
      }
    });
  }

  // ── Shopping List ──

  confirmLeaveGroup() {
    if (!this.currentUserId() || this.currentMemberRole() === 'owner') return;
    this.showLeaveGroupModal.set(true);
  }

  onLeaveGroup() {
    const userId = this.currentUserId();
    if (!userId || this.leavingGroup() || this.currentMemberRole() === 'owner') return;

    this.leavingGroup.set(true);
    this.family.removeMember(userId).subscribe({
      next: () => {
        this.leavingGroup.set(false);
        this.showLeaveGroupModal.set(false);
        this.toast.success('Saliste del grupo');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.leavingGroup.set(false);
        this.toast.error(this.errorMessage(err, 'No se pudo salir del grupo'));
      }
    });
  }

  loadShoppingList() {
    this.shoppingListLoading.set(true);
    this.shoppingListError.set('');
    this.shoppingListService.getCurrent().subscribe({
      next: (sl) => {
        this.shoppingList.set(sl);
        this.shoppingListLoading.set(false);
      },
      error: (err) => {
        this.shoppingListLoading.set(false);
        this.shoppingListError.set(err.error?.message || 'No se pudo cargar la lista de compras.');
      }
    });
  }

  generateShoppingList() {
    this.generatingList.set(true);
    this.shoppingListService.generate().subscribe({
      next: () => {
        this.generatingList.set(false);
        this.loadShoppingList();
        this.toast.success('Lista de compras generada');
      },
      error: () => {
        this.generatingList.set(false);
        this.toast.error('No se pudo generar la lista');
      }
    });
  }

  toggleItem(itemId: string) {
    this.shoppingListService.togglePurchased(itemId).subscribe({
      next: () => {
        this.shoppingList.update(sl => {
          if (!sl) return sl;
          return {
            ...sl,
            items: sl.items.map(i =>
              i.itemId === itemId ? { ...i, isPurchased: !i.isPurchased } : i
            )
          };
        });
      },
      error: () => this.toast.error('Error al actualizar')
    });
  }

  shareWhatsApp(list: ShoppingListDto) {
    const text = this.shoppingListService.buildWhatsAppText(list);
    this.shoppingListService.openWhatsApp(text);
  }

  exportPdf(list: ShoppingListDto) {
    window.print();
  }

  formatIsoDate(isoStr: string): string {
    if (!isoStr) return '';
    const parts = isoStr.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoStr;
  }

  groupedShoppingItems(items: ShoppingListItemDto[]) {
    const groups = new Map<string, ShoppingListItemDto[]>();

    for (const item of items) {
      const category = item.category?.trim() || 'General';
      groups.set(category, [...(groups.get(category) ?? []), item]);
    }

    return Array.from(groups.entries())
      .map(([category, groupItems]) => ({
        category,
        items: groupItems.sort((a, b) => a.sortOrder - b.sortOrder),
        purchased: groupItems.filter(item => item.isPurchased).length,
      }))
      .sort((a, b) => a.category.localeCompare(b.category, 'es'));
  }

  purchasedCount(list: ShoppingListDto): number {
    return list.items.filter(item => item.isPurchased).length;
  }

  shoppingProgress(list: ShoppingListDto): number {
    if (list.items.length === 0) return 0;
    return (this.purchasedCount(list) / list.items.length) * 100;
  }

  formatMoney(value: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0,
    }).format(value);
  }

  // ── UI helpers ──

  initials(fullName: string): string {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    const last = parts[parts.length - 1];
    return `${parts[0].charAt(0)}${last?.charAt(0) ?? ''}`.toUpperCase();
  }

  barWidth(value: number, entries: LeaderboardEntryDto[]): number {
    if (entries.length === 0) return 0;
    const max = Math.max(...entries.map(e => e.value));
    return max > 0 ? (value / max) * 100 : 0;
  }

  medalEmoji(rank: number): string {
    return rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';
  }

  reactionEmoji(type: string): string {
    const map: Record<string, string> = { like: '👍', fire: '🔥', strong: '💪', heart: '❤️', clap: '👏', wow: '😮' };
    return map[type.toLowerCase()] || '👍';
  }

  roleLabel(role: string): string {
    const map: Record<string, string> = { owner: 'Creador', admin: 'Admin', member: 'Miembro', pending: 'Pendiente' };
    return map[role] || role;
  }

  getColor(id?: string): string {
    if (!id) return 'linear-gradient(135deg, var(--mint), var(--lake))';
    const colors = [
      'linear-gradient(135deg, var(--mint), var(--lake))',
      'linear-gradient(135deg, var(--coral-soft), var(--coral))',
      'linear-gradient(135deg, var(--mint-light), var(--mint))',
      'linear-gradient(135deg, var(--lake-light), var(--lake))',
      'linear-gradient(135deg, var(--gold-soft), var(--gold))',
    ];
    return colors[id.charCodeAt(0) % colors.length] ?? colors[0];
  }

  visibleComments(post: FamilyPostDto) {
    if (this.expandedComments[post.postId]) return post.comments;
    return post.comments.slice(-2);
  }

  postTypeColor(type: string): string {
    const map: Record<string, string> = {
      usertext: 'var(--mint)',
      achievement: 'var(--gold)',
      mealshare: 'var(--lake)',
      motivation: 'var(--coral)',
    };
    return map[type.toLowerCase()] ?? 'var(--mint)';
  }

  postTypeLabel(type: string): string {
    const map: Record<string, string> = {
      usertext: 'Texto', achievement: 'Logro', mealshare: 'Comida', motivation: 'Ánimo',
    };
    return map[type.toLowerCase()] ?? type;
  }

  postTypeEmoji(type: string): string {
    const map: Record<string, string> = {
      usertext: '📝', achievement: '🏆', mealshare: '🥗', motivation: '💪',
    };
    return map[type.toLowerCase()] ?? '📝';
  }

  composerPlaceholder(): string {
    const map: Record<string, string> = {
      usertext: '¿Qué quieres compartir hoy?',
      achievement: 'Cuéntanos sobre tu logro...',
      mealshare: '¿Qué comiste hoy?',
      motivation: 'Comparte algo que motive al grupo...',
    };
    return map[this.selectedPostType()] ?? '¿Qué quieres compartir?';
  }

  onImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.imageFile.set(file);
    const reader = new FileReader();
    reader.onload = (e) => this.imagePreviewUrl.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.imageFile.set(null);
    this.imagePreviewUrl.set(null);
  }

  copySubgroupCode(code: string) {
    navigator.clipboard.writeText(code).then(() => {
      this.subgroupInviteCopied.set(true);
      this.toast.success('Código copiado');
      setTimeout(() => this.subgroupInviteCopied.set(false), 2000);
    });
  }

  openImageFullscreen(url: string) {
    window.open(url, '_blank');
  }

  goToChallenges() {
    this.router.navigate(['/challenges']);
  }

  private errorMessage(err: unknown, fallback: string): string {
    if (typeof err === 'object' && err !== null && 'error' in err) {
      const error = (err as { error?: { message?: string } }).error;
      return error?.message || fallback;
    }

    return fallback;
  }
}
