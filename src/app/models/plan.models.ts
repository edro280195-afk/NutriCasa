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
  portionMultiplier?: number;
  rowVersion?: number;
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

/* Meal adherence */
export type MealLogStatus = 'completed' | 'partial' | 'skipped' | 'substituted';

export interface LogMealRequest {
  status: MealLogStatus;
  substitutionNote?: string;
  actualPortion?: number;
}

export interface MealLogDto {
  logId: string;
  planMealId: string;
  status: MealLogStatus;
  substitutionNote?: string;
  actualPortion?: number;
  recipeName: string;
  mealType: string;
  loggedForDate: string;
  loggedAt: string;
}

export interface MealAdherenceSummaryDto {
  date: string;
  totalMeals: number;
  completedMeals: number;
  partialMeals: number;
  skippedMeals: number;
  substitutedMeals: number;
  adherencePercent: number;
}

/* Reorder */
export interface MealMoveDto {
  planMealId: string;
  newDayOfWeek: number;
  newMealType: string;
  rowVersion: number;
  newSortOrder: number;
}

export interface ReorderMealsRequest {
  moves: MealMoveDto[];
}

/* Lock / Portion */
export interface ToggleLockRequest {
  isLocked: boolean;
}

export interface AdjustPortionRequest {
  portionMultiplier: number;
}
