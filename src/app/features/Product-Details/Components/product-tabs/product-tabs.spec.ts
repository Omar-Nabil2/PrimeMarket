import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTabs } from './product-tabs';

describe('ProductTabs', () => {
  let component: ProductTabs;
  let fixture: ComponentFixture<ProductTabs>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductTabs],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductTabs);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
