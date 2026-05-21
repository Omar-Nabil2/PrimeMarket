import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IAddress } from '../../../../shared/Models/Checkout/iaddress';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentType } from '../../../../shared/Models/Checkout/iplace-order-request';

@Component({
  selector: 'app-checkout-address',
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout-address.html',
  styleUrl: './checkout-address.css',
})
export class CheckoutAddress {
  @Input() addresses: IAddress[] = [];
  @Input() selectedAddressId: number | null = null;
  @Input() isAddingAddress = false;

  @Output() selectedAddressIdChange = new EventEmitter<number>();
  @Output() onAddAddress = new EventEmitter<{ street: string; city: string; country: string; isDefault: boolean }>();

  showNewAddressForm = false;
  newAddress = { street: '', city: '', country: '', isDefault: false };

 selectAddress(id: number): void {
  this.selectedAddressIdChange.emit(id);
  this.showNewAddressForm = false; // close form on selection
}

  submitAddress(): void {
    const { street, city, country } = this.newAddress;
    if (!street || !city || !country) return;
    this.onAddAddress.emit({ ...this.newAddress });
  }

  resetForm(): void {
    this.newAddress = { street: '', city: '', country: '', isDefault: false };
    this.showNewAddressForm = false;
  }
}
