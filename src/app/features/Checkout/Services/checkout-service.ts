import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { IAddress } from '../../../shared/Models/Checkout/iaddress';
import { IPromoValidation } from '../../../shared/Models/Checkout/ipromo-validation';
import { IPlaceOrderRequest } from '../../../shared/Models/Checkout/iplace-order-request';
import { IPlaceOrderResponse } from '../../../shared/Models/Checkout/i-place-order-response';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getAddresses(): Observable<IAddress[]> {
    return this.http.get<IAddress[]>(`${this.baseUrl}/api/Addresses`);
  }

  addAddress(address: { street: string; city: string; country: string; isDefault: boolean }): Observable<IAddress> {
    return this.http.post<IAddress>(`${this.baseUrl}/api/Addresses`, address);
  }

  validatePromo(code: string, cartTotal: number): Observable<IPromoValidation> {
    return this.http.post<IPromoValidation>(`${this.baseUrl}/api/Orders/validate-promo`, {
      code,
      cartTotal
    });
  }

  placeOrder(request: IPlaceOrderRequest): Observable<IPlaceOrderResponse> {
    return this.http.post<IPlaceOrderResponse>(`${this.baseUrl}/api/Orders`, request);
  }
}
