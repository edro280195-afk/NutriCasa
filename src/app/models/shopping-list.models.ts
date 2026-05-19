export interface ShoppingListDto {
  shoppingListId: string;
  weekStart: string;
  weekEnd: string;
  totalCost?: number;
  items: ShoppingListItemDto[];
}

export interface ShoppingListItemDto {
  itemId: string;
  ingredientName: string;
  totalAmount: number;
  unit: string;
  category?: string;
  estimatedCostMxn?: number;
  isPurchased: boolean;
  purchasedByUserId?: string;
  sortOrder: number;
}
