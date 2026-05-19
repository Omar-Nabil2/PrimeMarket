import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { IProcuctCard } from '../../../../shared/Models/iproduct-card';
import { RouterLink } from "@angular/router";
import { WishListService } from '../../../../shared/Services/wish-list-service';

@Component({
  selector: 'app-product-card',
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  @Input() product!: IProcuctCard;
  private wishlistService = inject(WishListService);

  get stars(): number[] {
    return Array(5).fill(0);
  }

  addToWishlist(): void {
    this.wishlistService.addToWishlist(this.product.id).subscribe();
  }
}
