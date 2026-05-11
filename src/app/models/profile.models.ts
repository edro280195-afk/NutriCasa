export interface MedicalProfileDto {
  hasDiabetes: boolean;
  diabetesType: string | null;
  isPregnantOrLactating: boolean;
  hasKidneyIssues: boolean;
  hasLiverIssues: boolean;
  hasPancreasIssues: boolean;
  hasThyroidIssues: boolean;
  hasHeartCondition: boolean;
  hasEatingDisorderHistory: boolean;
  hasGallbladderIssues: boolean;
  otherConditions: string | null;
  allergies: string[];
  medications: string[];
  dietaryRestrictions: string[];
  dislikedIngredients: string[];
  preferredIngredients: string[];
  ketoExperienceLevel: string;
  requiresHumanReview: boolean;
  overrideAcceptedAt: string | null;
}

export interface UpdateMedicalProfileRequest {
  hasDiabetes: boolean;
  diabetesType?: string;
  isPregnantOrLactating: boolean;
  hasKidneyIssues: boolean;
  hasLiverIssues: boolean;
  hasPancreasIssues: boolean;
  hasThyroidIssues: boolean;
  hasHeartCondition: boolean;
  hasEatingDisorderHistory: boolean;
  hasGallbladderIssues: boolean;
  otherConditions?: string;
  allergies: string[];
  medications: string[];
  dietaryRestrictions: string[];
  dislikedIngredients: string[];
  preferredIngredients: string[];
  ketoExperienceLevel: string;
}

export interface PreferencesDto {
  /* Privacy */
  shareWeight: string;
  shareBodyFat: string;
  shareMeasurements: string;
  sharePhotos: string;
  shareCheckIns: string;
  allowAiMentions: boolean;

  /* Notifications */
  allowPush: boolean;
  allowEmail: boolean;
  weeklyDigest: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;

  /* User settings */
  timezone: string;
  preferredLanguage: string;
  nutritionTrack: string;
  budgetModeCode: string | null;
  budgetModeName: string | null;
}

export interface UpdatePreferencesRequest {
  shareWeight?: string;
  shareBodyFat?: string;
  shareMeasurements?: string;
  sharePhotos?: string;
  shareCheckIns?: string;
  allowAiMentions?: boolean;
  allowPush?: boolean;
  allowEmail?: boolean;
  weeklyDigest?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  timezone?: string;
  preferredLanguage?: string;
}
