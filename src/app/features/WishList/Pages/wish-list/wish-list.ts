import { Component, inject } from '@angular/core';
import { IWishlistItem } from '../../../../shared/Models/User/iwishlist-item';
import { Observable } from 'rxjs';
import { WishListService } from '../../../../shared/Services/wish-list-service';
import { AsyncPipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-wish-list',
  imports: [AsyncPipe,DecimalPipe],
  templateUrl: './wish-list.html',
  styleUrl: './wish-list.css',
})
export class WishList {
  private wishlistService = inject(WishListService);

  wishlist$: Observable<IWishlistItem[]> = this.wishlistService.wishlist$;

  ngOnInit(): void {
    this.wishlistService.loadWishlist().subscribe();
  }

  remove(productId: number): void {
    console.log(productId)
    this.wishlistService.removeFromWishlist(productId).subscribe();
  }

  addToCart(productId: number): void {
    // TODO: implement when cart is ready
  }
}
