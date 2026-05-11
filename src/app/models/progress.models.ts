export interface ProgressSummaryDto {
  currentWeight: number;
  startWeight: number;
  goalWeight: number;
  weightChange: number;
  streakDays: number;
  weeklyAdherence: number;
  overallAdherence: number;
  startDate: string;
  checkinsCompleted: number;
  totalCheckins: number;
}

export interface WeightEntryDto {
  date: string;
  weightKg: number;
  heightPercent: number;
  color: string;
}

export interface CheckinDayDto {
  date: string;
  level: number;
}

export interface WeeklyMacrosDto {
  calories: MacroGoalDto;
  protein: MacroGoalDto;
  fat: MacroGoalDto;
  carbs: MacroGoalDto;
}

export interface MacroGoalDto {
  current: number;
  goal: number;
}
