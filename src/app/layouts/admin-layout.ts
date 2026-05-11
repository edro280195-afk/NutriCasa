import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
  <div class="admin-page">
    <header class="admin-header">
      <div class="admin-brand">
        <svg class="leaf-icon" viewBox="0 0 24 24"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>
        NutriCasa
        <span class="admin-badge">Admin</span>
      </div>
      <a class="admin-back" routerLink="/dashboard">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Volver
      </a>
    </header>

    <nav class="admin-tabs">
      <a routerLink="/admin/dashboard" class="admin-tab" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
        Dashboard
      </a>
      <a routerLink="/admin/users" class="admin-tab" routerLinkActive="active">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        Usuarios
      </a>
      <a routerLink="/admin/posts" class="admin-tab" routerLinkActive="active">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
        Publicaciones
      </a>
    </nav>

    <main class="admin-content">
      <router-outlet />
    </main>
  </div>
  `,
  styles: [`
    :host { display: contents; }
    .admin-page {
      max-width: 640px; margin: 0 auto;
      padding: 0 16px 40px;
      background: var(--cream);
      min-height: 100vh;
      position: relative; z-index: 1;
    }
    .admin-header {
      padding: 20px 0 16px;
      display: flex; align-items: center; justify-content: space-between;
    }
    .admin-brand {
      font-family: var(--display); font-size: 20px; font-weight: 500;
      color: var(--pine);
      display: flex; align-items: center; gap: 6px;
    }
    .admin-brand .leaf-icon { width: 20px; height: 20px; fill: var(--mint); }
    .admin-badge {
      font-size: 9px; font-weight: 700; letter-spacing: 0.12em;
      text-transform: uppercase; padding: 3px 10px;
      background: var(--pine); color: var(--cream);
      border-radius: var(--r-pill);
    }
    .admin-back {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; font-weight: 600; color: var(--ink-muted);
      text-decoration: none; padding: 8px 12px;
      background: var(--paper); border-radius: var(--r-pill);
      transition: all 0.2s var(--ease-out);
    }
    .admin-back:hover { color: var(--pine); }
    .admin-tabs {
      display: flex; gap: 4px;
      background: var(--paper); border: 1px solid var(--line);
      border-radius: var(--r-lg); padding: 4px;
      margin-bottom: 20px;
    }
    .admin-tab {
      flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
      padding: 10px 8px; font-size: 12px; font-weight: 600;
      color: var(--ink-muted); text-decoration: none;
      border-radius: var(--r-lg);
      transition: all 0.2s var(--ease-out);
    }
    .admin-tab.active {
      background: var(--pine); color: var(--cream);
    }
    .admin-tab svg { flex-shrink: 0; }
    .admin-content {
      animation: fadeIn 0.3s var(--ease-out);
    }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
})
export class AdminLayout {}
