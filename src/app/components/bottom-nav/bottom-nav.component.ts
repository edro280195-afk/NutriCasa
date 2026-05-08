import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
  <div class="bottom-nav-container">
    <nav class="bottom-nav">
      <a routerLink="/dashboard" class="nav-item" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
        Hoy
      </a>
      <a routerLink="/plan" class="nav-item" routerLinkActive="active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Plan
      </a>
      <a routerLink="/family" class="nav-item" routerLinkActive="active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        Familia
      </a>
      <a routerLink="/progress" class="nav-item" routerLinkActive="active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
        Avances
      </a>
      <a routerLink="/profile" class="nav-item" routerLinkActive="active">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        Yo
      </a>
    </nav>
  </div>
  `,
  styles: [`
    :host { display: contents; }
    .bottom-nav-container {
      position: fixed; bottom: 0; left: 0; right: 0;
      display: flex; justify-content: center;
      z-index: 100; pointer-events: none;
    }
    .bottom-nav {
      width: calc(100% - 32px); max-width: 448px;
      margin-bottom: 16px;
      background: var(--pine); border-radius: var(--r-pill);
      padding: 8px;
      display: flex; justify-content: space-around;
      pointer-events: auto; box-shadow: var(--shadow-pine);
      animation: slideUp 0.5s var(--ease-out) 0.4s both;
    }
    .nav-item {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      gap: 4px; padding: 10px 0;
      color: rgba(248,244,236,0.55);
      font-size: 10px; font-weight: 600; letter-spacing: 0.06em;
      text-transform: uppercase; border-radius: var(--r-pill);
      cursor: pointer; text-decoration: none;
    }
    .nav-item.active { background: var(--mint); color: var(--pine-darker); }
    .nav-item svg { width: 20px; height: 20px; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class BottomNavComponent {}
