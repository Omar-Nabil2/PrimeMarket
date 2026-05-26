import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { IBrandService } from '../../../../shared/Services/ibrand-service';
import { IBrandCard } from '../../../../shared/Models/Brands/ibrand-card';
import { BrandCard } from '../../Components/brand-card/brand-card';
import { BrandFilter } from "../../Components/brand-filter/brand-filter";

@Component({
  selector: 'app-brand-list',
  imports: [BrandCard,  BrandFilter],
  templateUrl: './brand-list.html',
  styleUrl: './brand-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandList {
  private brandService = inject(IBrandService);

  brands = signal<IBrandCard[]>([]);
  searchTerm = signal('');
  selectedCity = signal<string | null>(null);
  verifiedOnly = signal<boolean | null>(null);
  isLoading = signal(false);

  cities = computed(() => [...new Set(this.brands().map(b => b.city))]);

  filteredBrands = computed(() => {
    return this.brands()
      .filter(b => !this.searchTerm() || b.brandName.toLowerCase().includes(this.searchTerm().toLowerCase()))
      .filter(b => !this.selectedCity() || b.city === this.selectedCity())
      .filter(b => this.verifiedOnly() === null || b.isVerified === this.verifiedOnly());
  });

  ngOnInit(): void {
    this.isLoading.set(true);
    this.brandService.getAll().subscribe({
      next: (data) => this.brands.set(data),
      complete: () => this.isLoading.set(false)
    });
  }
}
