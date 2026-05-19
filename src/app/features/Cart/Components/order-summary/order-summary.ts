import { Component, Input } from '@angular/core';
import { ICart } from '../../../../shared/Models/User/icart';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-order-summary',
  imports: [CurrencyPipe],
  templateUrl: './order-summary.html',
  styleUrl: './order-summary.css',
})
export class OrderSummary {
  @Input() cart!: ICart;
}
