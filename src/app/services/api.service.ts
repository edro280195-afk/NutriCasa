import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export class ApiException {
  constructor(
    public readonly status: number,
    public readonly error: ApiError
  ) {}
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = 'https://localhost:7120/api';

  constructor(private http: HttpClient) {}

  get<T>(path: string, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${path}`, { params }).pipe(
      catchError(err => this.handleError(err))
    );
  }

  post<T>(path: string, body?: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${path}`, body).pipe(
      catchError(err => this.handleError(err))
    );
  }

  put<T>(path: string, body?: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${path}`, body).pipe(
      catchError(err => this.handleError(err))
    );
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${path}`).pipe(
      catchError(err => this.handleError(err))
    );
  }

  private handleError(err: HttpErrorResponse) {
    const apiError: ApiError = err.error?.code
      ? err.error
      : { code: 'UNKNOWN', message: err.message || 'Error de conexión' };
    return throwError(() => new ApiException(err.status, apiError));
  }
}
