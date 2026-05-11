import { Component, input } from '@angular/core';

@Component({
  selector: 'nc-card',
  standalone: true,
  template: `
  <div class="card" [class]="'card--' + variant()" [style.padding]="pad()">
    @if (title() || subtitle()) {
      <div class="card-header">
        @if (title()) { <h3 class="card-title">{{ title() }}</h3> }
        @if (subtitle()) { <p class="card-subtitle">{{ subtitle() }}</p> }
      </div>
    }
    <ng-content></ng-content>
  </div>
  `,
  styles: [`
    :host { display: contents; }
    .card { background: var(--paper); border: 1.5px solid var(--line); border-radius: var(--r-lg); }
    .card--pine { background: var(--pine); border-color: var(--pine); color: var(--cream); }
    .card--mint { background: var(--mint-soft); border-color: var(--mint-soft); }
    .card-header { margin-bottom: 12px; }
    .card-title { font-family: var(--display); font-size: 18px; font-weight: 500; color: inherit; margin: 0; }
    .card-subtitle { font-size: 13px; color: inherit; opacity: 0.75; margin: 4px 0 0; }
  `]
})
export class NcCardComponent {
  readonly title = input<string>();
  readonly subtitle = input<string>();
  readonly variant = input<'default' | 'pine' | 'mint'>('default');
  protected readonly pad = input('20px');
}
