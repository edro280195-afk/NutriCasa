import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-privacy',
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
      <h1 class="legal-title">Aviso de Privacidad</h1>
      <p class="legal-meta">Versión 1.0 — Vigente desde mayo 2026</p>
    </div>

    <div class="legal-body">
      <p>En NutriCasa nos tomamos en serio tu privacidad. Este aviso describe cómo recopilamos, usamos y protegemos tu información personal y médica.</p>

      <h2>Datos que recopilamos</h2>
      <ul>
        <li>Datos de perfil: nombre, correo electrónico, fecha de nacimiento, género.</li>
        <li>Datos biométricos: peso, altura, tipo de cuerpo, nivel de actividad.</li>
        <li>Datos médicos: condiciones de salud, alergias, medicamentos (proporcionados voluntariamente).</li>
        <li>Datos de uso: preferencias alimenticias, check-ins diarios, progreso.</li>
      </ul>

      <h2>Uso de la información</h2>
      <p>Tus datos se utilizan exclusivamente para:</p>
      <ul>
        <li>Generar planes de alimentación personalizados.</li>
        <li>Calcular macros y objetivos nutricionales.</li>
        <li>Dar seguimiento a tu progreso.</li>
        <li>Mejorar nuestros algoritmos de recomendación.</li>
      </ul>

      <h2>Protección de datos</h2>
      <p>Tus datos médicos y biométricos se almacenan <strong>cifrados</strong> y nunca se comparten con terceros sin tu consentimiento explícito. Implementamos medidas de seguridad técnicas y organizativas para proteger tu información contra acceso no autorizado, pérdida o destrucción.</p>

      <h2>Compartir con terceros</h2>
      <p>No vendemos, alquilamos ni compartimos tu información personal con terceros para fines de marketing. Podemos compartir datos anonimizados y agregados para fines estadísticos o de investigación.</p>

      <h2>Tus derechos</h2>
      <p>Conforme a la <strong>Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)</strong>, tienes derecho a:</p>
      <ul>
        <li><strong>Acceso:</strong> conocer qué datos tenemos tuyos.</li>
        <li><strong>Rectificación:</strong> corregir datos inexactos.</li>
        <li><strong>Cancelación:</strong> solicitar la eliminación de tus datos.</li>
        <li><strong>Oposición:</strong> oponerte al uso de tus datos para fines específicos.</li>
      </ul>
      <p>Para ejercer estos derechos, contáctanos a través de la sección de perfil en la aplicación.</p>

      <h2>Menores de edad</h2>
      <p>Los menores de 16-17 años requieren consentimiento de un tutor legal para usar NutriCasa en modalidad de alimentación balanceada. Los datos de menores se manejan con privacidad reforzada conforme a la LFPDPPP.</p>

      <h2>Cambios a este aviso</h2>
      <p>Notificaremos cualquier cambio significativo a través de la plataforma. La versión actualizada entrará en vigor en la fecha indicada al inicio del aviso.</p>

      <p style="margin-top:32px;">Consulta nuestros <a routerLink="/legal/terms">Términos de Servicio</a> para más información.</p>
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
export class PrivacyPage {
  private readonly location = inject(Location);

  back() { this.location.back(); }
}
