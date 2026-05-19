import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from "@angular/router";
import { HomeService } from '../../../features/home/Services/home-service';
import { debounceTime, distinctUntilChanged, Observable, Subject } from 'rxjs';
import { WishListService } from '../../Services/wish-list-service';
import { CartService } from '../../Services/cart-service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink,CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  private homeService = inject(HomeService);
  private searchInput$ = new Subject<string>();

  private wishlistService = inject(WishListService);
  private cartService = inject(CartService)
  wishlistCount$: Observable<number> = this.wishlistService.count$;
  cartCount$: Observable<number> = inject(CartService).count$;

  ngOnInit(): void {
    this.wishlistService.loadWishlist().subscribe();
    this.cartService.loadCart().subscribe();
  }

  constructor() {

    this.searchInput$.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(value => this.homeService.search(value));
  }

  onSearch(value: string): void {
    this.searchInput$.next(value);
  }
}
