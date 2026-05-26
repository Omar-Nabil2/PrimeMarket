import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandInfo } from './brand-info';

describe('BrandInfo', () => {
  let component: BrandInfo;
  let fixture: ComponentFixture<BrandInfo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandInfo],
    }).compileComponents();

    fixture = TestBed.createComponent(BrandInfo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
