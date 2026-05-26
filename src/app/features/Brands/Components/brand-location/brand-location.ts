import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { IBrandDetails } from '../../../../shared/Models/Brands/ibrand-details';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-brand-location',
  imports: [],
  templateUrl: './brand-location.html',
  styleUrl: './brand-location.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandLocation {
  private sanitizer = inject(DomSanitizer);
  brand = input.required<IBrandDetails>();

  getMapUrl(): SafeResourceUrl {
    let url: string;
    if (this.brand().latitude && this.brand().longitude) {
      url = `https://www.openstreetmap.org/export/embed.html?bbox=${this.brand().longitude! - 0.01},${this.brand().latitude! - 0.01},${this.brand().longitude! + 0.01},${this.brand().latitude! + 0.01}&layer=mapnik&marker=${this.brand().latitude},${this.brand().longitude}`;
    } else {
      url = `https://www.openstreetmap.org/export/embed.html?query=${encodeURIComponent(this.brand().city + ', ' + this.brand().country)}`;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
