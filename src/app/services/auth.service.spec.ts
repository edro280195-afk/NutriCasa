import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';
import type { LoginRequest, RegisterRequest, TokenResponse, UserProfile } from '../models/auth.models';

function createApi() {
  return { post: vi.fn(), get: vi.fn(), put: vi.fn(), delete: vi.fn() } as unknown as ApiService;
}

function createRouter() {
  return { navigate: vi.fn() } as unknown as Router;
}

describe('AuthService', () => {
  let service: AuthService;
  let api: ReturnType<typeof createApi>;
  let router: ReturnType<typeof createRouter>;

  const mockToken: TokenResponse = {
    accessToken: 'test-access',
    refreshToken: 'test-refresh',
    expiresIn: 900,
    user: { userId: 'u1', fullName: 'Test User', email: 'test@test.com', emailVerified: true, onboardingComplete: false, role: 'member' },
  };

  const mockProfile: UserProfile = {
    userId: 'u1', fullName: 'Test User', email: 'test@test.com',
    emailVerified: true, onboardingComplete: false, role: 'member',
  };

  beforeEach(() => {
    api = createApi();
    router = createRouter();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiService, useValue: api },
        { provide: Router, useValue: router },
      ],
    });

    localStorage.clear();
    service = TestBed.inject(AuthService);
  });

  it('is created', () => {
    expect(service).toBeTruthy();
    expect(service.state().isAuthenticated).toBe(false);
  });

  it('restores session from localStorage', () => {
    localStorage.setItem('accessToken', 'saved-token');
    localStorage.setItem('user', JSON.stringify(mockProfile));

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiService, useValue: createApi() },
        { provide: Router, useValue: createRouter() },
      ],
    });

    const freshService = TestBed.inject(AuthService);

    expect(freshService.state().isAuthenticated).toBe(true);
    expect(freshService.state().user?.fullName).toBe('Test User');
    expect(freshService.state().accessToken).toBe('saved-token');
  });

  it('login sets session and loads profile', () => new Promise<void>((done) => {
    const req: LoginRequest = { email: 'test@test.com', password: 'pass123' };
    api.post = vi.fn().mockReturnValueOnce(of(mockToken));
    api.get = vi.fn().mockReturnValueOnce(of(mockProfile));

    service.login(req).subscribe({
      next: (profile) => {
        expect(profile.fullName).toBe('Test User');
        expect(localStorage.getItem('accessToken')).toBe('test-access');
        expect(localStorage.getItem('refreshToken')).toBe('test-refresh');
        expect(service.state().isAuthenticated).toBe(true);
        expect(api.post).toHaveBeenCalledWith('/auth/login', req);
        expect(api.get).toHaveBeenCalledWith('/auth/me');
        done();
      },
    });
  }));

  it('register sets session and loads profile', () => new Promise<void>((done) => {
    const req: RegisterRequest = { email: 'test@test.com', password: 'pass123456', fullName: 'Test User', birthDate: '1990-01-01' };
    api.post = vi.fn().mockReturnValueOnce(of(mockToken));
    api.get = vi.fn().mockReturnValueOnce(of(mockProfile));

    service.register(req).subscribe((profile) => {
      expect(profile.fullName).toBe('Test User');
      expect(localStorage.getItem('accessToken')).toBe('test-access');
      expect(api.post).toHaveBeenCalledWith('/auth/register', req);
      expect(api.get).toHaveBeenCalledWith('/auth/me');
      done();
    });
  }));

  it('logout clears session and calls api', () => new Promise<void>((done) => {
    localStorage.setItem('accessToken', 'tok');
    localStorage.setItem('refreshToken', 'ref');
    localStorage.setItem('user', JSON.stringify(mockProfile));
    service.state.set({ isAuthenticated: true, user: mockProfile, accessToken: 'tok' });

    api.post = vi.fn().mockReturnValueOnce(of(void 0));

    service.logout().subscribe(() => {
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(service.state().isAuthenticated).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
      done();
    });
  }));

  it('refreshToken restores session', () => new Promise<void>((done) => {
    localStorage.setItem('refreshToken', 'old-refresh');
    api.post = vi.fn().mockReturnValueOnce(of(mockToken));

    service.refreshToken().subscribe(() => {
      expect(localStorage.getItem('accessToken')).toBe('test-access');
      expect(service.state().isAuthenticated).toBe(true);
      done();
    });
  }));

  it('refreshToken clears session when no refresh token', () => new Promise<void>((done) => {
    service.refreshToken().subscribe({
      error: (err: Error) => {
        expect(err.message).toContain('No session');
        expect(service.state().isAuthenticated).toBe(false);
        done();
      },
    });
  }));

  it('loadProfile updates state', () => new Promise<void>((done) => {
    api.get = vi.fn().mockReturnValueOnce(of(mockProfile));

    service.loadProfile().subscribe((user) => {
      expect(user.fullName).toBe('Test User');
      expect(service.state().user?.email).toBe('test@test.com');
      done();
    });
  }));

  it('forgotPassword calls api', () => {
    api.post = vi.fn().mockReturnValueOnce(of(void 0));
    service.forgotPassword({ email: 'test@test.com' }).subscribe();
    expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'test@test.com' });
  });

  it('getAccessToken returns token from storage', () => {
    localStorage.setItem('accessToken', 'my-token');
    expect(service.getAccessToken()).toBe('my-token');
  });

  it('isAuthenticated checks storage', () => {
    expect(service.isAuthenticated()).toBe(false);
    localStorage.setItem('accessToken', 'x');
    expect(service.isAuthenticated()).toBe(true);
  });
});
