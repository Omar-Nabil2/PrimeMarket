import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { IPaginatedResul } from '../Models/Common/ipaginated-result';
import { IRequestFilter } from '../Models/Common/irequest-filter';
import { ISellerOrder, OrderStatus } from '../Models/Orders/iseller-order';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/Orders`;

  getSellerOrders(filter: IRequestFilter): Observable<IPaginatedResul<ISellerOrder>> {
    const params = new HttpParams({ fromObject: { ...filter } as any });
    return this.http.get<IPaginatedResul<ISellerOrder>>(`${this.baseUrl}/seller`, { params });
  }

  getSellerOrderById(orderId: number): Observable<ISellerOrder> {
    return this.http.get<ISellerOrder>(`${this.baseUrl}/seller/${orderId}`);
  }

  updateOrderStatus(orderId: number, status: OrderStatus) {
    return this.http.put<void>(`${this.baseUrl}/seller/${orderId}/status`, { status });
  }
}
