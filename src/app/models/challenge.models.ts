export interface ChallengeDto {
  challengeId: string;
  title: string;
  description: string | null;
  goalType: string;
  goalDescription: string | null;
  rewardDescription: string | null;
  startDate: string;
  endDate: string;
  participantCount: number;
  hasJoined: boolean;
  createdBy: string;
  myCurrentScore: number;
}

export interface ChallengeCreatedDto {
  challengeId: string;
  title: string;
}

export interface ChallengeLeaderboardDto {
  challengeId: string;
  title: string;
  goalType: string;
  entries: ChallengeLeaderboardEntry[];
}

export interface ChallengeLeaderboardEntry {
  rank: number;
  userId: string;
  fullName: string;
  currentValueDisplay: string;
  score: number;
  isCurrentUser: boolean;
}

export interface CreateChallengeRequest {
  title: string;
  description: string | null;
  goalType: string;
  goalDescription: string | null;
  rewardDescription: string | null;
  startDate: string;
  endDate: string;
}

export const GOAL_TYPE_LABELS: Record<string, string> = {
  MostWeightLoss: 'Mayor pérdida de peso',
  MostFatLoss: 'Mayor pérdida de grasa',
  BestStreak: 'Mejor racha de check-ins',
  HighestAdherence: 'Mayor adherencia',
  MostCheckIns: 'Más check-ins',
  Custom: 'Personalizado',
};

export const GOAL_TYPE_DESCRIPTIONS: Record<string, string> = {
  MostWeightLoss: 'Gana quien pierda más kg (porcentaje del inicial)',
  MostFatLoss: 'Gana quien pierda más peso corporal',
  BestStreak: 'Gana quien tenga la racha más larga de check-ins',
  HighestAdherence: 'Gana quien tenga el mayor % de días check-in',
  MostCheckIns: 'Gana quien haga más check-ins totales',
  Custom: 'Tú defines las reglas',
};
