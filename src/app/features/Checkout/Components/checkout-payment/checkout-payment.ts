import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PaymentType } from '../../../../shared/Models/Checkout/iplace-order-request';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-checkout-payment',
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout-payment.html',
  styleUrl: './checkout-payment.css',
})
export class CheckoutPayment {
  @Input() selectedPayment: PaymentType = PaymentType.COD;
  @Output() selectedPaymentChange = new EventEmitter<PaymentType>();

  PaymentType = PaymentType;

  select(value: PaymentType): void {
    this.selectedPaymentChange.emit(value);
  }
}
