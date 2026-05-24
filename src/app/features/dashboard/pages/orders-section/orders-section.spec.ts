import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Orders } from './orders-section';
import { OrderService } from '../../../../shared/Services/order-service';
import { ToastService } from '../../../../shared/Services/toast-service';

describe('Orders', () => {
  let component: Orders;
  let fixture: ComponentFixture<Orders>;
  let mockOrderService: any;
  let mockToastService: any;

  beforeEach(async () => {
    mockOrderService = {
      getSellerOrders: () => of({ items: [], totalPages: 1, pageNumber: 1 }),
      updateOrderStatus: () => of({})
    };

    mockToastService = {
      success: () => {},
      handleError: () => of({})
    };

    await TestBed.configureTestingModule({
      imports: [Orders],
      providers: [
        { provide: OrderService, useValue: mockOrderService },
        { provide: ToastService, useValue: mockToastService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Orders);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});