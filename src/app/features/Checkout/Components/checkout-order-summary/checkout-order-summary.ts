import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ICart } from '../../../../shared/Models/User/icart';
import { RouterLink } from '@angular/router';
import { CommonModule, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-checkout-order-summary',
  imports: [CommonModule, CurrencyPipe, RouterLink],
  templateUrl: './checkout-order-summary.html',
  styleUrl: './checkout-order-summary.css',
})
export class CheckoutOrderSummary {
  @Input() cart!: ICart;
  @Input() promoDiscount = 0;
  @Input() isPlacingOrder = false;
  @Input() canPlaceOrder = false;

  @Output() onPlaceOrder = new EventEmitter<void>();

  get finalTotal(): number {
    return (this.cart?.total ?? 0) - this.promoDiscount;
  }
}
