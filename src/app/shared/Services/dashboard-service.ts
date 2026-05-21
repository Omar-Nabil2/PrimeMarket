import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, catchError, tap } from 'rxjs';
import { ToastService } from './toast-service';
import { IPaginatedResul } from '../Models/Common/ipaginated-result';
import { IRequestFilter } from '../Models/Common/irequest-filter';
import { ISellerProduct } from '../Models/iseller-product';


@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private baseUrl = `${environment.apiUrl}/api/Products`;

  private products$ = new BehaviorSubject<IPaginatedResul<ISellerProduct> | null>(null);
  readonly products = this.products$.asObservable();

  private loading$ = new BehaviorSubject<boolean>(false);
  readonly loading = this.loading$.asObservable();

  loadSellerProducts(filter: IRequestFilter = { pageNumber: 1, pageSize: 10 }) {
    this.loading$.next(true);
    const params = new HttpParams({ fromObject: { ...filter } as any });

    return this.http
      .get<IPaginatedResul<ISellerProduct>>(`${this.baseUrl}/seller`, { params })
      .pipe(
        tap(result => {
          this.products$.next(result);
          this.loading$.next(false);
        }),
        catchError(err => {
          this.loading$.next(false);
          return this.toast.handleError(err);
        })
      );
  }

  deleteProduct(productId: number) {
    return this.http.delete<void>(`${this.baseUrl}/${productId}`).pipe(
      tap(() => {
        const current = this.products$.value;
        if (current) {
          const updatedItems = current.items.filter(p => p.id !== productId);
          this.products$.next({ ...current, items: updatedItems });
        }
        this.toast.success('Product deleted successfully');
      }),
      catchError(err => this.toast.handleError(err))
    );
  }

  createProduct(formData: FormData) {
    return this.http.post<void>(`${this.baseUrl}`, formData).pipe(
      tap(() => this.toast.success('Product created successfully')),
      catchError(err => this.toast.handleError(err))
    );
  }

  updateProduct(productId: number, body: object) {
    return this.http.put<void>(`${this.baseUrl}/${productId}`, body).pipe(
      tap(() => this.toast.success('Product updated successfully')),
      catchError(err => this.toast.handleError(err))
    );
  }

  getProductById(productId: number) {
    return this.http
      .get<any>(`${this.baseUrl}/${productId}`)
      .pipe(catchError(err => this.toast.handleError(err)));
  }

  getProductsSnapshot(): ISellerProduct[] {
    return this.products$.value?.items ?? [];
  }
}