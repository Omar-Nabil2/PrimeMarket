import { CommonModule, CurrencyPipe, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
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
