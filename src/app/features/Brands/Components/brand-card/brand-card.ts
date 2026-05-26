import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { IBrandCard } from '../../../../shared/Models/Brands/ibrand-card';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-brand-card',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './brand-card.html',
  styleUrl: './brand-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandCard {
  brand = input.required<IBrandCard>();
}
