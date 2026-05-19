import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ICart } from '../../../../shared/Models/User/icart';
import { CartService } from '../../../../shared/Services/cart-service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartItemCard } from '../../Components/cart-item-card/cart-item-card';
import { OrderSummary } from '../../Components/order-summary/order-summary';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink, CartItemCard, OrderSummary],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  private cartService = inject(CartService);
  cart$: Observable<ICart> = this.cartService.cart;

  ngOnInit(): void {
    this.cartService.loadCart().subscribe();
  }

  increment(cartItemId: number, currentQty: number, stock: number): void {
    if (currentQty >= stock) return;
    this.cartService.updateQuantity(cartItemId, currentQty + 1).subscribe();
  }

  decrement(cartItemId: number, currentQty: number): void {
    if (currentQty <= 1) return;
    this.cartService.updateQuantity(cartItemId, currentQty - 1).subscribe();
  }

  remove(cartItemId: number): void {
    this.cartService.removeFromCart(cartItemId).subscribe();
  }
}
