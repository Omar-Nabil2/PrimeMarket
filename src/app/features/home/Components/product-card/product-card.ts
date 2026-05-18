import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IProcuctCard } from '../../../../shared/Models/iprocuct-card';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-product-card',
  imports: [CommonModule, RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  @Input() product!:IProcuctCard;

  get stars(): number[] {
    return Array(5).fill(0);
  }
}
