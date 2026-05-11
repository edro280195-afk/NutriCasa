import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { PlanService } from './plan.service';
import { ApiService } from './api.service';
import type { GeneratePlanRequest, PlanGenerationResult } from '../models/plan.models';

function createApi() {
  return { post: vi.fn(), get: vi.fn() } as unknown as ApiService;
}

describe('PlanService', () => {
  let service: PlanService;
  let api: ReturnType<typeof createApi>;

  const mockPlan: PlanGenerationResult = {
    planId: 'p1',
    startDate: '2026-05-11',
    endDate: '2026-05-17',
    budgetModeCode: 'economic',
    budgetModeName: 'Económico',
    isOverridePlan: false,
    estimatedCostMxn: 480,
    savingsVsGourmetMxn: 820,
    savingsVsGourmetPercent: 63,
    days: [],
    macros: { bmrKcal: 1800, tdeeKcal: 2100, dailyCalories: 1800, carbsGrams: 20, proteinGrams: 120, fatGrams: 140, carbsPercent: 5, proteinPercent: 27, fatPercent: 68 },
  };

  beforeEach(() => {
    api = createApi();

    TestBed.configureTestingModule({
      providers: [
        PlanService,
        { provide: ApiService, useValue: api },
      ],
    });

    service = TestBed.inject(PlanService);
  });

  it('is created', () => {
    expect(service).toBeTruthy();
  });

  it('generate calls /plans/generate', () => new Promise<void>((done) => {
    const req: GeneratePlanRequest = { weekStartDate: '2026-05-11', forceRegenerate: false };
    api.post = vi.fn().mockReturnValueOnce(of(mockPlan));

    service.generate(req).subscribe((plan) => {
      expect(plan.planId).toBe('p1');
      expect(plan.budgetModeCode).toBe('economic');
      expect(api.post).toHaveBeenCalledWith('/plans/generate', req);
      done();
    });
  }));

  it('getCurrent calls /plans/current', () => new Promise<void>((done) => {
    api.get = vi.fn().mockReturnValueOnce(of(mockPlan));

    service.getCurrent().subscribe((plan) => {
      expect(plan.planId).toBe('p1');
      expect(api.get).toHaveBeenCalledWith('/plans/current');
      done();
    });
  }));
});
