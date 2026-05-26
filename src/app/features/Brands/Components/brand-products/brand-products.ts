import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IBrandProduct } from '../../../../shared/Models/Brands/ibrand-product';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-brand-products',
  imports: [RouterLink, DecimalPipe ],
  templateUrl: './brand-products.html',
  styleUrl: './brand-products.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandProducts {
  products = input.required<IBrandProduct[]>();
}
