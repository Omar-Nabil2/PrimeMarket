import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { IBrandCard } from '../Models/Brands/ibrand-card';
import { Observable } from 'rxjs';
import { IBrandDetails } from '../Models/Brands/ibrand-details';

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
}
