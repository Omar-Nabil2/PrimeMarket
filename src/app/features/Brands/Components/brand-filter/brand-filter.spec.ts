import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandFilter } from './brand-filter';

describe('BrandFilter', () => {
  let component: BrandFilter;
  let fixture: ComponentFixture<BrandFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandFilter],
    }).compileComponents();

    fixture = TestBed.createComponent(BrandFilter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
