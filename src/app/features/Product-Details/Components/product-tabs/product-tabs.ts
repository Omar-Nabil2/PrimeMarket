import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { IProductReview } from '../../../../shared/Models/Product/iproduct-review';
import { DatePipe, NgClass } from '@angular/common';
import { ProductDetailService } from '../../Services/product-detail-service';
import { ToastService } from '../../../../shared/Services/toast-service';

type TabType = 'description' | 'reviews';

@Component({
  selector: 'app-product-tabs',
  imports: [NgClass, DatePipe],
  templateUrl: './product-tabs.html',
  styleUrl: './product-tabs.css',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class ProductTabs {
  @Input() description!: string;
  @Input() reviews!: IProductReview[];
  @Input() productId!: number;

  @Output() reviewAdded = new EventEmitter<void>();

  private productService = inject(ProductDetailService);
  private toastService = inject(ToastService);

  activeTab: TabType = 'description';
  selectedRating = signal(0);
  comment = signal('');
  isSubmitting = signal(false);

  setTab(tab: TabType): void {
    this.activeTab = tab;
  }

  setRating(rating: number): void {
    this.selectedRating.set(rating);
  }

  get stars(): number[] {
    return Array(5).fill(0);
  }

  submitReview(): void {
    if (this.selectedRating() === 0) {
      this.toastService.error('Please select a rating.');
      return;
    }

    this.isSubmitting.set(true);
    this.productService.addReview(this.productId, this.selectedRating(), this.comment()).subscribe({
      next: () => {
        this.reviewAdded.emit();  // 👈 triggers parent to re-fetch
        this.toastService.success('Review submitted successfully!');
        this.selectedRating.set(0);
        this.comment.set('');
        this.isSubmitting.set(false);
      },
      error: (err) => {
        this.toastService.handleError(err);
        this.isSubmitting.set(false);
      }
    });
}
}
