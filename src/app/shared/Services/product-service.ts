import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, catchError, Observable, shareReplay, switchMap, tap } from 'rxjs';
import { IRequestFilter } from '../Models/Common/irequest-filter';
import { IPaginatedResul } from '../Models/Common/ipaginated-result';
import { ISellerProduct } from '../Models/Product/iseller-product';
import { ToastService } from './toast-service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private baseUrl = `${environment.apiUrl}/api/Products`;

  private filter$ = new BehaviorSubject<IRequestFilter>({
    pageNumber: 1,
    pageSize: 10,
    sortDirection: 'ASC',
  });

  readonly filter = this.filter$.asObservable();

  readonly result$: Observable<IPaginatedResul<ISellerProduct>> =
    this.filter$.pipe(
      switchMap(filter => this.getSellerProducts(filter)),
    );

  private items$ = new BehaviorSubject<IPaginatedResul<ISellerProduct> | null>(null);
  readonly products = this.items$.asObservable();

  private loading$ = new BehaviorSubject<boolean>(false);
  readonly loading = this.loading$.asObservable();

  private getSellerProducts(filter: IRequestFilter): Observable<IPaginatedResul<ISellerProduct>> {
    const params = new HttpParams({ fromObject: { ...filter } as any });
    return this.http
      .get<IPaginatedResul<ISellerProduct>>(`${this.baseUrl}/seller`, { params })
      .pipe(catchError(err => this.toast.handleError(err)));
  }

  search(value: string): void {
    this.filter$.next({ ...this.filter$.value, searchValue: value, pageNumber: 1 });
  }

  setPage(page: number): void {
    this.filter$.next({ ...this.filter$.value, pageNumber: page });
  }

  sort(column: string): void {
    const current = this.filter$.value;
    const sameColumn = current.sortColumn === column;
    this.filter$.next({
      ...current,
      sortColumn: column,
      sortDirection: sameColumn && current.sortDirection === 'ASC' ? 'DESC' : 'ASC',
      pageNumber: 1,
    });
  }

  resetFilter(): void {
    this.filter$.next({ pageNumber: 1, pageSize: 10, sortDirection: 'ASC' });
  }

  loadSellerProducts(filter: IRequestFilter) {
    this.loading$.next(true);
    const params = new HttpParams({ fromObject: { ...filter } as any });
    return this.http
      .get<IPaginatedResul<ISellerProduct>>(`${this.baseUrl}/seller`, { params })
      .pipe(
        tap(result => { this.items$.next(result); this.loading$.next(false); }),
        catchError(err => { this.loading$.next(false); return this.toast.handleError(err); })
      );
  }

  getProductsSnapshot(): ISellerProduct[] {
    return this.items$.value?.items ?? [];
  }

  deleteProduct(productId: number) {
    return this.http.delete<void>(`${this.baseUrl}/${productId}`).pipe(
      tap(() => {this.filter$.next({ ...this.filter$.value }); }),
      catchError(err => this.toast.handleError(err))
    );
  }

  createProduct(formData: FormData) {
    return this.http.post<void>(this.baseUrl, formData).pipe(
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
    return this.http.get<any>(`${this.baseUrl}/${productId}`)
      .pipe(catchError(err => this.toast.handleError(err)));
  }

  addImage(productId: number, image: File, options?: { silent?: boolean }) {
    const formData = new FormData();
    formData.append('image', image);
    return this.http.post<any>(`${this.baseUrl}/${productId}/images`, formData).pipe(
      catchError(err => this.toast.handleError(err))
    );
  }

  deleteImage(productId: number, imageId: number, options?: { silent?: boolean }) {
    return this.http.delete<void>(`${this.baseUrl}/${productId}/images/${imageId}`);
  }

  setPrimaryImage(productId: number, imageId: number, options?: { silent?: boolean }) {
    return this.http.put<void>(`${this.baseUrl}/${productId}/images/${imageId}/set-primary`, {}).pipe(
      catchError(err => this.toast.handleError(err))
    );
  }
}