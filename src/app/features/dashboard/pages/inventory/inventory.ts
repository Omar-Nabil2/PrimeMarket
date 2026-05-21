import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe, DecimalPipe, NgClass } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InventoryService, IStockSummary } from '../../../../shared/Services/inventory-service';
import { ISellerProduct } from '../../../../shared/Models/iseller-product';
import { DashboardService } from '../../../../shared/Services/dashboard-service';


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
  private cdr = inject(ChangeDetectorRef);

  products: ProductWithStock[] = [];
  isLoading = true;

  expandedProductId: number | null = null;

  adjustForms: Record<number, FormGroup> = {};

  preselectedId: number | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('productId');
    if (idParam) {
      this.preselectedId = Number(idParam);
    }

    this.loadProducts();
  }

  private loadProducts(): void {
    this.dashboardService
      .loadSellerProducts({ pageNumber: 1, pageSize: 100 })
      .subscribe(() => {
        this.products = this.dashboardService.getProductsSnapshot().map(p => ({ ...p }));

        this.products.forEach(p => {
          this.adjustForms[p.id] = this.fb.group({
            quantityChange: [null, [Validators.required]],
          });
        });

        if (this.preselectedId) {
          this.toggleExpand(this.preselectedId);
        }

        this.isLoading = false;
        this.cdr.markForCheck();
      });
  }

  toggleExpand(productId: number): void {
    if (this.expandedProductId === productId) {
      this.expandedProductId = null;
      return;
    }
    this.expandedProductId = productId;

    const product = this.products.find(p => p.id === productId);
    if (product && !product.stockSummary) {
      this.inventoryService.getStockSummary(productId).subscribe(summary => {
        if (product && summary) {
          product.stockSummary = summary;
          this.cdr.markForCheck();
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
    product.isAdjusting = true;
    this.cdr.markForCheck();

    this.inventoryService.adjustStock(product.id, quantityChange).subscribe({
      next: result => {
        if (result) {
          product.stock = result.newStock;
          product.stockSummary = {
            productId: result.productId,
            productName: result.productName,
            currentStock: result.newStock,
            inStock: result.newStock > 0,
          };
          form.reset();
        }
        product.isAdjusting = false;
        this.cdr.markForCheck();
      },
      error: () => {
        product.isAdjusting = false;
        this.cdr.markForCheck();
      },
    });
  }

  getStockStatus(stock: number): 'good' | 'low' | 'out' {
    if (stock === 0) return 'out';
    if (stock <= 5) return 'low';
    return 'good';
  }
}