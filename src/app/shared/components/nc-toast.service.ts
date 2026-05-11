import { Injectable, signal } from '@angular/core';

export interface NcToast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class NcToastService {
  readonly toasts = signal<NcToast[]>([]);

  show(toast: Omit<NcToast, 'id'>): string {
    const id = crypto.randomUUID();
    this.toasts.update(t => [...t, { ...toast, id }]);
    const duration = toast.duration ?? 4000;
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
    return id;
  }

  dismiss(id: string): void {
    this.toasts.update(t => t.filter(x => x.id !== id));
  }

  success(message: string, duration?: number): string {
    return this.show({ message, type: 'success', duration });
  }

  error(message: string, duration?: number): string {
    return this.show({ message, type: 'error', duration });
  }

  warning(message: string, duration?: number): string {
    return this.show({ message, type: 'warning', duration });
  }

  info(message: string, duration?: number): string {
    return this.show({ message, type: 'info', duration });
  }
}
