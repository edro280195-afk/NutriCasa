import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  ChallengeDto,
  ChallengeCreatedDto,
  ChallengeLeaderboardDto,
  CreateChallengeRequest,
} from '../models/challenge.models';

@Injectable({ providedIn: 'root' })
export class ChallengeService {
  private readonly api = inject(ApiService);

  getActive(): Observable<ChallengeDto[]> {
    return this.api.get<ChallengeDto[]>('/challenge/active');
  }

  getMine(): Observable<ChallengeDto[]> {
    return this.api.get<ChallengeDto[]>('/challenge/mine');
  }

  getLeaderboard(challengeId: string): Observable<ChallengeLeaderboardDto> {
    return this.api.get<ChallengeLeaderboardDto>(`/challenge/${challengeId}/leaderboard`);
  }

  create(request: CreateChallengeRequest): Observable<ChallengeCreatedDto> {
    return this.api.post<ChallengeCreatedDto>('/challenge', request);
  }

  join(challengeId: string): Observable<void> {
    return this.api.post<void>(`/challenge/${challengeId}/join`, {});
  }

  leave(challengeId: string): Observable<void> {
    return this.api.post<void>(`/challenge/${challengeId}/leave`, {});
  }
}
