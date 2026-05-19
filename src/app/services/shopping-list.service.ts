import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ShoppingListDto, ShoppingListItemDto } from '../models/shopping-list.models';

@Injectable({ providedIn: 'root' })
export class ShoppingListService {
  private readonly api = inject(ApiService);

  getCurrent(): Observable<ShoppingListDto> {
    return this.api.get<ShoppingListDto>('/shoppinglist/current');
  }

  generate(): Observable<void> {
    return this.api.post<void>('/shoppinglist/generate');
  }

  togglePurchased(itemId: string): Observable<void> {
    return this.api.patch<void>(`/shoppinglist/items/${itemId}/toggle-purchased`);
  }

  buildWhatsAppText(list: ShoppingListDto): string {
    const lines: string[] = ['🛒 *Lista de Compras NutriCasa*', ''];
    const grouped = new Map<string, ShoppingListItemDto[]>();

    for (const item of list.items) {
      const cat = item.category || 'General';
      if (!grouped.has(cat)) grouped.set(cat, []);
      grouped.get(cat)!.push(item);
    }

    for (const [cat, items] of grouped) {
      lines.push(`*${cat}*`);
      for (const item of items) {
        const check = item.isPurchased ? '✅' : '⬜';
        const cost = item.estimatedCostMxn ? ' ~ $' + item.estimatedCostMxn.toFixed(2) : '';
        lines.push(check + ' ' + item.ingredientName + ' — ' + item.totalAmount + ' ' + item.unit + cost);
      }
      lines.push('');
    }

    if (list.totalCost) {
      lines.push(`💰 *Total estimado: $${list.totalCost.toFixed(2)} MXN*`);
    }

    lines.push('');
    lines.push('Generado por NutriCasa 🥑');

    return lines.join('\n');
  }

  openWhatsApp(text: string): void {
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  }
}
