import { CommonModule, CurrencyPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { IProductDetails } from '../../../../shared/Models/iproduct-details';

@Component({
  selector: 'app-product-info',
  imports: [NgClass, CurrencyPipe],
  templateUrl: './product-info.html',
  styleUrl: './product-info.css',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class ProductInfo {
  @Input() product!: IProductDetails;
  @Output() onAddToCart = new EventEmitter<number>(); // emits quantity
  @Output() onAddToWishlist = new EventEmitter<void>();

  quantity = 1;

  get stars(): number[] {
    return Array(5).fill(0);
  }

  increment(): void {
    if (this.quantity < this.product.stock)
      this.quantity++;
  }

  decrement(): void {
    if (this.quantity > 1)
      this.quantity--;
  }
}
