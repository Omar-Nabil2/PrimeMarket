import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { ToastService } from './toast-service';

export interface ICategory {
  id: number;
  name: string;
  slug: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private baseUrl = `${environment.apiUrl}/api/Categories`;

  getAll() {
    return this.http
      .get<ICategory[]>(this.baseUrl)
      .pipe(catchError(err => this.toast.handleError(err)));
  }
}