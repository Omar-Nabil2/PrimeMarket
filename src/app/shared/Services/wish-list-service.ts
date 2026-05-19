import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { catchError, map, tap } from 'rxjs/operators';
import { IWishlistItem } from '../Models/User/iwishlist-item';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { ToastService } from './toast-service';

@Injectable({
  providedIn: 'root',
})
export class WishListService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;
   private toast = inject(ToastService);

  private items$ = new BehaviorSubject<IWishlistItem[]>([]);
  readonly wishlist$ = this.items$.asObservable();
  readonly count$ = this.wishlist$.pipe(map(items => items.length));


  private get authHeaders() {
  const token = localStorage.getItem('token'); // adjust key to whatever your team uses
  return { headers: { Authorization: `Bearer ${token}` } };
}

loadWishlist() {
  return this.http.get<IWishlistItem[]>(`${this.baseUrl}/api/WishList`, this.authHeaders).pipe(
    tap(items => this.items$.next(items))
  );
}

addToWishlist(productId: number) {
    return this.http.post<void>(`${this.baseUrl}/api/WishList/${productId}`, {}, this.authHeaders).pipe(
      tap(() => {
        this.loadWishlist().subscribe();
        this.toast.success('Added to wishlist!');
      }),
      catchError(err => {
        const message = err.error?.Errors?.[1] ?? 'Something went wrong';
        this.toast.error(message);
        return EMPTY;
      })
    );
  }

  removeFromWishlist(productId: number) {
    return this.http.delete<void>(`${this.baseUrl}/api/WishList/${productId}`, this.authHeaders).pipe(
      tap(() => {
        const updated = this.items$.value.filter(i => i.productId !== productId);
        this.items$.next(updated);
        this.toast.success('Removed from wishlist');
      }),
      catchError(err => {
        const message = err.error?.Errors?.[1] ?? 'Something went wrong';
        this.toast.error(message);
        return EMPTY;
      })
    );
  }
}
