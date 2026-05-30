import { computed, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { INotificationSummary } from '../Models/Common/inotification-summary';
import { tap } from 'rxjs';
import { Inotification } from '../Models/Common/inotification';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly apiUrl = `${environment.apiUrl}/api/notification`;
  private hub!: HubConnection;

  notifications = signal<Inotification[]>([]);
  unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);

  constructor(private http: HttpClient, private authService: AuthService) {}

  connect(): void {
    const token = this.authService.getToken();
    if (!token) return;

    this.hub = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/hubs/notifications`, {
        accessTokenFactory: () => this.authService.getToken()!
      })
      .withAutomaticReconnect()
      .build();

    this.hub.on('ReceiveNotification', (notification: Inotification) => {
      this.notifications.update(list => [notification, ...list]);
    });

    this.hub.start()
      .then(() => console.log('SignalR connected'))
      .catch(err => console.error('SignalR error:', err));
  }

  disconnect(): void {
    if (this.hub?.state === HubConnectionState.Connected)
      this.hub.stop();
  }

  loadAll() {
    return this.http.get<INotificationSummary>(this.apiUrl).pipe(
      tap(res => this.notifications.set(res.notifications))
    );
  }

  markAsRead(id: number) {
    return this.http.patch(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => this.notifications.update(list =>
        list.map(n => n.id === id ? { ...n, isRead: true } : n)
      ))
    );
  }

  markAllAsRead() {
    return this.http.patch(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => this.notifications.update(list =>
        list.map(n => ({ ...n, isRead: true }))
      ))
    );
  }
}
