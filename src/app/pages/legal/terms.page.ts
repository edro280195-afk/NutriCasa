import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [RouterLink],
  template: `
  <div class="legal-shell">
    <div class="legal-header">
      <button class="legal-back" (click)="back()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
        </svg>
        Volver
      </button>
      <h1 class="legal-title">Términos de Servicio</h1>
      <p class="legal-meta">Versión 1.0 — Vigente desde mayo 2026</p>
    </div>

    <div class="legal-body">
      <h2>Aviso Médico Importante</h2>
      <p><strong>NutriCasa no es un servicio médico ni nutricional profesional.</strong> Los planes alimenticios, recomendaciones y contenido generados por inteligencia artificial son puramente informativos y educativos. No constituyen consejo médico, diagnóstico ni tratamiento.</p>

      <h2>Antes de comenzar una dieta cetogénica</h2>
      <ul>
        <li>Consulta con tu médico, especialmente si tienes diabetes, problemas renales, hepáticos, pancreáticos, cardíacos, tiroideos, antecedentes de trastornos alimenticios, embarazo o lactancia.</li>
        <li>Informa a tu médico sobre cualquier medicamento que tomes.</li>
        <li>Si experimentas mareos severos, dolor de pecho, dificultad para respirar o cualquier síntoma preocupante, suspende la dieta y busca atención médica inmediata.</li>
      </ul>

      <h2>Uso del servicio</h2>
      <p>NutriCasa proporciona una plataforma para la generación de planes de alimentación personalizados mediante algoritmos de inteligencia artificial. El usuario es responsable de:</p>
      <ul>
        <li>Proporcionar información veraz y actualizada sobre su salud, medidas y objetivos.</li>
        <li>Consultar con un profesional de la salud antes de iniciar cualquier plan alimenticio.</li>
        <li>No utilizar la plataforma como sustituto de atención médica profesional.</li>
        <li>Mantener la confidencialidad de sus credenciales de acceso.</li>
      </ul>

      <h2>Limitación de responsabilidad</h2>
      <p>Al aceptar estos términos, reconoces que el uso de NutriCasa es bajo tu propia responsabilidad. NutriCasa, sus desarrolladores y operadores no se hacen responsables por:</p>
      <ul>
        <li>Daños a la salud derivados del uso de los planes alimenticios generados.</li>
        <li>Interacciones entre los alimentos recomendados y medicamentos que el usuario esté tomando.</li>
        <li>Decisiones tomadas basadas en la información proporcionada por la plataforma.</li>
      </ul>

      <h2>Privacidad</h2>
      <p>Tus datos médicos y biométricos se almacenan cifrados y nunca se comparten con terceros sin tu consentimiento explícito. Consulta nuestro <a routerLink="/legal/privacy">Aviso de Privacidad</a> para más detalles.</p>

      <h2>Modificaciones</h2>
      <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán notificados a través de la plataforma y entrarán en vigor en la fecha indicada.</p>
    </div>
  </div>
  `,
  styles: [`
    :host { display: contents; }
    .legal-shell {
      max-width: 700px; margin: 0 auto;
      min-height: 100vh;
      display: flex; flex-direction: column;
      padding: 0 22px;
    }
    .legal-header {
      padding: 24px 0 20px;
      border-bottom: 1px solid var(--line);
      margin-bottom: 28px;
    }
    .legal-back {
      display: inline-flex; align-items: center; gap: 6px;
      color: var(--ink-light); font-size: 13px; font-weight: 600;
      padding: 6px 10px; border-radius: var(--r-pill);
      margin-bottom: 16px;
    }
    .legal-back:hover { background: var(--mint-soft); color: var(--pine); }
    .legal-title {
      font-family: var(--display); font-size: 28px; font-weight: 400;
      color: var(--ink); letter-spacing: -0.025em;
      margin-bottom: 6px;
    }
    .legal-meta { font-size: 13px; color: var(--ink-muted); }
    .legal-body {
      flex: 1; padding-bottom: 40px;
    }
    .legal-body h2 {
      font-family: var(--display); font-size: 20px; font-weight: 500;
      color: var(--ink); margin: 28px 0 12px;
    }
    .legal-body p {
      font-size: 15px; line-height: 1.7;
      color: var(--ink-soft); margin-bottom: 16px;
    }
    .legal-body ul {
      padding-left: 20px; margin-bottom: 16px;
    }
    .legal-body li {
      font-size: 15px; line-height: 1.7;
      color: var(--ink-soft); margin-bottom: 6px;
    }
    .legal-body a {
      color: var(--pine); text-decoration: underline;
    }
  `]
})
export class TermsPage {
  private readonly location = inject(Location);

  back() { this.location.back(); }
}
