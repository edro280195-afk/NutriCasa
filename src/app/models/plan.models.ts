export interface GeneratePlanRequest {
  weekStartDate: string;
  forceRegenerate?: boolean;
}

export interface PlanGenerationResult {
  planId: string;
  startDate: string;
  endDate: string;
  budgetModeCode: string;
  budgetModeName: string;
  isOverridePlan: boolean;
  estimatedCostMxn?: number;
  savingsVsGourmetMxn?: number;
  savingsVsGourmetPercent?: number;
  days: DayPlanDto[];
  macros: KetoProfileResult;
  shoppingList?: ShoppingListDto;
}

export interface DayPlanDto {
  dayNumber: number;
  dayName: string;
  meals: MealPlanDto[];
  dayTotals: DayTotalsDto;
}

export interface MealPlanDto {
  planMealId: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  isLocked: boolean;
  recipe: RecipeDto;
}

export interface RecipeDto {
  recipeId: string;
  name: string;
  calories: number;
  proteinGr: number;
  fatGr: number;
  carbsGr: number;
  prepTimeMin: number;
  cookTimeMin: number;
  instructions: string;
  estimatedCostMxn: number;
  primaryStore?: string;
}

export interface DayTotalsDto {
  calories: number;
  proteinGr: number;
  fatGr: number;
  carbsGr: number;
  estimatedCostMxn: number;
}

export interface KetoProfileResult {
  bmrKcal: number;
  tdeeKcal: number;
  dailyCalories: number;
  carbsGrams: number;
  proteinGrams: number;
  fatGrams: number;
  carbsPercent: number;
  proteinPercent: number;
  fatPercent: number;
}

export interface ShoppingListDto {
  shoppingListId: string;
  totalEstimatedMxn: number;
  byStore: StoreGroupDto[];
}

export interface StoreGroupDto {
  storeCode: string;
  storeName: string;
  items: ShoppingItemDto[];
  subtotalMxn: number;
}

export interface ShoppingItemDto {
  ingredientName: string;
  totalAmount: number;
  unit: string;
  estimatedCostMxn: number;
}

export interface MacroProgress {
  current: number;
  target: number;
  percentage: number;
  label: string;
  unit: string;
}
