import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IOrderDetails } from '../../shared/Models/iorder-details';
import { CheckoutService } from '../Checkout/Services/checkout-service';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';

@Component({
  selector: 'app-order-confirmation',
  imports: [CommonModule, CurrencyPipe, DatePipe, RouterLink],
  templateUrl: './order-confirmation.html',
  styleUrl: './order-confirmation.css',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class OrderConfirmation implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(CheckoutService)

  order: IOrderDetails | null = null;
  isLoading = true;

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (!orderId) { this.router.navigate(['/']); return; }

    this.orderService.getOrderById(+orderId).subscribe({
      next: order => { 
        this.order = order; 
        this.isLoading = false; 
        this.cdr.markForCheck();
      },
      error: () => { this.router.navigate(['/']); }
    });
  }
}
