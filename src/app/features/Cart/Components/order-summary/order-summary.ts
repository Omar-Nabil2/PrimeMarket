import { Component, Input } from '@angular/core';
import { ICart } from '../../../../shared/Models/User/icart';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-order-summary',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './order-summary.html',
  styleUrl: './order-summary.css',
})
export class OrderSummary {
  @Input() cart!: ICart;
}
