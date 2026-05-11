export interface FavoriteRecipeDto {
  favoriteId: string;
  recipeId: string;
  recipeName: string;
  calories: number;
  proteinGr: number;
  fatGr: number;
  carbsGr: number;
  mealType: string;
  photoUrl?: string;
  slug?: string;
  createdAt: string;
}
