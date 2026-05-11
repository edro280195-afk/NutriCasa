import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'nc-page-header',
  standalone: true,
  imports: [RouterLink],
  template: `
  <div class="header">
    @if (backLink()) {
      <a [routerLink]="backLink()" class="back-link">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        {{ backLabel() }}
      </a>
    }
    <h1 class="page-title">{{ title() }}</h1>
  </div>
  `,
  styles: [`
    :host { display: contents; }
    .header { padding: 24px 0 20px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
    .back-link { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: var(--ink-light); text-decoration: none; }
    .back-link:hover { color: var(--pine); }
    .page-title { font-family: var(--display); font-size: 22px; font-weight: 500; color: var(--ink); margin: 0; }
  `]
})
export class NcPageHeaderComponent {
  readonly title = input.required<string>();
  readonly backLink = input<string>();
  readonly backLabel = input('Volver');
}
