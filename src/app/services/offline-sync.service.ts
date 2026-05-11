import { Injectable, inject, signal, effect } from '@angular/core';
import { ConnectivityService } from './connectivity.service';
import { ApiService } from './api.service';

interface PendingRequest {
  id: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string;
  body?: unknown;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class OfflineSyncService {
  private readonly api = inject(ApiService);
  private readonly connectivity = inject(ConnectivityService);
  private readonly storageKey = 'nutricasa_pending_requests';

  readonly pendingCount = signal(0);

  constructor() {
    this.loadPendingCount();

    effect(() => {
      if (this.connectivity.isOnline()) {
        this.processQueue();
      }
    });
  }

  private loadPendingCount() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const queue: PendingRequest[] = JSON.parse(stored);
        this.pendingCount.set(queue.length);
      }
    } catch { /* ignore */ }
  }

  enqueue(method: PendingRequest['method'], url: string, body?: unknown) {
    const request: PendingRequest = {
      id: crypto.randomUUID(),
      method,
      url,
      body,
      createdAt: new Date().toISOString(),
    };

    try {
      const stored = localStorage.getItem(this.storageKey);
      const queue: PendingRequest[] = stored ? JSON.parse(stored) : [];
      queue.push(request);
      localStorage.setItem(this.storageKey, JSON.stringify(queue));
      this.pendingCount.set(queue.length);
    } catch { /* fallback — ignore */ }
  }

  private async processQueue() {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return;

    const queue: PendingRequest[] = JSON.parse(stored);
    if (queue.length === 0) return;

    const remaining: PendingRequest[] = [];

    for (const req of queue) {
      try {
        switch (req.method) {
          case 'POST':
            await this.api.post(req.url, req.body).toPromise();
            break;
          case 'PUT':
            await this.api.put(req.url, req.body).toPromise();
            break;
          case 'PATCH':
            await this.api.patch(req.url, req.body).toPromise();
            break;
          case 'DELETE':
            await this.api.delete(req.url).toPromise();
            break;
        }
      } catch {
        remaining.push(req);
      }
    }

    localStorage.setItem(this.storageKey, JSON.stringify(remaining));
    this.pendingCount.set(remaining.length);
  }
}
