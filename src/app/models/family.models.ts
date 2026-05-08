export interface FamilyMemberDto {
  userId: string;
  fullName: string;
  role: string;
  joinedAt: string;
}

export interface FamilyPostDto {
  postId: string;
  authorName: string;
  postType: string;
  content: string;
  createdAt: string;
}

export interface FamilyStatsDto {
  totalMembers: number;
  activeToday: number;
  dailyStreak: number;
  adherencePercent: number;
  groupName: string;
  daysActive: number;
}
