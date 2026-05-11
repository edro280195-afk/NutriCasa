import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ApiService } from './api.service';
import { ProgressSummaryDto, WeightEntryDto, CheckinDayDto, WeeklyMacrosDto, ProgressPhotoDto, UploadPhotoResultDto } from '../models/progress.models';

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);

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

  getPhotos(): Observable<ProgressPhotoDto[]> {
    return this.api.get<ProgressPhotoDto[]>('/progress/photos');
  }

  uploadPhoto(file: File, takenAt: string, angle?: string, visibility?: string): Observable<UploadPhotoResultDto> {
    const formData = new FormData();
    formData.append('File', file);
    formData.append('TakenAt', takenAt);
    if (angle) formData.append('Angle', angle);
    if (visibility) formData.append('Visibility', visibility);
    return this.api.post<UploadPhotoResultDto>('/progress/photos', formData);
  }

  deletePhoto(photoId: string): Observable<void> {
    return this.api.delete<void>(`/progress/photos/${photoId}`);
  }

  updatePhotoVisibility(photoId: string, visibility: string): Observable<void> {
    return this.api.patch<void>(`/progress/photos/${photoId}/visibility`, { visibility });
  }
}
