import { DatePipe, CurrencyPipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, finalize, forkJoin, map, of } from 'rxjs';
import { StatsCard } from '../../../dashboard/components/stats-card/stats-card';
import { CategoryService } from '../../../../shared/Services/category-service';
import { IBrandService } from '../../../../shared/Services/ibrand-service';
import { OrderService } from '../../../../shared/Services/order-service';
import { ProductService } from '../../../../shared/Services/product-service';
import { ToastService } from '../../../../shared/Services/toast-service';
import { User, UserService } from '../../../../shared/Services/user-service';
import { ICategory } from '../../../../shared/Models/Category/icategory';
import { ISellerRequest } from '../../../../shared/Models/Brands/iseller-request';
import { IRequestFilter } from '../../../../shared/Models/Common/irequest-filter';
import { IAdminOrder } from '../../../../shared/Models/Orders/iadmin-order';
import { OrderStatus } from '../../../../shared/Models/Orders/order-status';
import { IAdminProduct } from '../../../../shared/Models/Product/iadmin-product';

interface MetricCard {
  label: string;
  value: string;
  icon: string;
  color: 'blue' | 'red' | 'green' | 'orange';
  sublabel: string;
}

interface StatusBreakdownItem {
  label: OrderStatus;
  count: number;
  percent: number;
  tone: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
}

interface QuickLink {
  label: string;
  description: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-admin-dashboard-overview',
  standalone: true,
  imports: [RouterLink, DatePipe, CurrencyPipe, DecimalPipe, StatsCard],
  templateUrl: './admin-dashboard-overview.html',
  styleUrl: './admin-dashboard-overview.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardOverview implements OnInit {
  private orderService = inject(OrderService);
  private productService = inject(ProductService);
  private userService = inject(UserService);
  private categoryService = inject(CategoryService);
  private brandService = inject(IBrandService);
  private toast = inject(ToastService);

  loading = signal(false);
  lastUpdated = signal<Date | null>(null);

  orders = signal<IAdminOrder[]>([]);
  products = signal<IAdminProduct[]>([]);
  users = signal<User[]>([]);
  categories = signal<ICategory[]>([]);
  sellerRequests = signal<ISellerRequest[]>([]);

  readonly metricCards = computed<MetricCard[]>(() => {
    const orders = this.orders();
    const products = this.products();
    const users = this.users();
    const categories = this.categories();
    const sellerRequests = this.sellerRequests();

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const activeUsers = users.filter(user => !user.isDisabled).length;
    const pendingOrders = orders.filter(order => order.status === 'Pending').length;

    return [
      {
        label: 'Total Orders',
        value: orders.length.toString(),
        icon: 'ti-receipt',
        color: 'blue',
        sublabel: 'All-time marketplace orders',
      },
      {
        label: 'Total Revenue',
        value: `${totalRevenue.toLocaleString('en-EG', { maximumFractionDigits: 0 })} EGP`,
        icon: 'ti-currency-dollar',
        color: 'green',
        sublabel: 'Summed from admin orders',
      },
      {
        label: 'Total Products',
        value: products.length.toString(),
        icon: 'ti-package',
        color: 'orange',
        sublabel: `${products.filter(product => product.stock > 0).length} in stock`,
      },
      {
        label: 'Total Users',
        value: users.length.toString(),
        icon: 'ti-users',
        color: 'blue',
        sublabel: `${activeUsers} active accounts`,
      },
      {
        label: 'Total Categories',
        value: categories.length.toString(),
        icon: 'ti-tags',
        color: 'orange',
        sublabel: 'Configured catalog groups',
      },
      {
        label: 'Pending Orders',
        value: pendingOrders.toString(),
        icon: 'ti-clock-hour-4',
        color: 'red',
        sublabel: `${sellerRequests.length} seller requests waiting`,
      },
    ];
  });

  readonly statusBreakdown = computed<StatusBreakdownItem[]>(() => {
    const orders = this.orders();
    const total = Math.max(orders.length, 1);
    const counts: Record<OrderStatus, number> = {
      Pending: 0,
      Confirmed: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0,
    };

    orders.forEach(order => {
      counts[order.status] += 1;
    });

    return [
      { label: 'Pending', count: counts.Pending, percent: Math.round((counts.Pending / total) * 100), tone: 'pending' },
      { label: 'Confirmed', count: counts.Confirmed, percent: Math.round((counts.Confirmed / total) * 100), tone: 'confirmed' },
      { label: 'Shipped', count: counts.Shipped, percent: Math.round((counts.Shipped / total) * 100), tone: 'shipped' },
      { label: 'Delivered', count: counts.Delivered, percent: Math.round((counts.Delivered / total) * 100), tone: 'delivered' },
      { label: 'Cancelled', count: counts.Cancelled, percent: Math.round((counts.Cancelled / total) * 100), tone: 'cancelled' },
    ];
  });

  readonly recentOrders = computed(() =>
    [...this.orders()]
      .sort((left, right) => new Date(right.orderDate).getTime() - new Date(left.orderDate).getTime())
      .slice(0, 5)
  );

  readonly recentProducts = computed(() =>
    [...this.products()]
      .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
      .slice(0, 5)
  );

  readonly quickLinks: QuickLink[] = [
    {
      label: 'Manage users',
      description: 'Review profiles, roles, and account status.',
      route: '/admin-dashboard/users',
      icon: 'ti-users',
    },
    {
      label: 'Review products',
      description: 'Inspect catalog items, stock, and ratings.',
      route: '/admin-dashboard/products',
      icon: 'ti-package',
    },
    {
      label: 'Check orders',
      description: 'Track fulfillment progress and revenue.',
      route: '/admin-dashboard/orders',
      icon: 'ti-receipt',
    },
    {
      label: 'Handle requests',
      description: 'Approve or reject new seller applications.',
      route: '/admin-dashboard/seller-requests',
      icon: 'ti-building',
    },
  ];

  ngOnInit(): void {
    this.loadOverview();
  }

  refreshOverview(): void {
    this.loadOverview();
  }

  getSellerName(order: IAdminOrder): string {
    const sellers = [...new Set(order.items.map(item => item.sellerUserName))];
    return sellers.join(', ');
  }

  private loadOverview(): void {
    this.loading.set(true);

    const adminOrderFilter: IRequestFilter = {
      pageNumber: 1,
      pageSize: 1000,
      sortColumn: 'orderDate',
      sortDirection: 'DESC',
    };

    const adminProductFilter: IRequestFilter = {
      pageNumber: 1,
      pageSize: 1000,
      sortColumn: 'createdAt',
      sortDirection: 'DESC',
    };

    forkJoin({
      orders: this.orderService.getAdminOrders(adminOrderFilter).pipe(
        map(result => result?.items ?? []),
        catchError(error => {
          this.toast.handleError(error).subscribe();
          return of([] as IAdminOrder[]);
        })
      ),
      products: this.productService.getAdminProducts(adminProductFilter).pipe(
        map(result => result?.items ?? []),
        catchError(error => {
          this.toast.handleError(error).subscribe();
          return of([] as IAdminProduct[]);
        })
      ),
      users: this.userService.getAllUsers().pipe(
        catchError(error => {
          this.toast.handleError(error).subscribe();
          return of([] as User[]);
        })
      ),
      categories: this.categoryService.getAll().pipe(
        catchError(error => {
          this.toast.handleError(error).subscribe();
          return of([] as ICategory[]);
        })
      ),
      sellerRequests: this.brandService.getSellerRequests().pipe(
        catchError(error => {
          this.toast.handleError(error).subscribe();
          return of([] as ISellerRequest[]);
        })
      ),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe(({ orders, products, users, categories, sellerRequests }) => {
        this.orders.set(orders);
        this.products.set(products);
        this.users.set(users);
        this.categories.set(categories);
        this.sellerRequests.set(sellerRequests);
        this.lastUpdated.set(new Date());
      });
  }
}
