import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { AdminUserDto } from '../../models/admin.models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [DatePipe],
  template: `
  <div class="users-toolbar">
    <input
      class="search-input"
      type="text"
      placeholder="Buscar por nombre o email..."
      [value]="search()"
      (input)="onSearch($event)"
    />
    <select class="role-select" [value]="roleFilter()" (change)="onRoleFilter($event)">
      <option value="">Todos los roles</option>
      <option value="admin">Admin</option>
      <option value="user">Usuario</option>
    </select>
  </div>

  @if (loading()) {
    <div class="skeleton-list">
      @for (_ of [1,2,3,4]; track $index) {
        <div class="user-row skeleton">&nbsp;</div>
      }
    </div>
  } @else if (error()) {
    <div class="error-card">{{ error() }}</div>
  } @else {
    <div class="users-list">
      @for (user of users(); track user.userId) {
        <div class="user-row">
          <div class="user-info">
            <div class="user-name">{{ user.fullName }}</div>
            <div class="user-email">{{ user.email }}</div>
            <div class="user-meta">
              <span class="tag" [class.tag-admin]="user.role === 'admin'">{{ user.role }}</span>
              @if (user.emailVerified) { <span class="tag tag-verified">Verificado</span> }
              <span class="tag">{{ user.createdAt | date:'dd/MM/yy' }}</span>
            </div>
          </div>
          <div class="user-actions">
            @if (user.role === 'admin') {
              <button class="action-btn demote" (click)="toggleRole(user, 'user')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              </button>
            } @else {
              <button class="action-btn promote" (click)="toggleRole(user, 'admin')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 11v4"/><path d="M21 13h4"/></svg>
              </button>
            }
          </div>
        </div>
      } @empty {
        <div class="empty">Sin resultados</div>
      }
    </div>
  }
  `,
  styles: [`
    .users-toolbar {
      display: flex; gap: 8px; margin-bottom: 16px;
    }
    .search-input {
      flex: 1; padding: 10px 14px; font-size: 13px;
      background: var(--paper); border: 1px solid var(--line);
      border-radius: var(--r-lg); color: var(--ink);
      outline: none;
    }
    .search-input:focus { border-color: var(--mint); }
    .role-select {
      padding: 10px 12px; font-size: 12px; font-weight: 600;
      background: var(--paper); border: 1px solid var(--line);
      border-radius: var(--r-lg); color: var(--ink);
      outline: none; cursor: pointer;
    }
    .users-list {
      background: var(--paper); border: 1px solid var(--line);
      border-radius: var(--r-lg); overflow: hidden;
    }
    .user-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 14px 16px; border-bottom: 1px solid var(--line);
      gap: 12px;
    }
    .user-row:last-child { border-bottom: none; }
    .user-info { flex: 1; min-width: 0; }
    .user-name {
      font-size: 14px; font-weight: 600; color: var(--ink);
    }
    .user-email {
      font-size: 12px; color: var(--ink-muted);
      margin-top: 1px; white-space: nowrap; overflow: hidden;
      text-overflow: ellipsis;
    }
    .user-meta {
      display: flex; gap: 6px; margin-top: 6px; flex-wrap: wrap;
    }
    .tag {
      font-size: 9px; font-weight: 700; letter-spacing: 0.06em;
      text-transform: uppercase; padding: 2px 8px;
      background: var(--cream-warm); color: var(--ink-muted);
      border-radius: var(--r-pill);
    }
    .tag-admin { background: var(--pine); color: var(--cream); }
    .tag-verified { background: var(--mint-soft); color: var(--pine); }
    .user-actions { display: flex; gap: 6px; }
    .action-btn {
      width: 36px; height: 36px; display: flex;
      align-items: center; justify-content: center;
      border-radius: var(--r-lg); border: 1px solid var(--line);
      background: var(--paper); cursor: pointer;
      transition: all 0.2s var(--ease-out); color: var(--ink-muted);
    }
    .action-btn:hover { border-color: var(--pine); }
    .action-btn.promote:hover { background: var(--mint-soft); color: var(--pine); border-color: var(--mint); }
    .action-btn.demote:hover { background: var(--coral-bg); color: var(--coral); border-color: var(--coral-soft); }
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
export class AdminUsersPage {
  private readonly admin = inject(AdminService);

  readonly users = signal<AdminUserDto[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly search = signal('');
  readonly roleFilter = signal('');

  private loadUsers() {
    this.loading.set(true);
    this.error.set(null);
    this.admin.getUsers(this.search() || undefined, this.roleFilter() || undefined).subscribe({
      next: (u) => { this.users.set(u); this.loading.set(false); },
      error: () => { this.error.set('Error al cargar usuarios'); this.loading.set(false); },
    });
  }

  constructor() {
    this.loadUsers();
  }

  onSearch(e: Event) {
    this.search.set((e.target as HTMLInputElement).value);
    this.loadUsers();
  }

  onRoleFilter(e: Event) {
    this.roleFilter.set((e.target as HTMLSelectElement).value);
    this.loadUsers();
  }

  toggleRole(user: AdminUserDto, newRole: string) {
    if (!confirm(`¿Cambiar rol de ${user.fullName} a "${newRole}"?`)) return;
    this.admin.updateUserRole(user.userId, newRole).subscribe({
      next: () => this.loadUsers(),
      error: () => alert('Error al actualizar rol'),
    });
  }
}
