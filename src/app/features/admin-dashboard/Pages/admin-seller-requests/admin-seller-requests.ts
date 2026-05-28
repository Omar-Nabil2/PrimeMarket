import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { IBrandService } from '../../../../shared/Services/ibrand-service';
import { ToastService } from '../../../../shared/Services/toast-service';
import { ISellerRequest } from '../../../../shared/Models/Brands/iseller-request';

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
export class AdminSellerRequests implements OnInit {
  private brandService = inject(IBrandService);
  private toast = inject(ToastService);

  private loadingSubject$ = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject$.asObservable();

  private requestsSubject$ = new BehaviorSubject<ISellerRequest[]>([]);
  requests$ = this.requestsSubject$.asObservable();

  private processingId: number | null = null;
  processingIds$ = new BehaviorSubject<Set<number>>(new Set());

  confirmAction: { type: 'approve' | 'reject'; request: ISellerRequest } | null = null;

  ngOnInit(): void {
    this.loadSellerRequests();
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

  openConfirmModal(type: 'approve' | 'reject', request: ISellerRequest): void {
    this.confirmAction = { type, request };
  }

  cancelAction(): void {
    this.confirmAction = null;
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
        const processingSet = new Set(this.processingIds$.value);
        processingSet.delete(request.brandId);
        this.processingIds$.next(processingSet);

        const updatedRequests = this.requestsSubject$.value.filter(
          (r) => r.brandId !== request.brandId
        );
        this.requestsSubject$.next(updatedRequests);

        this.toast.success(
          `Request ${type === 'approve' ? 'approved' : 'rejected'} successfully`
        );
      },
      error: (err) => {
        const processingSet = new Set(this.processingIds$.value);
        processingSet.delete(request.brandId);
        this.processingIds$.next(processingSet);
        this.toast.handleError(err).subscribe();
      },
    });
  }
}
