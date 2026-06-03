import { Injectable, inject, isDevMode, signal, computed } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { DayPlanDto } from '../models/plan.models';

// ─── Tipos de eventos SignalR ───────────────────────────────────────────────

export interface PlanStartedEvent {
  planId: string;
  totalDays: number;
  message: string;
  progress: number;
}

export interface PlanDayReadyEvent {
  dayNumber: number;
  dayName: string;
  day: DayPlanDto;
  progress: number;
}

export interface PlanProgressEvent {
  emoji: string;
  message: string;
  progress: number;
}

export interface PlanCompletedEvent {
  planId: string;
  message: string;
  progress: number;
}

export interface PlanErrorEvent {
  message: string;
  dayNumber?: number;
}

// ─── Servicio ────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class PlanGenerationHubService {
  private readonly auth = inject(AuthService);
  private hubConnection: signalR.HubConnection | null = null;

  private readonly hubUrl = isDevMode()
    ? 'https://localhost:7120/hubs/plan-generation'
    : 'https://nutricasa-api.onrender.com/hubs/plan-generation';

  // ── Señales de estado ──
  readonly isConnected = signal(false);
  readonly isGenerating = signal(false);
  readonly progress = signal(0);
  readonly currentMessage = signal('');
  readonly currentEmoji = signal('');
  readonly completedDays = signal<DayPlanDto[]>([]);

  // ── Observables para suscripción en componentes ──
  readonly onStarted$ = new Subject<PlanStartedEvent>();
  readonly onDayReady$ = new Subject<PlanDayReadyEvent>();
  readonly onProgress$ = new Subject<PlanProgressEvent>();
  readonly onCompleted$ = new Subject<PlanCompletedEvent>();
  readonly onError$ = new Subject<PlanErrorEvent>();

  readonly progressLabel = computed(() => {
    const p = this.progress();
    const d = this.completedDays().length;
    return d === 0
      ? 'Iniciando...'
      : d === 7
        ? '¡Plan completo!'
        : `${d} de 7 días listos`;
  });

  async connect(): Promise<void> {
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    const token = this.auth.getAccessToken();

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => token ?? '',
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .configureLogging(isDevMode() ? signalR.LogLevel.Information : signalR.LogLevel.Warning)
      .build();

    this.registerHandlers();

    try {
      await this.hubConnection.start();
      this.isConnected.set(true);
      console.log('[PlanGenerationHub] Conectado ✅');
    } catch (err) {
      console.error('[PlanGenerationHub] Error al conectar:', err);
      this.isConnected.set(false);
    }

    this.hubConnection.onreconnected(() => this.isConnected.set(true));
    this.hubConnection.onreconnecting(() => this.isConnected.set(false));
    this.hubConnection.onclose(() => this.isConnected.set(false));
  }

  async disconnect(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.hubConnection = null;
      this.isConnected.set(false);
    }
  }

  resetState(): void {
    this.isGenerating.set(false);
    this.progress.set(0);
    this.currentMessage.set('');
    this.currentEmoji.set('');
    this.completedDays.set([]);
  }

  private registerHandlers(): void {
    if (!this.hubConnection) return;

    this.hubConnection.on('plan:started', (event: PlanStartedEvent) => {
      this.isGenerating.set(true);
      this.progress.set(event.progress);
      this.currentMessage.set(event.message);
      this.currentEmoji.set('🚀');
      this.completedDays.set([]);
      this.onStarted$.next(event);
    });

    this.hubConnection.on('plan:progress', (event: PlanProgressEvent) => {
      this.progress.set(event.progress);
      this.currentMessage.set(event.message);
      this.currentEmoji.set(event.emoji);
      this.onProgress$.next(event);
    });

    this.hubConnection.on('plan:day_ready', (event: PlanDayReadyEvent) => {
      this.progress.set(event.progress);
      this.completedDays.update(days => [...days, event.day]);
      this.onDayReady$.next(event);
    });

    this.hubConnection.on('plan:completed', (event: PlanCompletedEvent) => {
      this.isGenerating.set(false);
      this.progress.set(100);
      this.currentMessage.set(event.message);
      this.currentEmoji.set('✅');
      this.onCompleted$.next(event);
    });

    this.hubConnection.on('plan:error', (event: PlanErrorEvent) => {
      this.onError$.next(event);
      // No detenemos isGenerating — puede ser un error parcial de un día.
    });
  }
}
