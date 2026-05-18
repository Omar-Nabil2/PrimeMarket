import { AsyncPipe, CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ProductInfo } from '../product-info/product-info';
import { ProductTabs } from '../product-tabs/product-tabs';

@Component({
  selector: 'app-product-image',
  imports: [CommonModule],
  templateUrl: './product-image.html',
  styleUrl: './product-image.css',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class ProductImage {
  @Input() images: string[] = [];
  @Input() primaryImageUrl!: string;

  selectedImage!: string;

  ngOnInit(): void {
    this.selectedImage = this.primaryImageUrl ?? this.images[0];
  }

  selectImage(url: string): void {
    this.selectedImage = url;
  }
}
