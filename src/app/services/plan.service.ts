import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { GeneratePlanRequest, PlanGenerationResult } from '../models/plan.models';

@Injectable({ providedIn: 'root' })
export class PlanService {
  private readonly api = inject(ApiService);

  generate(request: GeneratePlanRequest): Observable<PlanGenerationResult> {
    return this.api.post<PlanGenerationResult>('/plans/generate', request);
  }

  getCurrent(): Observable<PlanGenerationResult> {
    return this.api.get<PlanGenerationResult>('/plans/current');
  }
}
