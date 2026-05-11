import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, switchMap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ApiService, ApiException } from './api.service';
import {
  LoginRequest, RegisterRequest, TokenResponse, UserProfile,
  ForgotPasswordRequest, ResetPasswordRequest, RefreshTokenRequest,
  VerifyEmailRequest, AuthState
} from '../models/auth.models';

function decodeRoleFromToken(token: string): string {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return 'user';
    const payload = JSON.parse(atob(parts[1]));
    return payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
      || payload['role']
      || 'user';
  } catch {
    return 'user';
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly state = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    accessToken: null,
  });

  readonly isAdmin = computed(() => this.state().user?.role === 'admin');

  constructor() {
    this.restoreSession();
  }

  login(request: LoginRequest): Observable<UserProfile> {
    return this.api.post<TokenResponse>('/auth/login', request).pipe(
      tap(res => this.setSession(res)),
      switchMap(() => this.loadProfile())
    );
  }

  register(request: RegisterRequest): Observable<{ message: string }> {
    return this.api.post<{ message: string }>('/auth/register', request);
  }

  logout(): Observable<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.api.post<void>('/auth/logout', { refreshToken }).pipe(
      tap(() => this.clearSession())
    );
  }

  refreshToken(): Observable<TokenResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      this.clearSession();
      return throwError(() => new Error('No session found'));
    }
    return this.api.post<TokenResponse>('/auth/refresh', { refreshToken } as RefreshTokenRequest).pipe(
      tap(res => {
        this.setSession(res);
        if (res.user) {
          const role = decodeRoleFromToken(res.accessToken);
          const profile: UserProfile = {
            userId: res.user.userId,
            fullName: res.user.fullName,
            email: res.user.email,
            emailVerified: res.user.emailVerified,
            onboardingComplete: res.user.onboardingComplete,
            role,
          };
          this.state.update(s => ({ ...s, user: profile }));
          localStorage.setItem('user', JSON.stringify(profile));
        }
      })
    );
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<void> {
    return this.api.post<void>('/auth/forgot-password', request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<void> {
    return this.api.post<void>('/auth/reset-password', request);
  }

  verifyEmail(request: VerifyEmailRequest): Observable<void> {
    return this.api.post<void>('/auth/verify-email', request);
  }

  loadProfile(): Observable<UserProfile> {
    return this.api.get<UserProfile>('/auth/me').pipe(
      tap(user => {
        const token = localStorage.getItem('accessToken');
        const role = token ? decodeRoleFromToken(token) : 'user';
        const profile = { ...user, role };
        this.state.update(s => ({ ...s, user: profile }));
        localStorage.setItem('user', JSON.stringify(profile));
      })
    );
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }

  private setSession(token: TokenResponse) {
    localStorage.setItem('accessToken', token.accessToken);
    localStorage.setItem('refreshToken', token.refreshToken);
    const role = decodeRoleFromToken(token.accessToken);
    if (token.user) {
      const profile: UserProfile = {
        userId: token.user.userId,
        fullName: token.user.fullName,
        email: token.user.email,
        emailVerified: token.user.emailVerified,
        onboardingComplete: token.user.onboardingComplete,
        role,
      };
      localStorage.setItem('user', JSON.stringify(profile));
      this.state.set({
        isAuthenticated: true,
        user: profile,
        accessToken: token.accessToken,
      });
    } else {
      this.state.set({
        isAuthenticated: true,
        user: this.state().user,
        accessToken: token.accessToken,
      });
    }
  }

  clearSession() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.state.set({ isAuthenticated: false, user: null, accessToken: null });
    this.router.navigate(['/auth/login']);
  }

  private restoreSession() {
    const accessToken = localStorage.getItem('accessToken');
    const userJson = localStorage.getItem('user');
    if (accessToken) {
      const role = decodeRoleFromToken(accessToken);
      let user = userJson ? JSON.parse(userJson) : null;
      if (user) user = { ...user, role };
      this.state.set({ isAuthenticated: true, user, accessToken });
    }
  }
}
