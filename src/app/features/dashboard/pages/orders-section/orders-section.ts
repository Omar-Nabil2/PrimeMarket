import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { DecimalPipe, NgClass, DatePipe, NgStyle } from '@angular/common';
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

  allOrders = signal<ISellerOrder[]>([]);
  loading = signal(false);

  pageSize = signal(5);
  currentPage = signal(1);
  statusFilter = signal<'All' | OrderStatus>('All');
  searchTerm = signal('');
  
  expanded = signal<Record<number, boolean>>({});
  confirmData = signal<{ order: ISellerOrder, status: OrderStatus } | null>(null);

  filteredItems = computed(() => {
    let items = this.allOrders();
    
    const status = this.statusFilter();
    if (status !== 'All') {
      items = items.filter(i => i.status === status);
    }

    const search = this.searchTerm().trim().toLowerCase();
    if (search) {
      items = items.filter(i => 
        i.orderId.toString().includes(search) || 
        (i.customerName && i.customerName.toLowerCase().includes(search))
      );
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

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading.set(true);
    const serverFilter: IRequestFilter = { pageNumber: 1, pageSize: 1000, searchValue: '', sortColumn: 'createdon', sortDirection: 'DESC' };
    
    this.ordersService.getSellerOrders(serverFilter).subscribe({
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
    if (value === 'createdon') {
      items.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());
    } else if (value === 'createdon_desc') {
      items.sort((a, b) => new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime());
    } else if (value === 'status') {
      items.sort((a, b) => a.status.localeCompare(b.status));
    }
    this.allOrders.set(items);
    this.currentPage.set(1);
  }

  setStatusFilter(status: 'All' | OrderStatus) {
    this.statusFilter.set(status);
    this.currentPage.set(1);
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
        const updatedItems = this.allOrders().map(o => (o.orderId === data.order.orderId ? { ...o, status: data.status } : o));
        this.allOrders.set(updatedItems);
        this.toast.success('Order status updated successfully');
      },
      error: err => {
        this.toast.handleError(err).subscribe();
      }
    });
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