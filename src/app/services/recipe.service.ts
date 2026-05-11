import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { FavoriteRecipeDto } from '../models/recipe.models';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private readonly api = inject(ApiService);

  getFavorites(mealType?: string): Observable<FavoriteRecipeDto[]> {
    let params = new HttpParams();
    if (mealType) params = params.set('mealType', mealType);
    return this.api.get<FavoriteRecipeDto[]>('/recipes/favorites', params);
  }

  addFavorite(recipeId: string): Observable<void> {
    return this.api.post<void>(`/recipes/${recipeId}/favorite`);
  }

  removeFavorite(recipeId: string): Observable<void> {
    return this.api.delete<void>(`/recipes/${recipeId}/favorite`);
  }
}
