import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { BehaviorSubject, Observable, switchMap } from 'rxjs';
import { IProcuctCard } from '../../../shared/Models/iproduct-card';
import { IRequestFilter } from '../../../shared/Models/Common/irequest-filter';
import { IPaginatedResul } from '../../../shared/Models/Common/ipaginated-result';

@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private baseUrl = environment.apiUrl;

  private filter$ = new BehaviorSubject<IRequestFilter>({
    pageNumber: 1,
    pageSize: 10,
    sortDirection: 'ASC'
  });

  readonly filter = this.filter$.asObservable();

  readonly result$: Observable<IPaginatedResul<IProcuctCard>> = this.filter$.pipe(
    switchMap(filter => this.getProducts(filter))
  );

  constructor(private http: HttpClient) {}

  private getProducts(filter: IRequestFilter): Observable<IPaginatedResul<IProcuctCard>> {
    const params = new HttpParams({ fromObject: { ...filter } as any });
    return this.http.get<IPaginatedResul<IProcuctCard>>(
      `${this.baseUrl}/api/Products/all`, { params }
    );
  }

  search(value: string): void {
    this.filter$.next({ ...this.filter$.value, searchValue: value, pageNumber: 1 });
  }

  setPage(page: number): void {
    this.filter$.next({ ...this.filter$.value, pageNumber: page });
  }

  sort(column: string): void {
    const current = this.filter$.value;
    const sameColumn = current.sortColumn === column;
    this.filter$.next({
      ...current,
      sortColumn: column,
      sortDirection: sameColumn && current.sortDirection === 'ASC' ? 'DESC' : 'ASC',
      pageNumber: 1
    });
  }

}
