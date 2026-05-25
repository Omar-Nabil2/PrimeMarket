import { Component, inject, signal, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../shared/Services/auth.service';

@Component({
  selector: 'app-admin-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './admin-dashboard-layout.html',
  styleUrl: './admin-dashboard-layout.css',
})
export class AdminDashboardLayout {
  private authService = inject(AuthService);
  private router = inject(Router);

  isCollapsed = false;

  adminName = computed(() => {
    const user = this.authService.authState().user;
    return user ? `${user.firstName} ${user.lastName}` : 'Admin';
  });

  private routerEvents = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map((e) => (e as NavigationEnd).urlAfterRedirects)
    )
  );

  get pageTitle(): string {
    const url = this.routerEvents() ?? this.router.url;
    if (url.includes('users')) return 'Users Management';
    if (url.includes('products')) return 'Products Management';
    if (url.includes('orders')) return 'Orders Management';
    if (url.includes('categories')) return 'Categories Management';
    if (url.includes('promo-code')) return 'Promo Codes Management';
    return 'Admin Dashboard';
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
