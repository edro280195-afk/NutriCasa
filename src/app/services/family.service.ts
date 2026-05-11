import { Injectable, inject, isDevMode } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { FamilyMemberDto, FamilyPostDto, FamilyStatsDto, PostResultDto, ReactionResultDto, CommentResultDto, GroupLeaderboardDto } from '../models/family.models';
import * as signalR from '@microsoft/signalr';

@Injectable({ providedIn: 'root' })
export class FamilyService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly baseUrl = isDevMode()
    ? 'https://localhost:7120'
    : 'https://nutricasa-api.onrender.com';
  private hubConnection: signalR.HubConnection | null = null;

  readonly connected: Observable<boolean>;
  readonly onPostCreated = new Subject<PostResultDto>();
  readonly onReactionToggled = new Subject<{ postId: string; reaction: ReactionResultDto }>();
  readonly onCommentAdded = new Subject<{ postId: string; comment: CommentResultDto }>();

  private _connected = new Subject<boolean>();

  constructor() {
    this.connected = this._connected.asObservable();
  }

  getMembers(): Observable<FamilyMemberDto[]> {
    return this.api.get<FamilyMemberDto[]>('/family/members');
  }

  getFeed(): Observable<FamilyPostDto[]> {
    return this.api.get<FamilyPostDto[]>('/family/feed');
  }

  getStats(): Observable<FamilyStatsDto> {
    return this.api.get<FamilyStatsDto>('/family/stats');
  }

  getLeaderboard(category = 'weight_loss'): Observable<GroupLeaderboardDto> {
    return this.api.get<GroupLeaderboardDto>(`/family/leaderboard?category=${category}`);
  }

  createPost(content: string, postType = 'UserText'): Observable<PostResultDto> {
    return this.api.post<PostResultDto>('/family/posts', { content, postType });
  }

  toggleReaction(postId: string, reactionType = 'Like'): Observable<ReactionResultDto> {
    return this.api.post<ReactionResultDto>(`/family/posts/${postId}/react`, { reactionType });
  }

  addComment(postId: string, content: string): Observable<CommentResultDto> {
    return this.api.post<CommentResultDto>(`/family/posts/${postId}/comments`, { content });
  }

  deletePost(postId: string): Observable<void> {
    return this.api.delete<void>(`/family/posts/${postId}`);
  }

  deleteComment(postId: string, commentId: string): Observable<void> {
    return this.api.delete<void>(`/family/posts/${postId}/comments/${commentId}`);
  }

  async connect(): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) return;

    const token = this.auth.getAccessToken();
    if (!token) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrl}/hubs/group`, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.onreconnecting(() => this._connected.next(false));
    this.hubConnection.onreconnected(() => this._connected.next(true));
    this.hubConnection.onclose(() => this._connected.next(false));

    this.hubConnection.on('PostCreated', (data: PostResultDto) => this.onPostCreated.next(data));
    this.hubConnection.on('ReactionToggled', (data: { postId: string; reaction: ReactionResultDto }) => this.onReactionToggled.next(data));
    this.hubConnection.on('CommentAdded', (data: { postId: string; comment: CommentResultDto }) => this.onCommentAdded.next(data));

    await this.hubConnection.start();
    this._connected.next(true);
  }

  async disconnect(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.hubConnection = null;
      this._connected.next(false);
    }
  }
}
