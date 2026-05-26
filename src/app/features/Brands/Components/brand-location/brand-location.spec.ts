import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandLocation } from './brand-location';

describe('BrandLocation', () => {
  let component: BrandLocation;
  let fixture: ComponentFixture<BrandLocation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandLocation],
    }).compileComponents();

    fixture = TestBed.createComponent(BrandLocation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
