import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import type { MedicalProfileDto, UpdateMedicalProfileRequest, PreferencesDto, UpdatePreferencesRequest } from '../models/profile.models';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly api = inject(ApiService);

  getMedicalProfile(): Observable<MedicalProfileDto> {
    return this.api.get<MedicalProfileDto>('/medical-profile');
  }

  updateMedicalProfile(request: UpdateMedicalProfileRequest): Observable<void> {
    return this.api.put<void>('/medical-profile', request);
  }

  getPreferences(): Observable<PreferencesDto> {
    return this.api.get<PreferencesDto>('/preferences');
  }

  updatePreferences(request: UpdatePreferencesRequest): Observable<void> {
    return this.api.put<void>('/preferences', request);
  }
}
