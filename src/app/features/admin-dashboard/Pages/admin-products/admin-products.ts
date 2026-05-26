import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, NgClass, CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { ProductService } from '../../../../shared/Services/product-service';
import { ToastService } from '../../../../shared/Services/toast-service';
import { IRequestFilter } from '../../../../shared/Models/Common/irequest-filter';
import { IPaginatedResul } from '../../../../shared/Models/Common/ipaginated-result';
import { IAdminProduct } from '../../../../shared/Models/Product/iadmin-product';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    NgClass,
    FormsModule,
    DatePipe,
    RouterLink,
  ],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProducts implements OnInit {
  private productService = inject(ProductService);
  private toast = inject(ToastService);

  private adminFilter$ = new BehaviorSubject<IRequestFilter>({
    pageNumber: 1,
    pageSize: 10,
    sortDirection: 'ASC',
  });

  result$: Observable<IPaginatedResul<IAdminProduct>> = this.adminFilter$.pipe(
    switchMap(filter => this.productService.getAdminProducts(filter))
  );

  private adminLoading$ = new BehaviorSubject<boolean>(false);
  loading$ = this.adminLoading$.asObservable();

  currentFilter$ = this.adminFilter$.asObservable();

  searchTerm: string = '';
  deletingId: number | null = null;
  confirmDeleteData: IAdminProduct | null = null;

  ngOnInit(): void {}

  onSearch(): void {
    this.adminFilter$.next({
      ...this.adminFilter$.value,
      searchValue: this.searchTerm,
      pageNumber: 1,
    });
  }

  onSort(column: string): void {
    const current = this.adminFilter$.value;
    const sameColumn = current.sortColumn === column;
    this.adminFilter$.next({
      ...current,
      sortColumn: column,
      sortDirection: sameColumn && current.sortDirection === 'ASC' ? 'DESC' : 'ASC',
      pageNumber: 1,
    });
  }

  onPageChange(page: number): void {
    this.adminFilter$.next({
      ...this.adminFilter$.value,
      pageNumber: page,
    });
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.adminFilter$.next({
      pageNumber: 1,
      pageSize: 10,
      sortDirection: 'ASC',
    });
  }

  openDeleteModal(product: IAdminProduct): void {
    this.confirmDeleteData = product;
  }

  cancelDelete(): void {
    this.confirmDeleteData = null;
  }

  executeDelete(): void {
    const product = this.confirmDeleteData;
    if (!product) return;

    this.confirmDeleteData = null;
    this.deletingId = product.id;

    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.deletingId = null;
        this.toast.success(`Product "${product.name}" deleted successfully`);
        // Refresh admin products list by updating filter
        this.adminFilter$.next({ ...this.adminFilter$.value });
      },
      error: (err) => {
        this.deletingId = null;
        this.toast.handleError(err).subscribe();
      },
    });
  }
}
