import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ICartItem } from '../../../../shared/Models/User/icart-item';

@Component({
  selector: 'app-cart-item-card',
  imports: [CommonModule],
  templateUrl: './cart-item-card.html',
  styleUrl: './cart-item-card.css',
})
export class CartItemCard {
  @Input() item!: ICartItem;

  @Output() onIncrement = new EventEmitter<void>();
  @Output() onDecrement = new EventEmitter<void>();
  @Output() onRemove = new EventEmitter<void>();
}
