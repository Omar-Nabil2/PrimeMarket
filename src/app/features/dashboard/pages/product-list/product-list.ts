import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe, DecimalPipe, NgClass } from '@angular/common';
import { DashboardService } from '../../../../shared/Services/dashboard-service';
import { ISellerProduct } from '../../../../shared/Models/Product/iseller-product';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-list',
  imports: [RouterLink, AsyncPipe, DecimalPipe, NgClass, FormsModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductList implements OnInit {
  private dashboardService = inject(DashboardService);

  result$ = this.dashboardService.result$;
  loading$ = this.dashboardService.loading;
  currentFilter$ = this.dashboardService.filter;

  searchTerm: string = '';
  deletingId: number | null = null;

  ngOnInit(): void {}

  onSearch(): void {
    this.dashboardService.search(this.searchTerm);
  }

  onSort(column: string): void {
    this.dashboardService.sort(column);
  }

  onPageChange(page: number): void {
    this.dashboardService.setPage(page);
  }

  onDelete(product: ISellerProduct): void {
    if (!confirm(`Delete "${product.name}"?`)) return;

    this.deletingId = product.id;
    this.dashboardService.deleteProduct(product.id).subscribe({
      next: () => (this.deletingId = null),
      error: () => (this.deletingId = null),
    });
  }
}