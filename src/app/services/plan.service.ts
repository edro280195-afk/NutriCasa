import { Injectable, inject } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  GeneratePlanRequest, PlanGenerationResult,
  LogMealRequest, MealLogDto, MealAdherenceSummaryDto,
  ReorderMealsRequest,
  ToggleLockRequest, AdjustPortionRequest,
} from '../models/plan.models';

@Injectable({ providedIn: 'root' })
export class PlanService {
  private readonly api = inject(ApiService);

  generate(request: GeneratePlanRequest): Observable<PlanGenerationResult> {
    return this.api.post<PlanGenerationResult>('/plans/generate', request);
  }

  getCurrent(): Observable<PlanGenerationResult> {
    return this.api.get<PlanGenerationResult>('/plans/current');
  }

  logMeal(planId: string, planMealId: string, request: LogMealRequest): Observable<void> {
    return this.api.post<void>(`/plans/${planId}/meals/${planMealId}/log`, request);
  }

  getMealLogs(dateFrom?: string, dateTo?: string): Observable<MealLogDto[]> {
    let params = new HttpParams();
    if (dateFrom) params = params.set('dateFrom', dateFrom);
    if (dateTo) params = params.set('dateTo', dateTo);
    return this.api.get<MealLogDto[]>('/plans/logs', params);
  }

  reorderMeals(planId: string, request: ReorderMealsRequest): Observable<void> {
    return this.api.patch<void>(`/plans/${planId}/meals/reorder`, request);
  }

  toggleLock(planId: string, planMealId: string, request: ToggleLockRequest): Observable<void> {
    return this.api.patch<void>(`/plans/${planId}/meals/${planMealId}/lock`, request);
  }

  swapMeal(planId: string, planMealId: string, reason?: string): Observable<void> {
    return this.api.post<void>(`/plans/${planId}/meals/${planMealId}/swap`, { reason });
  }

  adjustPortion(planId: string, planMealId: string, request: AdjustPortionRequest): Observable<void> {
    return this.api.patch<void>(`/plans/${planId}/meals/${planMealId}/portion`, request);
  }
}
