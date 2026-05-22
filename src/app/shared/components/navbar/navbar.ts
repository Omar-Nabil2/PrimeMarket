import { CommonModule } from '@angular/common';
import { Component, inject, OnInit,  effect } from '@angular/core';
import { RouterLink,  Router } from "@angular/router";
import { HomeService } from '../../../features/home/Services/home-service';
import { debounceTime, distinctUntilChanged, Observable, Subject } from 'rxjs';
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
  wishlistCount$: Observable<number> = this.wishlistService.count$;
  cartCount$: Observable<number> = inject(CartService).count$;
  isAuthenticated = false;
  currentUser: AuthResponse | null = null;
  categories: ICategory[] = [];

  ngOnInit(): void {
    this.wishlistService.loadWishlist().subscribe();
    this.cartService.loadCart().subscribe();
    this.categoryService.getCategories().subscribe(cats => this.categories = cats);
  }

  onCategoryChange(value: string): void {
    const id = value ? Number(value) : null;
    this.homeService.filterByCategory(id);
  }

  onSearch(value: string): void {
    this.searchInput$.next(value);
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
