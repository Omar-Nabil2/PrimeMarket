import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutOrderSummary } from './checkout-order-summary';

describe('CheckoutOrderSummary', () => {
  let component: CheckoutOrderSummary;
  let fixture: ComponentFixture<CheckoutOrderSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutOrderSummary],
    }).compileComponents();

    fixture = TestBed.createComponent(CheckoutOrderSummary);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
