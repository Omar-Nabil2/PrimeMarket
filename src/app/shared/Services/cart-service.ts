import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, catchError, map, tap } from 'rxjs';
import { ICart } from '../Models/User/icart';
import { ToastService } from './toast-service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);
  private baseUrl = `${environment.apiUrl}/api/Cart`;

  private cart$ = new BehaviorSubject<ICart>({ items: [], total: 0, itemCount: 0 });
  readonly cart = this.cart$.asObservable();
  readonly count$ = this.cart$.pipe(map(c => c.itemCount));

  private get authHeaders() {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }

  loadCart() {
    return this.http.get<{ value: ICart }>(`${this.baseUrl}`, this.authHeaders).pipe(
      map(r => r.value),
      tap(cart => this.cart$.next(cart)),
      catchError(err => this.toast.handleError(err))
    );
  }

  addToCart(productId: number, quantity: number = 1) {
    return this.http.post<void>(`${this.baseUrl}/${productId}`, { quantity }, this.authHeaders).pipe(
      tap(() => {
        this.loadCart().subscribe();
        this.toast.success('Added to cart!');
      }),
      catchError(err => this.toast.handleError(err))
    );
  }

  updateQuantity(cartItemId: number, quantity: number) {
    return this.http.put<void>(`${this.baseUrl}/${cartItemId}`, { quantity }, this.authHeaders).pipe(
      tap(() => this.loadCart().subscribe()),
      catchError(err => this.toast.handleError(err))
    );
  }

  removeFromCart(cartItemId: number) {
    return this.http.delete<void>(`${this.baseUrl}/${cartItemId}`, this.authHeaders).pipe(
      tap(() => {
        const current = this.cart$.value;
        const updated: ICart = {
          items: current.items.filter(i => i.id !== cartItemId),
          total: current.items.filter(i => i.id !== cartItemId).reduce((sum, i) => sum + i.subtotal, 0),
          itemCount: current.items.filter(i => i.id !== cartItemId).reduce((sum, i) => sum + i.quantity, 0)
        };
        this.cart$.next(updated);
        this.toast.success('Item removed from cart');
      }),
      catchError(err => this.toast.handleError(err))
    );
  }
}
