import { Component, input } from '@angular/core';

@Component({
  selector: 'nc-empty-state',
  standalone: true,
  template: `
  <div class="empty">
    <ng-content select="[slot=icon]"></ng-content>
    <h3 class="empty-title">{{ title() }}</h3>
    @if (subtitle()) {
      <p class="empty-desc">{{ subtitle() }}</p>
    }
    <ng-content></ng-content>
  </div>
  `,
  styles: [`
    :host { display: contents; }
    .empty { text-align: center; padding: 60px 20px; display: flex; flex-direction: column; align-items: center; }
    .empty-title { font-family: var(--display); font-size: 22px; font-weight: 400; color: var(--ink); margin: 0 0 8px; }
    .empty-desc { font-size: 14px; color: var(--ink-light); margin: 0 0 24px; line-height: 1.5; max-width: 320px; }
  `]
})
export class NcEmptyStateComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>();
}
