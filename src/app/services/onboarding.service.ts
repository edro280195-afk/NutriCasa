import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  OnboardingStatusResponse, GroupRequest, BasicDataRequest, MetricsRequest,
  BodyTypeRequest, ActivityRequest, BudgetModeRequest,
  MedicalProfileRequest, MedicalOverrideRequest, DisclaimerGoalRequest,
  CompleteStep1GroupResponse, CompleteStep3MetricsResponse,
  CompleteStep6MedicalProfileResponse, CompleteStep7DisclaimerGoalResponse,
} from '../models/onboarding.models';

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private readonly api = inject(ApiService);

  getStatus(): Observable<OnboardingStatusResponse> {
    return this.api.get<OnboardingStatusResponse>('/onboarding/status');
  }

  completeStep1Group(request: GroupRequest): Observable<CompleteStep1GroupResponse> {
    return this.api.post<CompleteStep1GroupResponse>('/onboarding/step1-group', request);
  }

  completeStep2BasicData(request: BasicDataRequest): Observable<void> {
    return this.api.post<void>('/onboarding/step2-basic-data', request);
  }

  completeStep3Metrics(request: MetricsRequest): Observable<CompleteStep3MetricsResponse> {
    return this.api.post<CompleteStep3MetricsResponse>('/onboarding/step3-metrics', request);
  }

  completeStep4BodyType(request: BodyTypeRequest): Observable<void> {
    return this.api.post<void>('/onboarding/step4-body-type', request);
  }

  completeStep5Activity(request: ActivityRequest): Observable<void> {
    return this.api.post<void>('/onboarding/step5-activity', request);
  }

  completeStep5BudgetMode(request: BudgetModeRequest): Observable<void> {
    return this.api.post<void>('/onboarding/step5-budget-mode', request);
  }

  completeStep6MedicalProfile(request: MedicalProfileRequest): Observable<CompleteStep6MedicalProfileResponse> {
    return this.api.post<CompleteStep6MedicalProfileResponse>('/onboarding/step6-medical-profile', request);
  }

  completeStep6Override(request: MedicalOverrideRequest): Observable<void> {
    return this.api.post<void>('/onboarding/step6-override', request);
  }

  completeStep7DisclaimerGoal(request: DisclaimerGoalRequest): Observable<CompleteStep7DisclaimerGoalResponse> {
    return this.api.post<CompleteStep7DisclaimerGoalResponse>('/onboarding/step7-disclaimer-goal', request);
  }
}
