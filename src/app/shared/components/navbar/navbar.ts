import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, effect } from '@angular/core';
import { RouterLink,  Router } from "@angular/router";
import { HomeService } from '../../../features/home/Services/home-service';
import { debounceTime, distinctUntilChanged, Observable, startWith, Subject } from 'rxjs';
import { WishListService } from '../../Services/wish-list-service';
import { CartService } from '../../Services/cart-service';
import { AuthService } from '../../Services/auth.service';
import { AuthResponse } from '../../Models/auth.model';
import { CategoryService } from '../../Services/category-service';
import { ICategory } from '../../Models/Category/icategory';
import { NotificationSideBar } from "../notification-side-bar/notification-side-bar";
import { NotificationService } from '../../Services/notification-service';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule, NotificationSideBar],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
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
  isSeller=false;

  categories$: Observable<ICategory[]>;
  isSidebarOpen = false;

  notificationService = inject(NotificationService);

  ngOnInit(): void {
    if (this.isAuthenticated) {
      this.wishlistService.loadWishlist().subscribe();
       this.cartService.loadCart().subscribe();
    }

    // categories are bound with async pipe in template to avoid sync replay timing issues
  }

  onCategoryChange(value: string): void {
    const id = value ? Number(value) : null;
    if (id) {
      this.router.navigate(['/']);
    }
    this.homeService.filterByCategory(id);
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
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
    this.categories$ = this.categoryService.getCategories();

    this.searchInput$.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(value => this.homeService.search(value));

    // Use effect to reactively update the component when auth state changes
    effect(() => {
      const state = this.authService.authState();
      this.isAuthenticated = state.isAuthenticated;
      this.currentUser = state.user;
      this.isAdmin = this.authService.isAdmin();
      this.isSeller = this.authService.isSeller();

      if (state.isAuthenticated) {
        setTimeout(() => {
          this.wishlistService.loadWishlist().subscribe();
          this.cartService.loadCart().subscribe();
        }, 0);
      }
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
