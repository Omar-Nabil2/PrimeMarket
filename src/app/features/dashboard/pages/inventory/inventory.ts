import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
  computed,
  effect
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe, NgClass } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventoryService, IStockSummary } from '../../../../shared/Services/inventory-service';
import { ISellerProduct } from '../../../../shared/Models/Product/iseller-product';
import { DashboardService } from '../../../../shared/Services/dashboard-service';
import { toSignal } from '@angular/core/rxjs-interop';
import { IRequestFilter } from '../../../../shared/Models/Common/irequest-filter';

interface ProductWithStock extends ISellerProduct {
  stockSummary?: IStockSummary;
  isAdjusting?: boolean;
}

@Component({
  selector: 'app-inventory',
  imports: [RouterLink, NgClass, ReactiveFormsModule, DecimalPipe],
  templateUrl: './inventory.html',
  styleUrl: './inventory.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Inventory implements OnInit {
  private dashboardService = inject(DashboardService);
  private inventoryService = inject(InventoryService);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  apiResult = toSignal(this.dashboardService.result$);
  private currentFilterSignal = toSignal(this.dashboardService.filter);

  products = signal<ProductWithStock[]>([]);
  isLoading = signal<boolean>(true);
  expandedProductId = signal<number | null>(null);
  isSortDropdownOpen = signal<boolean>(false);
  
  adjustForms: Record<number, FormGroup> = {};
  preselectedId: number | null = null;

  currentFilter = computed<IRequestFilter>(() => {
    return this.currentFilterSignal() || { pageNumber: 1, pageSize: 10, sortDirection: 'ASC' };
  });

  sortLabel = computed<string>(() => {
    const filter = this.currentFilter();
    if (!filter.sortColumn) return 'Sort By';
    return filter.sortColumn.charAt(0).toUpperCase() + filter.sortColumn.slice(1);
  });

  constructor() {
    effect(() => {
      this.isLoading.set(true);
      const res = this.apiResult();
      if (res) {
        const mappedProducts = res.items.map(p => ({ ...p }));
        this.products.set(mappedProducts);

        mappedProducts.forEach(p => {
          if (!this.adjustForms[p.id]) {
            this.adjustForms[p.id] = this.fb.group({
              quantityChange: [null, [Validators.required]],
            });
          }
        });

        if (this.preselectedId) {
          this.toggleExpand(this.preselectedId);
          this.preselectedId = null;
        }
        this.isLoading.set(false);
      }
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('productId');
    if (idParam) {
      this.preselectedId = Number(idParam);
    }
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.dashboardService.search(value);
  }

  toggleSortDropdown(): void {
    this.isSortDropdownOpen.update(v => !v);
  }

  onSort(column: string): void {
    this.dashboardService.sort(column);
    this.isSortDropdownOpen.set(false);
  }

  onPageChange(page: number): void {
    const res = this.apiResult();
    if (res && page >= 1 && page <= (res.totalPages || 1)) {
      this.dashboardService.setPage(page);
    }
  }

  toggleExpand(productId: number): void {
    if (this.expandedProductId() === productId) {
      this.expandedProductId.set(null);
      return;
    }
    this.expandedProductId.set(productId);

    const product = this.products().find(p => p.id === productId);
    if (product && !product.stockSummary) {
      this.inventoryService.getStockSummary(productId).subscribe(summary => {
        if (summary) {
          this.products.update(allProducts => 
            allProducts.map(p => p.id === productId ? { ...p, stockSummary: summary } : p)
          );
        }
      });
    }
  }

  onAdjust(product: ProductWithStock): void {
    const form = this.adjustForms[product.id];
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }

    const quantityChange = Number(form.get('quantityChange')!.value);
    
    this.products.update(allProducts =>
      allProducts.map(p => p.id === product.id ? { ...p, isAdjusting: true } : p)
    );

    this.inventoryService.adjustStock(product.id, quantityChange).subscribe({
      next: result => {
        if (result) {
          this.products.update(allProducts =>
            allProducts.map(p => p.id === product.id ? {
              ...p,
              stock: result.newStock,
              isAdjusting: false,
              stockSummary: {
                productId: result.productId,
                productName: result.productName,
                currentStock: result.newStock,
                inStock: result.newStock > 0,
              }
            } : p)
          );
          form.reset();
        }
      },
      error: () => {
        this.products.update(allProducts =>
          allProducts.map(p => p.id === product.id ? { ...p, isAdjusting: false } : p)
        );
      },
    });
  }

  getStockStatus(stock: number): 'good' | 'low' | 'out' {
    if (stock === 0) return 'out';
    if (stock <= 5) return 'low';
    return 'good';
  }
}