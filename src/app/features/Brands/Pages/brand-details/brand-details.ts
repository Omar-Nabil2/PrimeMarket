import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { IBrandService } from '../../../../shared/Services/ibrand-service';
import { ActivatedRoute } from '@angular/router';
import { IBrandDetails } from '../../../../shared/Models/Brands/ibrand-details';
import { BrandHero } from '../../Components/brand-hero/brand-hero';
import { BrandLocation } from '../../Components/brand-location/brand-location';
import { BrandProducts } from "../../Components/brand-products/brand-products";

@Component({
  selector: 'app-brand-details',
  imports: [BrandHero, BrandLocation, BrandLocation, BrandProducts],
  templateUrl: './brand-details.html',
  styleUrl: './brand-details.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandDetails {
  private brandService = inject(IBrandService);
  private route = inject(ActivatedRoute);

  brand = signal<IBrandDetails | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.isLoading.set(true);
    this.brandService.getById(id).subscribe({
      next: (data) => this.brand.set(data),
      error: () => this.error.set('Brand not found.'),
      complete: () => this.isLoading.set(false)
    });
  }
}
