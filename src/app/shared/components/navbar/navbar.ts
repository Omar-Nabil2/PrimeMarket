import { CommonModule } from '@angular/common';
import { Component, inject, OnInit,  effect } from '@angular/core';
import { RouterLink,  Router } from "@angular/router";
import { HomeService } from '../../../features/home/Services/home-service';
import { debounceTime, distinctUntilChanged, Observable, startWith, Subject } from 'rxjs';
import { WishListService } from '../../Services/wish-list-service';
import { CartService } from '../../Services/cart-service';
import { AuthService } from '../../Services/auth.service';
import { AuthResponse } from '../../Models/auth.model';
import { CategoryService } from '../../Services/category-service';
import { ICategory } from '../../Models/Category/icategory';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  private homeService = inject(HomeService);
  private searchInput$ = new Subject<string>();

  private wishlistService = inject(WishListService);
  private cartService = inject(CartService)
  wishlistCount$: Observable<number> = this.wishlistService.count$.pipe(startWith(0));
  cartCount$: Observable<number> = inject(CartService).count$.pipe(startWith(0));
  isAuthenticated = false;
  currentUser: AuthResponse | null = null;
  isAdmin = false;
  categories: ICategory[] = [];

  ngOnInit(): void {
    this.wishlistService.loadWishlist().subscribe();
    this.cartService.loadCart().subscribe();
    this.categoryService.getCategories().subscribe(cats => this.categories = cats);
  }

  onCategoryChange(value: string): void {
    const id = value ? Number(value) : null;
    if (id) {
      this.router.navigate(['/']);
    }
    this.homeService.filterByCategory(id);
  }

  onSearch(value: string): void {
  this.searchInput$.next(value);
  if (value) {
    this.router.navigate(['/']);
  }
}

  constructor(
    public authService: AuthService,
    private router: Router,
    private categoryService:CategoryService
  ) {
    this.searchInput$.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(value => this.homeService.search(value));

    // Use effect to reactively update the component when auth state changes
    effect(() => {
      const state = this.authService.authState();
      this.isAuthenticated = state.isAuthenticated;
      this.currentUser = state.user;
      // Check if user is admin
      this.isAdmin = this.authService.isAdmin();
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  getFullName(): string {
    if (this.currentUser) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    }
    return '';
  }
  onClear(input: HTMLInputElement): void {
    input.value = '';
    this.homeService.search('');
  }
}
