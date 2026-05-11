import { Component, inject } from '@angular/core';
import { NcToastService } from './nc-toast.service';

@Component({
  selector: 'nc-toast-container',
  standalone: true,
  template: `
    <div class="toast-wrap">
      @for (toast of toasts(); track toast.id) {
        <div class="toast" [class]="'toast--' + toast.type" (click)="dismiss(toast.id)">
          <span class="toast-icon">{{ icon(toast.type) }}</span>
          <span class="toast-msg">{{ toast.message }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: contents; }
    .toast-wrap {
      position: fixed; top: 16px; right: 16px; z-index: 9999;
      display: flex; flex-direction: column; gap: 8px;
      max-width: 360px; width: 100%;
      pointer-events: none;
    }
    .toast {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 16px; border-radius: var(--r-lg);
      font-size: 13px; font-weight: 500; line-height: 1.4;
      box-shadow: var(--shadow-lg);
      pointer-events: auto;
      animation: toastIn 0.3s var(--ease-out);
      cursor: pointer;
    }
    .toast--success { background: var(--mint-soft); color: var(--pine); border: 1px solid var(--mint); }
    .toast--error { background: var(--coral-bg); color: var(--coral); border: 1px solid var(--coral); }
    .toast--warning { background: var(--cream-warm); color: var(--gold); border: 1px solid var(--gold); }
    .toast--info { background: var(--lake-light); color: var(--lake); border: 1px solid var(--lake); }
    .toast-icon { font-size: 16px; flex-shrink: 0; }
    .toast-msg { flex: 1; }
    @keyframes toastIn {
      from { opacity: 0; transform: translateX(20px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `]
})
export class NcToastContainerComponent {
  private readonly toastService = inject(NcToastService);
  readonly toasts = this.toastService.toasts;

  dismiss(id: string): void {
    this.toastService.dismiss(id);
  }

  icon(type: string): string {
    const map: Record<string, string> = { success: '✓', error: '✗', warning: '⚠', info: 'ℹ' };
    return map[type] || 'ℹ';
  }
}
