import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { OnboardingService } from './onboarding.service';
import { ApiService } from './api.service';
import type {
  OnboardingStatusResponse, GroupRequest, BasicDataRequest, MetricsRequest,
  BodyTypeRequest, ActivityRequest, BudgetModeRequest,
  MedicalProfileRequest, MedicalOverrideRequest, DisclaimerGoalRequest,
  CompleteStep1GroupResponse, CompleteStep3MetricsResponse,
  CompleteStep6MedicalProfileResponse, CompleteStep7DisclaimerGoalResponse,
} from '../models/onboarding.models';

function createApi() {
  return { post: vi.fn(), get: vi.fn() } as unknown as ApiService;
}

describe('OnboardingService', () => {
  let service: OnboardingService;
  let api: ReturnType<typeof createApi>;

  beforeEach(() => {
    api = createApi();

    TestBed.configureTestingModule({
      providers: [
        OnboardingService,
        { provide: ApiService, useValue: api },
      ],
    });

    service = TestBed.inject(OnboardingService);
  });

  it('is created', () => {
    expect(service).toBeTruthy();
  });

  it('getStatus calls /onboarding/status', () => new Promise<void>((done) => {
    const mockStatus: OnboardingStatusResponse = {
      stepsCompleted: {
        step1Group: true, step2BasicData: true, step3Metrics: false,
        step4BodyType: false, step5Activity: false, step5BudgetMode: false,
        step6MedicalProfile: false, step6Override: false, step7Disclaimer: false,
      },
      requiresOverride: false,
      onboardingComplete: false,
      currentSuggestedStep: 3,
    };
    api.get = vi.fn().mockReturnValueOnce(of(mockStatus));

    service.getStatus().subscribe((status) => {
      expect(status.currentSuggestedStep).toBe(3);
      expect(api.get).toHaveBeenCalledWith('/onboarding/status');
      done();
    });
  }));

  it('completeStep1Group calls /onboarding/step1-group', () => new Promise<void>((done) => {
    const req: GroupRequest = { action: 'create', groupName: 'Mi Familia' };
    const mockRes: CompleteStep1GroupResponse = { groupId: 'g1', groupName: 'Mi Familia', inviteCode: 'ABC123' };
    api.post = vi.fn().mockReturnValueOnce(of(mockRes));

    service.completeStep1Group(req).subscribe((res) => {
      expect(res.groupId).toBe('g1');
      expect(api.post).toHaveBeenCalledWith('/onboarding/step1-group', req);
      done();
    });
  }));

  it('completeStep2BasicData calls /onboarding/step2-basic-data', () => new Promise<void>((done) => {
    const req: BasicDataRequest = { fullName: 'Test', birthDate: '1990-01-01', gender: 'Male' };
    api.post = vi.fn().mockReturnValueOnce(of(void 0));

    service.completeStep2BasicData(req).subscribe(() => {
      expect(api.post).toHaveBeenCalledWith('/onboarding/step2-basic-data', req);
      done();
    });
  }));

  it('completeStep3Metrics calls /onboarding/step3-metrics', () => new Promise<void>((done) => {
    const req: MetricsRequest = { weightKg: 80, heightCm: 175, targetWeightKg: 70, goalType: 'WeightLoss' };
    const mockRes: CompleteStep3MetricsResponse = {};
    api.post = vi.fn().mockReturnValueOnce(of(mockRes));

    service.completeStep3Metrics(req).subscribe(() => {
      expect(api.post).toHaveBeenCalledWith('/onboarding/step3-metrics', req);
      done();
    });
  }));

  it('completeStep4BodyType calls /onboarding/step4-body-type', () => new Promise<void>((done) => {
    const req: BodyTypeRequest = { bodyType: 'average' };
    api.post = vi.fn().mockReturnValueOnce(of(void 0));

    service.completeStep4BodyType(req).subscribe(() => {
      expect(api.post).toHaveBeenCalledWith('/onboarding/step4-body-type', req);
      done();
    });
  }));

  it('completeStep5Activity calls /onboarding/step5-activity', () => new Promise<void>((done) => {
    const req: ActivityRequest = { activityLevel: 'Moderate' };
    api.post = vi.fn().mockReturnValueOnce(of(void 0));

    service.completeStep5Activity(req).subscribe(() => {
      expect(api.post).toHaveBeenCalledWith('/onboarding/step5-activity', req);
      done();
    });
  }));

  it('completeStep5BudgetMode calls /onboarding/step5-budget-mode', () => new Promise<void>((done) => {
    const req: BudgetModeRequest = { budgetModeCode: 'economic' };
    api.post = vi.fn().mockReturnValueOnce(of(void 0));

    service.completeStep5BudgetMode(req).subscribe(() => {
      expect(api.post).toHaveBeenCalledWith('/onboarding/step5-budget-mode', req);
      done();
    });
  }));

  it('completeStep6MedicalProfile calls /onboarding/step6-medical-profile', () => new Promise<void>((done) => {
    const req: MedicalProfileRequest = { allergies: [], medications: [], dietaryRestrictions: [], dislikedIngredients: [], preferredIngredients: [], ketoExperienceLevel: 'Beginner' };
    const mockRes: CompleteStep6MedicalProfileResponse = { requiresOverride: false, conditions: [] };
    api.post = vi.fn().mockReturnValueOnce(of(mockRes));

    service.completeStep6MedicalProfile(req).subscribe((res) => {
      expect(res.requiresOverride).toBe(false);
      expect(api.post).toHaveBeenCalledWith('/onboarding/step6-medical-profile', req);
      done();
    });
  }));

  it('completeStep6Override calls /onboarding/step6-override', () => new Promise<void>((done) => {
    const req: MedicalOverrideRequest = { passwordConfirmation: 'pass', disclaimerAccepted: true, disclaimerVersionId: 'd1' };
    api.post = vi.fn().mockReturnValueOnce(of(void 0));

    service.completeStep6Override(req).subscribe(() => {
      expect(api.post).toHaveBeenCalledWith('/onboarding/step6-override', req);
      done();
    });
  }));

  it('completeStep7DisclaimerGoal calls /onboarding/step7-disclaimer-goal', () => new Promise<void>((done) => {
    const req: DisclaimerGoalRequest = { disclaimerVersionId: 'd1', goalType: 'WeightLoss', targetWeightKg: 70, motivationText: 'Quiero sentirme bien' };
    const mockRes: CompleteStep7DisclaimerGoalResponse = {
      onboardingComplete: true,
      ketoProfile: { bmrKcal: 1800, tdeeKcal: 2100, dailyCalories: 1800, carbsGrams: 20, proteinGrams: 120, fatGrams: 140, carbsPercent: 5, proteinPercent: 27, fatPercent: 68 },
      firstPlanGenerated: true,
      firstPlanId: 'plan-1',
    };
    api.post = vi.fn().mockReturnValueOnce(of(mockRes));

    service.completeStep7DisclaimerGoal(req).subscribe((res) => {
      expect(res.onboardingComplete).toBe(true);
      expect(res.ketoProfile.dailyCalories).toBe(1800);
      expect(api.post).toHaveBeenCalledWith('/onboarding/step7-disclaimer-goal', req);
      done();
    });
  }));
});
