import { Component, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './shared/Services/auth.service';
import { NotificationService } from './shared/Services/notification-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('PrimeMarket');

  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  constructor() {
    effect(() => {
      const isAuth = this.authService.authState().isAuthenticated;
      if (isAuth) {
        this.notificationService.connect();
        this.notificationService.loadAll().subscribe();
      } else {
        this.notificationService.disconnect();
      }
    });
  }
}
