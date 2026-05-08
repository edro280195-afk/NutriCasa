export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  groupCode?: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: UserSummaryDto;
}

export interface UserSummaryDto {
  userId: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  onboardingComplete: boolean;
}

export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface VerifyEmailRequest {
  userId: string;
  token: string;
}

export interface UserProfile {
  userId: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  onboardingComplete: boolean;
  profilePhotoUrl?: string;
  gender?: string;
  birthDate?: string;
  heightCm?: number;
  lastLoginAt?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  accessToken: string | null;
}
