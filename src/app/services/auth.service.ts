import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap, switchMap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ApiService, ApiException } from './api.service';
import {
  LoginRequest, RegisterRequest, TokenResponse, UserProfile,
  ForgotPasswordRequest, ResetPasswordRequest, RefreshTokenRequest,
  VerifyEmailRequest, AuthState
} from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly state = signal<AuthState>({
    isAuthenticated: false,
    user: null,
    accessToken: null,
  });

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
          const profile: UserProfile = {
            userId: res.user.userId,
            fullName: res.user.fullName,
            email: res.user.email,
            emailVerified: res.user.emailVerified,
            onboardingComplete: res.user.onboardingComplete,
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
        this.state.update(s => ({ ...s, user }));
        localStorage.setItem('user', JSON.stringify(user));
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
    if (token.user) {
      const profile: UserProfile = {
        userId: token.user.userId,
        fullName: token.user.fullName,
        email: token.user.email,
        emailVerified: token.user.emailVerified,
        onboardingComplete: token.user.onboardingComplete,
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
      const user = userJson ? JSON.parse(userJson) : null;
      this.state.set({ isAuthenticated: true, user, accessToken });
    }
  }
}
