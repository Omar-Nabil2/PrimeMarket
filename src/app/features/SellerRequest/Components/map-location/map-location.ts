import { AfterViewInit, ChangeDetectionStrategy, Component, inject, NgZone, OnDestroy, output, signal, ViewEncapsulation } from '@angular/core';
import * as L from 'leaflet';
import { ILocationData } from '../../../../shared/Models/Brands/ilocation-data';

@Component({
  selector: 'app-map-location',
  imports: [],
  templateUrl: './map-location.html',
  styleUrl: './map-location.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class MapLocation implements AfterViewInit ,OnDestroy{
  private zone = inject(NgZone);
  prev = output<void>();
  locationSelected = output<ILocationData>();

  selectedLocation = signal<ILocationData | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  private map!: L.Map;
  private marker!: L.Marker;

  private readonly defaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      setTimeout(() => this.initMap(), 100);
    });
  }

  ngOnDestroy(): void {
    if (this.map) this.map.remove();
  }

  private initMap(): void {
    L.Marker.prototype.options.icon = this.defaultIcon;

    this.map = L.map('seller-map', {
      center: [30.0444, 31.2357],
      zoom: 10
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(this.map);

    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.zone.run(() => this.onMapClick(e.latlng.lat, e.latlng.lng));
    });

    this.map.invalidateSize();
  }

  useCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.error.set('Geolocation is not supported by your browser.');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        this.map.setView([latitude, longitude], 15);
        this.zone.run(() => this.onMapClick(latitude, longitude));
      },
      () => {
        this.zone.run(() => {
          this.isLoading.set(false);
          this.error.set('Could not get your location. Please click on the map instead.');
        });
      }
    );
  }

  private async onMapClick(lat: number, lng: number): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    if (this.marker) this.map.removeLayer(this.marker);
    this.marker = L.marker([lat, lng], { icon: this.defaultIcon }).addTo(this.map);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();
      const address = data.address;

      const location: ILocationData = {
        latitude: lat,
        longitude: lng,
        street: `${address.road || ''} ${address.house_number || ''}`.trim() || address.suburb || '',
        city: address.city || address.town || address.village || address.county || '',
        country: address.country || ''
      };

      this.selectedLocation.set(location);
    } catch {
      this.error.set('Could not fetch address. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  onSubmit(): void {
    if (this.selectedLocation()) {
      this.locationSelected.emit(this.selectedLocation()!);
    }
  }
}
