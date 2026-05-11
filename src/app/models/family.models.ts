export interface FamilyMemberDto {
  userId: string;
  fullName: string;
  role: string;
  joinedAt: string;
}

export interface FamilyPostDto {
  postId: string;
  authorUserId?: string;
  authorName: string;
  postType: string;
  content: string;
  createdAt: string;
  reactions: PostReactionDto[];
  comments: PostCommentDto[];
  commentCount: number;
}

export interface PostReactionDto {
  type: string;
  count: number;
  hasCurrentUserReacted: boolean;
  users: string[];
}

export interface PostCommentDto {
  commentId: string;
  userId: string;
  authorName: string;
  content: string;
  createdAt: string;
  isOwner: boolean;
}

export interface FamilyStatsDto {
  totalMembers: number;
  activeToday: number;
  dailyStreak: number;
  adherencePercent: number;
  groupName: string;
  daysActive: number;
}

export interface PostResultDto {
  postId: string;
  authorName: string;
  postType: string;
  content: string;
  createdAt: string;
}

export interface ReactionResultDto {
  hasReacted: boolean;
  reactionType: string;
  count: number;
}

export interface CommentResultDto {
  commentId: string;
  userId: string;
  authorName: string;
  content: string;
  createdAt: string;
}
