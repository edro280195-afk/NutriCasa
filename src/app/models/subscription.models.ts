export interface SubscriptionPlanDto {
  planId: string;
  code: string;
  name: string;
  description?: string;
  priceMonthlyMxn: number;
  priceYearlyMxn?: number;
  trialDays: number;
  maxGroupMembers?: number;
  maxRegenerationsWeek?: number;
  maxSwapsWeek?: number;
  hasAiChat: boolean;
  hasPhotoAnalysis: boolean;
  sortOrder: number;
}

export interface UserSubscriptionDto {
  subscriptionId: string;
  planId: string;
  planCode: string;
  planName: string;
  priceMonthlyMxn: number;
  status: string;
  startedAt: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd: boolean;
}

export interface CreateCheckoutRequest {
  planId: string;
}

export interface TrialSubscriptionRequest {
  planId: string;
}

export interface CancelSubscriptionRequest {
  cancelImmediately: boolean;
}
