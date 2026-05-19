import type { KetoProfileResult } from './plan.models';

export interface OnboardingStatus {
  currentStep: number;
  totalSteps: number;
  isComplete: boolean;
  completedSteps: string[];
}

export interface OnboardingStatusResponse {
  stepsCompleted: StepsCompletedDto;
  requiresOverride: boolean;
  onboardingComplete: boolean;
  currentSuggestedStep: number;
}

export interface StepsCompletedDto {
  step1Group: boolean;
  step2BasicData: boolean;
  step3Metrics: boolean;
  step4BodyType: boolean;
  step5Activity: boolean;
  step5BudgetMode: boolean;
  step6MedicalProfile: boolean;
  step6Override: boolean;
  step7Disclaimer: boolean;
}

export interface GroupRequest {
  action: 'create' | 'join';
  groupName?: string;
  inviteCode?: string;
}

export interface BasicDataRequest {
  fullName?: string;
  birthDate: string;
  gender: 'Male' | 'Female' | 'NonBinary' | 'PreferNotToSay';
}

export interface MetricsRequest {
  weightKg: number;
  heightCm: number;
  targetWeightKg?: number;
  goalType?: 'WeightLoss' | 'BodyRecomp' | 'MuscleGain' | 'Maintenance' | 'Health';
}

export type BodyType = 'slim' | 'average' | 'athletic' | 'curvy' | 'plus' | 'heavy';

export interface BodyTypeRequest {
  bodyType: BodyType;
}

export type ActivityLevel = 'Sedentary' | 'Light' | 'Moderate' | 'Active' | 'VeryActive';

export interface ActivityRequest {
  activityLevel: ActivityLevel;
}

export type BudgetMode = 'economic' | 'pantry_basic' | 'simple_kitchen' | 'busy_parent' | 'athletic' | 'gourmet';

export interface BudgetModeRequest {
  budgetModeCode: string;
}

export interface MedicalProfileRequest {
  hasDiabetes?: boolean;
  diabetesType?: 'T1' | 'T2' | 'Gestational';
  isPregnantOrLactating?: boolean;
  hasKidneyIssues?: boolean;
  hasLiverIssues?: boolean;
  hasPancreasIssues?: boolean;
  hasThyroidIssues?: boolean;
  hasHeartCondition?: boolean;
  hasEatingDisorderHistory?: boolean;
  hasGallbladderIssues?: boolean;
  otherConditions?: string;
  allergies: string[];
  medications: string[];
  dietaryRestrictions: string[];
  dislikedIngredients: string[];
  preferredIngredients: string[];
  ketoExperienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface MedicalOverrideRequest {
  passwordConfirmation: string;
  disclaimerAccepted: boolean;
  disclaimerVersionId?: string;
}

export interface DisclaimerGoalRequest {
  disclaimerVersionId: string;
  goalType: 'WeightLoss' | 'BodyRecomp' | 'MuscleGain' | 'Maintenance' | 'Health';
  targetWeightKg?: number;
  targetDate?: string;
  motivationText?: string;
}

export interface CompleteStep1GroupResponse {
  groupId: string;
  groupName?: string;
  inviteCode?: string;
}

export interface CompleteStep3MetricsResponse {
  warningMessage?: string;
}

export interface CompleteStep6MedicalProfileResponse {
  requiresOverride: boolean;
  conditions: string[];
  message?: string;
}

export interface CompleteStep7DisclaimerGoalResponse {
  onboardingComplete: boolean;
  ketoProfile: KetoProfileResult;
  firstPlanGenerated: boolean;
  firstPlanId?: string;
  firstPlanError?: string;
}

export type KetoProfile = KetoProfileResult;
