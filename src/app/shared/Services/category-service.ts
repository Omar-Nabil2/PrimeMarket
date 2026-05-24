import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable, shareReplay } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from './toast-service';
import { ICategory } from '../Models/Category/icategory';
import { IProcuctCard } from '../Models/Product/iproduct-card';


@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient); 
  private baseUrl = environment.apiUrl;
  private toast = inject(ToastService);

  getAll() {
    return this.http
      .get<ICategory[]>(`${this.baseUrl}/api/Categories`)
      .pipe(catchError(err => this.toast.handleError(err)));
  }


  private categories$: Observable<ICategory[]> | null = null;

  getCategories(): Observable<ICategory[]> {
    if (!this.categories$) {
      this.categories$ = this.http
        .get<ICategory[]>(`${this.baseUrl}/api/Categories`)
        .pipe(shareReplay(1));
    }
    return this.categories$;
  }

  getProductsByCategoryId(categoryId: number): Observable<IProcuctCard[]> {
    return this.http.get<IProcuctCard[]>(
      `${this.baseUrl}/api/Products/category/${categoryId}`
    );
  }
}
