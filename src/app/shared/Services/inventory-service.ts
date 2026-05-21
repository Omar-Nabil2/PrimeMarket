import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastService } from './toast-service';

export interface IStockSummary {
  productId: number;
  productName: string;
  currentStock: number;
  inStock: boolean;
}

export interface IAdjustStockResponse {
  productId: number;
  productName: string;
  previousStock: number;
  quantityChange: number;
  newStock: number;
}

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private baseUrl = `${environment.apiUrl}/api/Products`;

  getStockSummary(productId: number) {
    return this.http
      .get<IStockSummary>(`${this.baseUrl}/${productId}/inventory`)
      .pipe(
        catchError(err => {
          this.toast.handleError(err);
          return throwError(() => err);
        })
      );
  }

  adjustStock(productId: number, quantityChange: number) {
    return this.http
      .post<IAdjustStockResponse>(
        `${this.baseUrl}/${productId}/inventory/adjust`,
        { quantityChange }
      )
      .pipe(
        catchError(err => {
          this.toast.handleError(err);
          return throwError(() => err);
        })
      );
  }
}