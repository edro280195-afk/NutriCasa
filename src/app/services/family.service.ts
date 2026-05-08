import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { FamilyMemberDto, FamilyPostDto, FamilyStatsDto } from '../models/family.models';

@Injectable({ providedIn: 'root' })
export class FamilyService {
  private readonly api = inject(ApiService);

  getMembers(): Observable<FamilyMemberDto[]> {
    return this.api.get<FamilyMemberDto[]>('/family/members');
  }

  getFeed(): Observable<FamilyPostDto[]> {
    return this.api.get<FamilyPostDto[]>('/family/feed');
  }

  getStats(): Observable<FamilyStatsDto> {
    return this.api.get<FamilyStatsDto>('/family/stats');
  }
}
