import { Component, inject, signal, computed } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../shared/Services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-layout.html',
  styleUrl: './dashboard-layout.css',
})
export class DashboardLayout {
  private authService = inject(AuthService);
  private router = inject(Router);

  isCollapsed = false;

  sellerName = computed(() => {
    const user = this.authService.authState().user;
    return user ? `${user.firstName} ${user.lastName}` : 'Seller';
  });

  private routerEvents = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map((e) => (e as NavigationEnd).urlAfterRedirects)
    )
  );

  get pageTitle(): string {
    const url = this.routerEvents() ?? this.router.url;
    if (url.includes('products/create')) return 'Add New Product';
    if (url.includes('products/edit')) return 'Edit Product';
    if (url.includes('products')) return 'My Products';
    if (url.includes('inventory')) return 'Inventory';
    return 'Dashboard Overview';
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}