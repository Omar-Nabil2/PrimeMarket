import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { IBrandService } from '../../shared/Services/ibrand-service';
import { ProductService } from '../../shared/Services/product-service';
import { forkJoin } from 'rxjs';
import { HomeService } from '../home/Services/home-service';
import { IProcuctCard } from '../../shared/Models/Product/iproduct-card';
import { IBrandCard } from '../../shared/Models/Brands/ibrand-card';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface HeroSlide {
  badge: string;
  title: string;
  highlight: string;
  titleAfter: string;
  description: string;
  primaryBtn: string;
  secondaryBtn: string;
  primaryRoute: string;
  secondaryRoute: string;
  colorClass: string;
  images: string[];
}

@Component({
  selector: 'app-app-hero',
  imports: [CommonModule, RouterModule],
  templateUrl: './app-hero.html',
  styleUrl: './app-hero.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeroComponent implements OnInit, OnDestroy {
  private brandService = inject(IBrandService);
  private productService = inject(HomeService);

  loading = signal(true);
  current = signal(0);
  slides = signal<HeroSlide[]>([]);

  dots = computed(() => this.slides().map((_, i) => i));

  private timer: ReturnType<typeof setInterval> | null = null;

  readonly promoItems = [
    { icon: 'ti-truck-delivery', label: 'Free Shipping',   sub: 'On orders over EGP 500'  },
    { icon: 'ti-refresh',        label: 'Easy Returns',    sub: '30-day return policy'    },
    { icon: 'ti-shield-check',   label: 'Secure Payments', sub: '100% protected checkout' },
    { icon: 'ti-tag',            label: 'Exclusive Deals', sub: 'For registered members'  },
  ];

  ngOnInit() {
    forkJoin({
      brands:   this.brandService.getAll(),
      featured: this.productService.getProducts({ pageNumber: 1, pageSize: 4, sortColumn: 'rating',    sortDirection: 'DESC' }),
      newest:   this.productService.getProducts({ pageNumber: 1, pageSize: 4, sortColumn: 'createdAt', sortDirection: 'DESC' }),
    }).subscribe({
      next: ({ brands, featured, newest }) => {
        this.slides.set([
          this.buildFeaturedSlide(featured.items),
          this.buildNewestSlide(newest.items),
          this.buildBrandsSlide(brands),
        ]);
        this.loading.set(false);
        this.startTimer();
      },
      error: () => {
        this.slides.set([this.fallbackSlide()]);
        this.loading.set(false);
        this.startTimer();
      },
    });
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  goTo(i: number) {
    this.current.set((i + this.slides().length) % this.slides().length);
  }

  next() { this.goTo(this.current() + 1); }
  prev() { this.goTo(this.current() - 1); }

  private startTimer() {
    this.timer = setInterval(() => this.next(), 4500);
  }

  private buildFeaturedSlide(products: IProcuctCard[]): HeroSlide {
    return {
      badge: 'Top Rated',
      title: 'Our ', highlight: 'Best Sellers', titleAfter: ' — Loved by Customers',
      description: 'Handpicked top-rated products across all categories. Quality you can trust.',
      primaryBtn: 'Shop Best Sellers', secondaryBtn: 'All Products',
      primaryRoute: '/',secondaryRoute:'/', colorClass: 'slide--red-bright',
      images: products.map(p => p.primaryImageUrl).filter(Boolean).slice(0, 4),
    };
  }

  private buildNewestSlide(products: IProcuctCard[]): HeroSlide {
    return {
      badge: 'Just Dropped',
      title: 'Fresh ', highlight: 'New Arrivals', titleAfter: ' Every Week',
      description: "Brand new items just added — be the first to grab them before they sell out.",
      primaryBtn: 'Shop New Arrivals', secondaryBtn: 'View All',
      primaryRoute: '/brands',secondaryRoute:'/brands' ,colorClass: 'slide--red-deep',
      images: products.map(p => p.primaryImageUrl).filter(Boolean).slice(0, 4),
    };
  }

  private buildBrandsSlide(brands: IBrandCard[]): HeroSlide {
    const verified = brands.filter(b => b.isVerified && b.isActive);
    return {
      badge: 'Trusted Sellers',
      title: 'Shop from ', highlight: 'Top Brands', titleAfter: ' on PrimeMarket',
      description: `${verified.length}+ verified brands — find your favourite or discover something new.`,
      primaryBtn: 'Explore Brands', secondaryBtn: 'Become a Seller',
      primaryRoute: '/become-seller',secondaryRoute:'/become-seller', colorClass: 'slide--dark',
      images: verified.map(b => b.logoUrl).filter((u): u is string => !!u).slice(0, 4),
    };
  }

  private fallbackSlide(): HeroSlide {
    return {
      badge: 'Welcome', title: 'Discover ', highlight: 'Amazing Products', titleAfter: '',
      description: 'Shop thousands of items across all categories on PrimeMarket.',
      primaryBtn: 'Shop Now', secondaryBtn: 'Browse All',
      primaryRoute: '/',secondaryRoute:'/', colorClass: 'slide--red-bright', images: [],
    };
  }
}
