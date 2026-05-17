import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private BaseUrl = environment.apiUrl
  constructor(private httpClinet:HttpClient){}

  getProducts(): Observable<any[]> {
    return this.httpClinet.get<any[]>(`${this.BaseUrl}/api/Products`);
  }

}
