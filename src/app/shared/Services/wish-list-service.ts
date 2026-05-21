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
  private wishlistUrl= `${environment.apiUrl}/api/WishList`
  
  private toast = inject(ToastService);

  private items$ = new BehaviorSubject<IWishlistItem[]>([]);
  readonly wishlist$ = this.items$.asObservable();
  readonly count$ = this.wishlist$.pipe(map(items => items.length));

  loadWishlist() {
    return this.http.get<IWishlistItem[]>(`${this.wishlistUrl}`).pipe(
      tap(items => this.items$.next(items ?? [])),
      catchError(err => this.toast.handleError(err))
    );
  }

addToWishlist(productId: number) {
  return this.http.post<void>(`${this.wishlistUrl}/${productId}`, {}).pipe(
    tap(() => {
      this.loadWishlist().subscribe();
      this.toast.success('Added to wishlist!');
    }),
    catchError(err => this.toast.handleError(err))
  );
}

removeFromWishlist(productId: number) {
  return this.http.delete<void>(`${this.wishlistUrl}/${productId}`).pipe(
    tap(() => {
      const updated = this.items$.value.filter(i => i.productId !== productId);
      this.items$.next(updated);
      this.toast.success('Removed from wishlist');
    }),
    catchError(err => this.toast.handleError(err))
  );
}
}
