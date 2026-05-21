import { Component, inject, OnInit } from '@angular/core';
import { CheckoutService } from '../Services/checkout-service';
import { CartService } from '../../../shared/Services/cart-service';
import { ToastService } from '../../../shared/Services/toast-service';
import { Router } from '@angular/router';
import { ICart } from '../../../shared/Models/User/icart';
import { IAddress } from '../../../shared/Models/Checkout/iaddress';
import { PaymentType } from '../../../shared/Models/Checkout/iplace-order-request';
import { CommonModule } from '@angular/common';
import { CheckoutAddress } from '../Components/checkout-address/checkout-address';
import { CheckoutPayment } from '../Components/checkout-payment/checkout-payment';
import { CheckoutPromo } from '../Components/checkout-promo/checkout-promo';
import { CheckoutOrderSummary } from '../Components/checkout-order-summary/checkout-order-summary';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, CheckoutAddress, CheckoutPayment, CheckoutPromo, CheckoutOrderSummary],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  private checkoutService = inject(CheckoutService);
  private cartService = inject(CartService);
  private toast = inject(ToastService);
  private router = inject(Router);
  PaymentType = PaymentType;

  cart: ICart | null = null;
  addresses: IAddress[] = [];
  selectedAddressId: number | null = null;
  selectedPayment: PaymentType = PaymentType.COD;

  promoDiscount = 0;
  promoError = '';
  promoApplied = false;
  promoCode = '';

  isPlacingOrder = false;
  isValidatingPromo = false;
  isAddingAddress = false;

  ngOnInit(): void {
    this.cartService.cart.subscribe(cart => this.cart = cart);
    this.checkoutService.getAddresses().subscribe(addresses => {
      this.addresses = addresses;
      const def = addresses.find(a => a.isDefault) ?? addresses[0];
      if (def) this.selectedAddressId = def.id;
    });
  }

  onAddAddress(data: { street: string; city: string; country: string; isDefault: boolean }): void {
    this.isAddingAddress = true;
    this.checkoutService.addAddress(data).subscribe({
      next: address => {
        this.addresses = [...this.addresses, address];
        this.selectedAddressId = address.id;
        this.isAddingAddress = false;
        this.toast.success('Address added!');
      },
      error: () => {
        this.isAddingAddress = false;
        this.toast.error('Failed to add address.');
      }
    });
  }

  onApplyPromo(code: string): void {
    if (!this.cart) return;
    this.isValidatingPromo = true;
    this.promoError = '';
    this.checkoutService.validatePromo(code, this.cart.total).subscribe({
      next: result => {
        this.isValidatingPromo = false;
        if (result.isValid) {
          this.promoCode = code;
          this.promoDiscount = result.discountAmount;
          this.promoApplied = true;
          this.toast.success('Promo code applied!');
        } else {
          this.promoError = result.errorMessage ?? 'Invalid promo code.';
        }
      },
      error: () => {
        this.isValidatingPromo = false;
        this.promoError = 'Failed to validate promo code.';
      }
    });
  }

  onClearPromo(): void {
    this.promoCode = '';
    this.promoDiscount = 0;
    this.promoApplied = false;
    this.promoError = '';
  }

  placeOrder(): void {
    if (!this.selectedAddressId || !this.cart?.items.length) return;
    this.isPlacingOrder = true;
    this.checkoutService.placeOrder({
      addressId: this.selectedAddressId,
      paymentMethod: this.selectedPayment,
      promoCode: this.promoApplied ? this.promoCode : null
    }).subscribe({
      next: response => {
        this.isPlacingOrder = false;
        this.toast.success('Order placed successfully!');
        this.router.navigate(['/order-confirmation', response.orderId]);
      },
      error: () => {
        this.isPlacingOrder = false;
        this.toast.error('Failed to place order.');
      }
    });
  }

  get canPlaceOrder(): boolean {
    return !!this.selectedAddressId && !!this.cart?.items.length;
  }
}
