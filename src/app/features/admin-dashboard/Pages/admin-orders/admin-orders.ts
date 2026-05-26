import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DecimalPipe, DatePipe } from '@angular/common';
import { OrderService } from '../../../../shared/Services/order-service';
import { IPaginatedResul } from '../../../../shared/Models/Common/ipaginated-result';
import { IAdminOrder, AdminOrderStatus } from '../../../../shared/Models/Orders/iadmin-order';
import { IRequestFilter } from '../../../../shared/Models/Common/irequest-filter';
import { ToastService } from '../../../../shared/Services/toast-service';

@Component({
  selector: 'app-admin-orders',
  imports: [CommonModule, DecimalPipe, DatePipe],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrders implements OnInit {
  private ordersService = inject(OrderService);
  private toast = inject(ToastService);

  allOrders = signal<IAdminOrder[]>([]);
  loading = signal(false);

  pageSize = signal(10);
  currentPage = signal(1);
  statusFilter = signal<'All' | AdminOrderStatus>('All');
  searchTerm = signal('');
  filterType = signal<'user' | 'seller' | 'all'>('all');

  expanded = signal<Record<number, boolean>>({});

  filteredItems = computed(() => {
    let items = this.allOrders();

    const status = this.statusFilter();
    if (status !== 'All') {
      items = items.filter(i => i.status === status);
    }

    const search = this.searchTerm().trim().toLowerCase();
    if (search) {
      const filterBy = this.filterType();
      items = items.filter(i => {
        const matchesOrderId = i.orderId.toString().includes(search);
        const matchesCustomer = filterBy !== 'seller' &&
          (i.customerUserName.toLowerCase().includes(search) || i.customerEmail.toLowerCase().includes(search));
        const matchesSeller = filterBy !== 'user' &&
          i.items.some(item => item.sellerUserName.toLowerCase().includes(search));

        if (filterBy === 'user') return matchesOrderId || matchesCustomer;
        if (filterBy === 'seller') return matchesOrderId || matchesSeller;
        return matchesOrderId || matchesCustomer || matchesSeller;
      });
    }

    return items;
  });

  visible = computed(() => {
    const items = this.filteredItems();
    const size = this.pageSize();
    const page = this.currentPage();

    const start = (page - 1) * size;
    const end = start + size;
    const pagedItems = items.slice(start, end);

    const totalPages = Math.max(1, Math.ceil(items.length / size));

    return {
      items: pagedItems,
      pageNumber: page,
      pageSize: size,
      totalPages: totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages
    };
  });

  stats = computed(() => {
    const items = this.allOrders();
    const total = items.length;
    const revenue = items.reduce((sum, item) => sum + item.totalAmount, 0);
    const pending = items.filter(item => item.status === 'Pending').length;
    const active = items.filter(item => item.status === 'Confirmed' || item.status === 'Shipped').length;
    return { total, revenue, pending, active };
  });

  getCustomerInitials(name: string): string {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }

  getSellers(order: IAdminOrder): string {
    const sellers = [...new Set(order.items.map(item => item.sellerUserName))];
    return sellers.join(', ');
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    const serverFilter: IRequestFilter = {
      pageNumber: 1,
      pageSize: 1000,
      searchValue: '',
      sortColumn: 'orderDate',
      sortDirection: 'DESC'
    };

    this.ordersService.getAdminOrders(serverFilter).subscribe({
      next: res => {
        this.allOrders.set(res?.items ?? []);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.toast.handleError(err).subscribe();
      }
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  onSort(value: string) {
    const items = [...this.allOrders()];
    if (value === 'newest') {
      items.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    } else if (value === 'oldest') {
      items.sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());
    } else if (value === 'status') {
      items.sort((a, b) => a.status.localeCompare(b.status));
    } else if (value === 'amount_high') {
      items.sort((a, b) => b.totalAmount - a.totalAmount);
    } else if (value === 'amount_low') {
      items.sort((a, b) => a.totalAmount - b.totalAmount);
    }
    this.allOrders.set(items);
    this.currentPage.set(1);
  }

  setStatusFilter(status: 'All' | AdminOrderStatus) {
    this.statusFilter.set(status);
    this.currentPage.set(1);
  }

  setFilterType(type: 'user' | 'seller' | 'all') {
    this.filterType.set(type);
    this.currentPage.set(1);
  }

  onSearchChange(value: string) {
    this.searchTerm.set(value);
    this.currentPage.set(1);
  }

  get totalPages() {
    return Math.max(1, Math.ceil(this.filteredItems().length / this.pageSize()));
  }

  pageNumbers(max = 7) {
    const total = this.totalPages;
    const current = this.currentPage();
    const half = Math.floor(max / 2);
    let start = Math.max(1, current - half);
    let end = Math.min(total, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    const pages: number[] = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  toggleExpand(orderId: number) {
    const map = { ...this.expanded() };
    map[orderId] = !map[orderId];
    this.expanded.set(map);
  }
}
