import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { DecimalPipe, NgClass, DatePipe } from '@angular/common';
import { OrderService } from '../../../../shared/Services/order-service';
import { IPaginatedResul } from '../../../../shared/Models/Common/ipaginated-result';
import { ISellerOrder, OrderStatus } from '../../../../shared/Models/Orders/iseller-order';
import { IRequestFilter } from '../../../../shared/Models/Common/irequest-filter';
import { ToastService } from '../../../../shared/Services/toast-service';

@Component({
  selector: 'app-orders',
  imports: [NgClass, DecimalPipe, DatePipe],
  templateUrl: './orders-section.html',
  styleUrl: './orders-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Orders implements OnInit {
  private ordersService = inject(OrderService);
  private toast = inject(ToastService);

  orders = signal<IPaginatedResul<ISellerOrder> | null>(null);
  loading = signal(false);

  // server-driven filter (search, sort, pagination)
  filter = signal<IRequestFilter>({ pageNumber: 1, pageSize: 5, searchValue: '', sortColumn: 'createdon', sortDirection: 'DESC' });

  // client-side status filter (backend doesn't expose status filter)
  statusFilter = signal<'All' | OrderStatus>('All');

  // UI signals
  searchTerm = signal('');
  private searchTimer: any = null;
  expanded = signal<Record<number, boolean>>({});
  confirmData = signal<{ order: ISellerOrder, status: OrderStatus } | null>(null);

  visible = computed(() => {
    const data = this.orders();
    if (!data) return { items: [] as ISellerOrder[], pageNumber: 1, totalPages: 1, hasPreviousPage: false, hasNextPage: false, pageSize: this.filter().pageSize } as any;
    const filtered = data.items.filter(i => (this.statusFilter() === 'All' ? true : i.status === this.statusFilter()));
    return { ...data, items: filtered } as IPaginatedResul<ISellerOrder> & { pageSize: number };
  });

  stats = computed(() => {
    const data = this.orders();
    if (!data || !data.items) {
      return { total: 0, revenue: 0, pending: 0, active: 0 };
    }
    const items = data.items;
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



  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    this.ordersService.getSellerOrders(this.filter()).subscribe({
      next: res => {
        this.orders.set(res);
        this.loading.set(false);
      },
      error: err => {
        this.loading.set(false);
        this.toast.handleError(err).subscribe();
      }
    });
  }

  onPageChange(page: number) {
    this.filter.update(f => ({ ...f, pageNumber: page }));
    this.loadOrders();
  }

  onSort(value: string) {
    let column = 'createdon';
    let direction: 'ASC' | 'DESC' = 'DESC';

    if (value === 'createdon') {
      column = 'createdon';
      direction = 'DESC';
    } else if (value === 'createdon_desc') {
      column = 'createdon';
      direction = 'ASC';
    } else if (value === 'status') {
      column = 'status';
      direction = 'ASC';
    }

    this.filter.set({
      ...this.filter(),
      sortColumn: column,
      sortDirection: direction,
      pageNumber: 1
    });
    this.loadOrders();
  }

  setStatusFilter(status: 'All' | OrderStatus) {
    this.statusFilter.set(status);
    this.filter.update(f => ({ ...f, pageNumber: 1 }));
    this.loadOrders();
  }

  updateStatus(order: ISellerOrder, status: OrderStatus) {
    this.confirmData.set({ order, status });
  }

  cancelConfirm() {
    this.confirmData.set(null);
  }

  executeConfirm() {
    const data = this.confirmData();
    if (!data) return;
    this.confirmData.set(null);
    
    this.ordersService.updateOrderStatus(data.order.orderId, data.status).subscribe({
      next: () => {
        // update local snapshot
        const pag = this.orders();
        if (pag) {
          const updatedItems = pag.items.map(o => (o.orderId === data.order.orderId ? { ...o, status: data.status } : o));
          this.orders.set({ ...pag, items: updatedItems } as any);
        }
        this.toast.success('Order status updated successfully');
      },
      error: err => {
        this.toast.handleError(err).subscribe();
      }
    });
  }

  onSearchChange(value: string) {
    this.searchTerm.set(value);
    if (this.searchTimer) clearTimeout(this.searchTimer);
    
    if (!value) {
      this.filter.update(f => ({ ...f, searchValue: '', pageNumber: 1 }));
      this.loadOrders();
      return;
    }

    this.searchTimer = setTimeout(() => {
      this.filter.update(f => ({ ...f, searchValue: value, pageNumber: 1 }));
      this.loadOrders();
    }, 350);
  }

  get totalPages() { return this.orders()?.totalPages ?? 1; }
  get currentPage() { return this.orders()?.pageNumber ?? 1; }
  pageNumbers(max = 7) {
    const total = this.totalPages;
    const current = this.currentPage;
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
