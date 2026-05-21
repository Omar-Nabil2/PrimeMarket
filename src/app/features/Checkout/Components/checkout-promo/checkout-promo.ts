import { CommonModule, CurrencyPipe } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkout-promo',
  imports: [CommonModule, FormsModule, CurrencyPipe],
  templateUrl: './checkout-promo.html',
  styleUrl: './checkout-promo.css',
})
export class CheckoutPromo {
  @Input() isValidating = false;
  @Input() promoApplied = false;
  @Input() promoDiscount = 0;
  @Input() promoError = '';

  @Output() onApply = new EventEmitter<string>();
  @Output() onClear = new EventEmitter<void>();

  promoCode = '';

  apply(): void {
    if (this.promoCode.trim()) this.onApply.emit(this.promoCode.trim());
  }

  clear(): void {
    this.promoCode = '';
    this.onClear.emit();
  }
}
