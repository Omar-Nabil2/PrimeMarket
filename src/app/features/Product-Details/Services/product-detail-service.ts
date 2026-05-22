import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { IProductDetails } from '../../../shared/Models/Product/iproduct-details';

@Injectable({
  providedIn: 'root',
})
export class ProductDetailService {
  private BaseUrl = environment.apiUrl
  constructor(private httpClinet:HttpClient){}

  getProductDetails(id:number): Observable<IProductDetails> {
    return this.httpClinet.get<IProductDetails>(`${this.BaseUrl}/api/Products/details/${id}`);
  }

}
