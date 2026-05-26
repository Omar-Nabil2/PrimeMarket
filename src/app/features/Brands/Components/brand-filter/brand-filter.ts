import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-brand-filter',
  imports: [],
  templateUrl: './brand-filter.html',
  styleUrl: './brand-filter.css',
})
export class BrandFilter {
  searchChange = output<string>();
  verifiedChange = output<boolean | null>();
  cities = input<string[]>([]);
  cityChange = output<string | null>();

  onSearch(value: string) {
    this.searchChange.emit(value);
  }

  onVerifiedChange(value: string) {
    this.verifiedChange.emit(value === '' ? null : value === 'true');
  }

  onCityChange(value: string) {
    this.cityChange.emit(value || null);
  }
}
