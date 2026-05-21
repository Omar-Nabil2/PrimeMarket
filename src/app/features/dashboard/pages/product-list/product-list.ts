import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe, DecimalPipe, NgClass } from '@angular/common';
import { DashboardService } from '../../../../shared/Services/dashboard-service';
import { ISellerProduct } from '../../../../shared/Models/iseller-product';


@Component({
  selector: 'app-product-list',
  imports: [RouterLink, AsyncPipe, DecimalPipe, NgClass],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductList implements OnInit {
  private dashboardService = inject(DashboardService);

  products$ = this.dashboardService.products;
  loading$ = this.dashboardService.loading;

  deletingId: number | null = null;

  ngOnInit(): void {
    this.dashboardService.loadSellerProducts({ pageNumber: 1, pageSize: 20 }).subscribe();
  }

  onDelete(product: ISellerProduct): void {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;

    this.deletingId = product.id;
    this.dashboardService.deleteProduct(product.id).subscribe({
      next: () => (this.deletingId = null),
      error: () => (this.deletingId = null),
    });
  }

  onPageChange(page: number): void {
    this.dashboardService.loadSellerProducts({ pageNumber: page, pageSize: 20 }).subscribe();
  }
}