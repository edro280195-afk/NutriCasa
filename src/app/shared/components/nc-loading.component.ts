import { Component, input } from '@angular/core';

@Component({
  selector: 'nc-loading',
  standalone: true,
  template: `
  @switch (type()) {
    @case ('skeleton') {
      <div class="skeleton-wrap">
        @for (i of [].constructor(lines()); track i) {
          <div class="skeleton-line" [class.skeleton-line--short]="$last"></div>
        }
      </div>
    }
    @case ('dots') {
      <div class="dots-wrap"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>
    }
    @default {
      <div class="loading-wrap">
        <span class="spinner" [style.width.px]="size()" [style.height.px]="size()"></span>
        @if (message()) {
          <p class="loading-msg">{{ message() }}</p>
        }
      </div>
    }
  }
  `,
  styles: [`
    :host { display: contents; }

    .loading-wrap { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; gap: 16px; }
    .spinner { border-radius: 50%; border: 3px solid var(--line); border-top-color: var(--mint); animation: spin 0.7s linear infinite; display: block; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-msg { font-size: 14px; color: var(--ink-muted); }

    .skeleton-wrap { display: flex; flex-direction: column; gap: 12px; padding: 16px 0; }
    .skeleton-line { height: 14px; border-radius: 8px; background: linear-gradient(90deg, var(--cream-warm) 25%, var(--mint-soft) 50%, var(--cream-warm) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; }
    .skeleton-line--short { width: 60%; }
    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }

    .dots-wrap { display: flex; gap: 6px; justify-content: center; padding: 40px 0; }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--mint); animation: pulse 1.4s infinite both; }
    .dot:nth-child(2) { animation-delay: 0.2s; }
    .dot:nth-child(3) { animation-delay: 0.4s; }
    @keyframes pulse { 0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1); } }
  `]
})
export class NcLoadingComponent {
  readonly type = input<'spinner' | 'skeleton' | 'dots'>('spinner');
  readonly size = input(32);
  readonly message = input('');
  readonly lines = input(3);
}
