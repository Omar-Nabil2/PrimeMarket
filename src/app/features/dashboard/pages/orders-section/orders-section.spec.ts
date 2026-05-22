import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersSection } from './orders-section';

describe('OrdersSection', () => {
  let component: OrdersSection;
  let fixture: ComponentFixture<OrdersSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersSection],
    }).compileComponents();

    fixture = TestBed.createComponent(OrdersSection);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
