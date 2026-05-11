import { Component, inject } from '@angular/core';
import { ConnectivityService } from '../../services/connectivity.service';
import { OfflineSyncService } from '../../services/offline-sync.service';

@Component({
  selector: 'app-offline-banner',
  standalone: true,
  template: `
    @if (!connectivity.isOnline()) {
      <div class="offline-banner">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/><path d="M10.71 5.05A16 16 0 0 1 22.56 9"/><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>
        </svg>
        <span>Sin conexión</span>
        @if (sync.pendingCount() > 0) {
          <span class="offline-badge">{{ sync.pendingCount() }} pendiente(s)</span>
        }
      </div>
    }
  `,
  styles: [`
    :host { display: contents; }
    .offline-banner {
      position: fixed; top: 0; left: 0; right: 0; z-index: 200;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      padding: 10px 16px;
      background: var(--coral); color: white;
      font-size: 13px; font-weight: 700;
      animation: slideDown 0.3s var(--ease-out);
    }
    .offline-badge {
      background: rgba(255,255,255,0.25);
      padding: 2px 10px;
      border-radius: var(--r-pill);
      font-size: 11px;
    }
    @keyframes slideDown {
      from { transform: translateY(-100%); }
      to { transform: translateY(0); }
    }
  `],
})
export class OfflineBannerComponent {
  readonly connectivity = inject(ConnectivityService);
  readonly sync = inject(OfflineSyncService);
}
