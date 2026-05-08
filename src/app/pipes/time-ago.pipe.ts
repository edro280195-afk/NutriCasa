import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
  standalone: true,
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | Date): string {
    if (!value) return '';

    const date = typeof value === 'string' ? new Date(value) : value;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return 'ahora';
    if (diffMin < 60) return `hace ${diffMin} min`;
    if (diffHr < 24) return `hace ${diffHr} h`;
    if (diffDay < 7) return `hace ${diffDay} día${diffDay > 1 ? 's' : ''}`;
    return date.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  }
}
