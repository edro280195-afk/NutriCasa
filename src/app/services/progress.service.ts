import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { ProgressSummaryDto, WeightEntryDto, CheckinDayDto, WeeklyMacrosDto } from '../models/progress.models';

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly api = inject(ApiService);

  getSummary(): Observable<ProgressSummaryDto> {
    return this.api.get<ProgressSummaryDto>('/progress/summary');
  }

  getWeightHistory(): Observable<WeightEntryDto[]> {
    return this.api.get<WeightEntryDto[]>('/progress/weight-history');
  }

  getCheckins(): Observable<CheckinDayDto[]> {
    return this.api.get<CheckinDayDto[]>('/progress/checkins');
  }

  getWeeklyMacros(): Observable<WeeklyMacrosDto> {
    return this.api.get<WeeklyMacrosDto>('/progress/macros/weekly');
  }
}
