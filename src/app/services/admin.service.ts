import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  AdminDashboardDto, AdminUserDto, AdminPostDto, UpdateUserRoleRequest
} from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly api = inject(ApiService);

  getDashboard(): Observable<AdminDashboardDto> {
    return this.api.get<AdminDashboardDto>('/admin/dashboard');
  }

  getUsers(search?: string, role?: string): Observable<AdminUserDto[]> {
    let params = new URLSearchParams();
    if (search) params.set('search', search);
    if (role) params.set('role', role);
    const qs = params.toString();
    return this.api.get<AdminUserDto[]>(`/admin/users${qs ? '?' + qs : ''}`);
  }

  updateUserRole(userId: string, role: string): Observable<void> {
    return this.api.patch<void>(`/admin/users/${userId}/role`, { role } as UpdateUserRoleRequest);
  }

  getPosts(): Observable<AdminPostDto[]> {
    return this.api.get<AdminPostDto[]>('/admin/posts');
  }

  deletePost(postId: string): Observable<void> {
    return this.api.delete<void>(`/admin/posts/${postId}`);
  }
}
