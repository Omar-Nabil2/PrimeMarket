import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppHero } from './app-hero';

describe('AppHero', () => {
  let component: AppHero;
  let fixture: ComponentFixture<AppHero>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppHero],
    }).compileComponents();

    fixture = TestBed.createComponent(AppHero);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
