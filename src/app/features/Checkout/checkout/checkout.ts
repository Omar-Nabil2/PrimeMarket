import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
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
import { StripeService } from '../../../shared/Services/stripe-service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, CheckoutAddress, CheckoutPayment, CheckoutPromo, CheckoutOrderSummary],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Checkout implements OnInit {
  private checkoutService = inject(CheckoutService);
  private cartService = inject(CartService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private stripeService = inject(StripeService)
  private cdr = inject(ChangeDetectorRef);

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
      this.cdr.markForCheck(); // ← change this
    });
    // mount immediately so element is ready
    setTimeout(async () => {
      await this.stripeService.mountCardElement();
    }, 100);
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
      } else {
        this.promoError = result.errorMessage ?? 'Invalid promo code.';
      }
      this.cdr.markForCheck(); // ← add
    },
    error: () => {
      this.isValidatingPromo = false;
      this.promoError = 'Failed to validate promo code.';
      this.cdr.markForCheck(); // ← add
    }
  });
}

  onClearPromo(): void {
    this.promoCode = '';
    this.promoDiscount = 0;
    this.promoApplied = false;
    this.promoError = '';
  }
    
  get canPlaceOrder(): boolean {
    return !!this.selectedAddressId && !!this.cart?.items.length;
  }

  onPaymentChange(payment: PaymentType): void {
    this.selectedPayment = payment;
  }

  async placeOrder(): Promise<void> {
  if (!this.selectedAddressId || !this.cart?.items.length) return;
  this.isPlacingOrder = true;

  try {
    const response = await firstValueFrom(this.checkoutService.placeOrder({
      addressId: this.selectedAddressId,
      paymentMethod: this.selectedPayment,
      promoCode: this.promoApplied ? this.promoCode : null
    }));

    if (response.clientSecret) {
      const { error } = await this.stripeService.confirmPayment(response.clientSecret);
      if (error) {
        this.toast.error(error);
      } else {
        this.toast.success('Payment successful!');
        this.cartService.clearCart();
        this.router.navigate(['/order-confirmation', response.orderId]);
      }
      this.isPlacingOrder = false; // ← moved here, always resets
    } else {
      this.toast.success('Order placed successfully!');
      this.cartService.clearCart();
      this.router.navigate(['/order-confirmation', response.orderId]);
    }
  } catch {
    this.toast.error('Failed to place order.');
  } finally {
    this.isPlacingOrder = false;
  }
}
}
