import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandHero } from './brand-hero';

describe('BrandHero', () => {
  let component: BrandHero;
  let fixture: ComponentFixture<BrandHero>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandHero],
    }).compileComponents();

    fixture = TestBed.createComponent(BrandHero);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
