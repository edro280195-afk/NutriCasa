import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NcPageHeaderComponent, NcEmptyStateComponent } from '../../shared/components';

@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [NcPageHeaderComponent, NcEmptyStateComponent],
  template: `
  <div class="page">
    <nc-page-header [title]="title()" backLink="/profile"></nc-page-header>
    <nc-empty-state title="Próximamente" subtitle="Esta sección estará disponible en una próxima actualización. Estamos trabajando en integrar esta funcionalidad para darte el mejor control sobre tu experiencia."></nc-empty-state>
  </div>
  `,
  styles: [`
    :host { display: contents; }
    .page { max-width: 480px; margin: 0 auto; padding: 0 20px 120px; background: var(--cream); }
  `]
})
export class ComingSoonPage {
  private readonly route = inject(ActivatedRoute);

  title() {
    const map: Record<string, string> = {
      'medical': 'Mi perfil médico',
      'preferences': 'Preferencias',
      'notifications': 'Notificaciones',
    };
    return map[this.route.snapshot.params['section'] || ''] || 'Próximamente';
  }
}
