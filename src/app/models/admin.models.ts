export interface AdminDashboardDto {
  totalUsers: number;
  activeSubscriptions: number;
  postsToday: number;
  newUsersToday: number;
  totalRecipes: number;
  pendingVerifications: number;
  recentPosts?: RecentPostDto[];
}

export interface RecentPostDto {
  postId: string;
  content: string;
  authorName: string;
  createdAt: string;
}

export interface AdminUserDto {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  emailVerified: boolean;
  onboardingComplete: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AdminPostDto {
  postId: string;
  content: string;
  authorName: string;
  groupName: string;
  reactionCount: number;
  createdAt: string;
}

export interface UpdateUserRoleRequest {
  role: string;
}
