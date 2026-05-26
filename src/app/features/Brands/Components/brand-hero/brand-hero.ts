import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IBrandDetails } from '../../../../shared/Models/Brands/ibrand-details';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-brand-hero',
  imports: [DecimalPipe],
  templateUrl: './brand-hero.html',
  styleUrl: './brand-hero.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandHero {
  brand = input.required<IBrandDetails>();
}
