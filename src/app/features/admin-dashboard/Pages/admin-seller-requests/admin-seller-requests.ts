import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { IBrandService } from '../../../../shared/Services/ibrand-service';
import { ToastService } from '../../../../shared/Services/toast-service';
import { ISellerRequest } from '../../../../shared/Models/Brands/iseller-request';
import { ISellerRequestDetails } from '../../../../shared/Models/Brands/iseller-request-details';
import * as L from 'leaflet';

@Component({
  selector: 'app-admin-seller-requests',
  standalone: true,
  imports: [
    CommonModule,
    AsyncPipe,
    FormsModule,
  ],
  templateUrl: './admin-seller-requests.html',
  styleUrl: './admin-seller-requests.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSellerRequests implements OnInit ,OnDestroy{
  private brandService = inject(IBrandService);
  private toast = inject(ToastService);

  private loadingSubject$ = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject$.asObservable();

  private requestsSubject$ = new BehaviorSubject<ISellerRequest[]>([]);
  requests$ = this.requestsSubject$.asObservable();

  processingIds$ = new BehaviorSubject<Set<number>>(new Set());
  confirmAction: { type: 'approve' | 'reject'; request: ISellerRequest } | null = null;

  // Details modal state
  detailsLoading$ = new BehaviorSubject<boolean>(false);
  selectedDetails$ = new BehaviorSubject<ISellerRequestDetails | null>(null);
  private map: L.Map | null = null;

  ngOnInit(): void {
    this.loadSellerRequests();
  }

  ngOnDestroy(): void {
    this.destroyMap();
  }

  private loadSellerRequests(): void {
    this.loadingSubject$.next(true);
    this.brandService.getSellerRequests().subscribe({
      next: (requests) => {
        this.requestsSubject$.next(requests);
        this.loadingSubject$.next(false);
      },
      error: (err) => {
        this.loadingSubject$.next(false);
        this.toast.handleError(err).subscribe();
      },
    });
  }

  openDetailsModal(brandId: number): void {
    this.selectedDetails$.next(null);
    this.detailsLoading$.next(true);
    this.brandService.getSellerRequestDetails(brandId).subscribe({
      next: (details) => {
        this.selectedDetails$.next(details);
        this.detailsLoading$.next(false);
        // Init map after view renders
        setTimeout(() => {
            this.initMap(details);
            setTimeout(() => this.map?.invalidateSize(), 150);
          }, 200);
      },
      error: (err) => {
        this.detailsLoading$.next(false);
        this.toast.handleError(err).subscribe();
      },
    });
  }

  closeDetailsModal(): void {
    this.destroyMap();
    this.selectedDetails$.next(null);
  }

  private initMap(details: ISellerRequestDetails): void {
    this.destroyMap();
    const lat = details.latitude ?? 30.0444;
    const lng = details.longitude ?? 31.2357;

    // Fix Leaflet marker icons broken by webpack
    const iconDefault = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    this.map = L.map('seller-map').setView([lat, lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    L.marker([lat, lng], { icon: iconDefault })
      .addTo(this.map)
      .bindPopup(`<b>${details.brandName}</b><br>${details.street}, ${details.city}`)
      .openPopup();
  }

  private destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  openConfirmModal(type: 'approve' | 'reject', request: ISellerRequest): void {
    this.confirmAction = { type, request };
  }

  cancelAction(): void {
    this.confirmAction = null;
  }
  
  getGoogleMapsUrl(details: ISellerRequestDetails): string {
    if (details.latitude && details.longitude)
      return `https://www.google.com/maps?q=${details.latitude},${details.longitude}`;
    return `https://www.google.com/maps/search/${encodeURIComponent(
      `${details.street}, ${details.city}, ${details.country}`
    )}`;
  }

  executeAction(): void {
    if (!this.confirmAction) return;

    const { type, request } = this.confirmAction;
    const processingSet = new Set(this.processingIds$.value);
    processingSet.add(request.brandId);
    this.processingIds$.next(processingSet);
    this.confirmAction = null;

    const action$ =
      type === 'approve'
        ? this.brandService.approveSeller(request.brandId)
        : this.brandService.rejectSeller(request.brandId);

    action$.subscribe({
      next: () => {
        const updated = new Set(this.processingIds$.value);
        updated.delete(request.brandId);
        this.processingIds$.next(updated);
        this.requestsSubject$.next(
          this.requestsSubject$.value.filter((r) => r.brandId !== request.brandId)
        );
        this.toast.success(
          `Request ${type === 'approve' ? 'approved' : 'rejected'} successfully`
        );
      },
      error: (err) => {
        const updated = new Set(this.processingIds$.value);
        updated.delete(request.brandId);
        this.processingIds$.next(updated);
        this.toast.handleError(err).subscribe();
      },
    });
  }
}
