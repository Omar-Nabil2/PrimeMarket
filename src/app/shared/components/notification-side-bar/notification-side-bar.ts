import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NotificationService } from '../../Services/notification-service';
import { Inotification } from '../../Models/Common/inotification';
import { DatePipe } from '@angular/common';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-notification-side-bar',
  imports: [DatePipe],
  templateUrl: './notification-side-bar.html',
  styleUrl: './notification-side-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationSideBar {
  notificationService = inject(NotificationService);
  authService = inject(AuthService);
  isOpen = signal(false);
  selectedNotification = signal<Inotification | null>(null);

  open() { this.isOpen.set(true); }
  close() { this.isOpen.set(false); }

  openDetail(n: Inotification) {
    this.selectedNotification.set(n);
    if (!n.isRead)
      this.notificationService.markAsRead(n.id).subscribe();
  }

  closeDetail() { this.selectedNotification.set(null); }

  markAllAsRead() {
    this.notificationService.markAllAsRead().subscribe();
  }

  activateSeller(): void {
    this.authService.refreshToken().subscribe({
      next: () => {
        window.location.href = '/seller-dashboard';
      },
      error: () => {
        this.authService.logout();
        window.location.href = '/auth/login';
      }
    });
  }
}