import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IBrandCard } from '../Models/Brands/ibrand-card';
import { Observable } from 'rxjs';
import { IBrandDetails } from '../Models/Brands/ibrand-details';
import { IBecomeSelerRequest } from '../Models/Brands/ibecome-seler-request';
import { ISellerRequest } from '../Models/Brands/iseller-request';
import { ISellerRequestDetails } from '../Models/Brands/iseller-request-details';

@Injectable({
  providedIn: 'root',
})
export class IBrandService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/Brands`;

  getAll(): Observable<IBrandCard[]> {
    return this.http.get<IBrandCard[]>(this.apiUrl);
  }

  getById(id: number): Observable<IBrandDetails> {
    return this.http.get<IBrandDetails>(`${this.apiUrl}/${id}`);
  }
  register(request: IBecomeSelerRequest): Observable<void> {
    const formData = new FormData();
    formData.append('BrandName', request.brandName);
    if (request.description) formData.append('Description', request.description);
    formData.append('Logo', request.logo);
    formData.append('Street', request.street);
    formData.append('City', request.city);
    formData.append('Country', request.country);
    if (request.latitude) formData.append('Latitude', request.latitude.toString());
    if (request.longitude) formData.append('Longitude', request.longitude.toString());

    return this.http.post<void>(`${this.apiUrl}/register`, formData);
  }
  getStatus(): Observable<void> {
    return this.http.get<void>(`${this.apiUrl}/status`);
  }

  getSellerRequests(): Observable<ISellerRequest[]> {
    return this.http.get<ISellerRequest[]>(`${this.apiUrl}/seller-requests`);
  }

  approveSeller(brandId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${brandId}/approve`, {});
  }

  rejectSeller(brandId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${brandId}/reject`);
  }
  getSellerRequestDetails(brandId: number): Observable<ISellerRequestDetails> {
    return this.http.get<ISellerRequestDetails>(`${this.apiUrl}/${brandId}/details`);
  }
}
