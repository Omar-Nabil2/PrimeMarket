import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { IPromoCode, IPromoCodeRequest, IPromoCodeUpdate } from '../Models/Checkout/ipromo-code';

@Injectable({
  providedIn: 'root',
})
export class PromoCodeService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/PromoCode`;

  getAllPromoCodes(): Observable<IPromoCode[]> {
    return this.http.get<IPromoCode[]>(`${this.baseUrl}/All`);
  }

  createPromoCode(request: IPromoCodeRequest): Observable<IPromoCode> {
    return this.http.post<IPromoCode>(this.baseUrl, request);
  }

  updatePromoCode(id: number, request: IPromoCodeUpdate): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, request);
  }

  deletePromoCode(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
