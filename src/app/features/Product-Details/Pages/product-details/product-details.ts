import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductDetailService } from '../../Services/product-detail-service';
import { Observable } from 'rxjs';
import { IProductDetails } from '../../../../shared/Models/iproduct-details';
import { ProductImage } from "../../Components/product-image/product-image";
import { ProductInfo } from "../../Components/product-info/product-info";
import { ProductTabs } from "../../Components/product-tabs/product-tabs";
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-product-details',
  imports: [ProductImage, ProductInfo, ProductTabs, AsyncPipe],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class ProductDetails implements OnInit {
  product$!: Observable<IProductDetails>;

  constructor(
    private productService: ProductDetailService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.product$ = this.productService.getProductDetails(id);
  }
}
