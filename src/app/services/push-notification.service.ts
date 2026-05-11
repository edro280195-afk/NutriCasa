import { Injectable, inject, signal } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { from, Observable, of, switchMap } from 'rxjs';
import { ApiService } from './api.service';

export interface PushSubscriptionDto {
  id: string;
  endpoint: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
}

export interface VapidPublicKeyResponse {
  publicKey: string;
}

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private readonly swPush = inject(SwPush);
  private readonly api = inject(ApiService);

  readonly isSupported = this.swPush.isEnabled;
  readonly subscription$ = this.swPush.subscription;

  getVapidPublicKey(): Observable<string> {
    return this.api.get<VapidPublicKeyResponse>('/push/vapid-public-key').pipe(
      switchMap(res => of(res.publicKey))
    );
  }

  requestSubscription(): Observable<PushSubscription | null> {
    return this.getVapidPublicKey().pipe(
      switchMap(publicKey =>
        from(this.swPush.requestSubscription({ serverPublicKey: publicKey }))
      )
    );
  }

  unsubscribe(subscription: PushSubscription): Observable<void> {
    return from(subscription.unsubscribe().then(() => {}));
  }

  getSubscriptions(): Observable<PushSubscriptionDto[]> {
    return this.api.get<PushSubscriptionDto[]>('/push');
  }

  subscribeBackend(endpoint: string, p256dh: string, auth: string): Observable<PushSubscriptionDto> {
    return this.api.post<PushSubscriptionDto>('/push/subscribe', { endpoint, p256dhKey: p256dh, authKey: auth });
  }

  unsubscribeBackend(endpoint: string): Observable<void> {
    return this.api.post<void>('/push/unsubscribe', { endpoint });
  }
}
