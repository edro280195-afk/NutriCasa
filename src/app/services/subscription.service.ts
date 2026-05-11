import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  SubscriptionPlanDto,
  UserSubscriptionDto,
  CreateCheckoutRequest,
  TrialSubscriptionRequest,
} from '../models/subscription.models';

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private readonly api = inject(ApiService);

  getPlans(): Observable<SubscriptionPlanDto[]> {
    return this.api.get<SubscriptionPlanDto[]>('/subscriptions/plans');
  }

  getMySubscription(): Observable<UserSubscriptionDto | null> {
    return this.api.get<UserSubscriptionDto | null>('/subscriptions/my');
  }

  createCheckout(request: CreateCheckoutRequest): Observable<UserSubscriptionDto> {
    return this.api.post<UserSubscriptionDto>('/subscriptions/create', request);
  }

  startTrial(request: TrialSubscriptionRequest): Observable<UserSubscriptionDto> {
    return this.api.post<UserSubscriptionDto>('/subscriptions/trial', request);
  }

  cancel(cancelImmediately: boolean): Observable<void> {
    return this.api.post<void>('/subscriptions/cancel', { cancelImmediately });
  }
}
