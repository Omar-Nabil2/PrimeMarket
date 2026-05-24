import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductDetailService } from '../../Services/product-detail-service';
import { Observable } from 'rxjs';
import { IProductDetails } from '../../../../shared/Models/Product/iproduct-details';
import { ProductImage } from "../../Components/product-image/product-image";
import { ProductInfo } from "../../Components/product-info/product-info";
import { ProductTabs } from "../../Components/product-tabs/product-tabs";
import { AsyncPipe } from '@angular/common';
import { CartService } from '../../../../shared/Services/cart-service';
import { WishListService } from '../../../../shared/Services/wish-list-service';

@Component({
  selector: 'app-product-details',
  imports: [ProductImage, ProductInfo, ProductTabs, AsyncPipe],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class ProductDetails implements OnInit {
  private cartService = inject(CartService);
  private wishlistService = inject(WishListService);
  private productService = inject(ProductDetailService);
  private route = inject(ActivatedRoute);

  product$!: Observable<IProductDetails>;
  productId!: number;

  ngOnInit(): void {
    this.productId = Number(this.route.snapshot.paramMap.get('id'));
    this.product$ = this.productService.getProductDetails(this.productId);
  }

  addToCart(quantity: number): void {
    this.cartService.addToCart(this.productId, quantity).subscribe();
  }

  addToWishlist(): void {
    this.wishlistService.addToWishlist(this.productId).subscribe();
  }
}
