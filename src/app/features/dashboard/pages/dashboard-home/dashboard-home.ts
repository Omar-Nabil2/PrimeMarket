import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe, DecimalPipe } from '@angular/common';
import { map } from 'rxjs/operators';
import { StatsCard } from '../../components/stats-card/stats-card';
import { DashboardService } from '../../../../shared/Services/dashboard-service';

@Component({
  selector: 'app-dashboard-home',
  imports: [RouterLink, AsyncPipe, StatsCard, DecimalPipe],
  templateUrl: './dashboard-home.html',
  styleUrl: './dashboard-home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardHome implements OnInit {
  private dashboardService = inject(DashboardService);

  products$ = this.dashboardService.products;
  loading$ = this.dashboardService.loading;

  totalProducts$ = this.products$.pipe(map(p => p?.items.length ?? 0));
  inStock$ = this.products$.pipe(
    map(p => p?.items.filter(i => i.stock > 0).length ?? 0)
  );
  outOfStock$ = this.products$.pipe(
    map(p => p?.items.filter(i => i.stock === 0).length ?? 0)
  );
  avgRating$ = this.products$.pipe(
    map(p => {
      const items = p?.items ?? [];
      if (!items.length) return '0.0';
      const avg = items.reduce((sum, i) => sum + i.averageRating, 0) / items.length;
      return avg.toFixed(1);
    })
  );

  ngOnInit(): void {
    this.dashboardService.loadSellerProducts({ pageNumber: 1, pageSize: 100 }).subscribe();
  }
}