import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BecomeASeller } from './become-aseller';

describe('BecomeASeller', () => {
  let component: BecomeASeller;
  let fixture: ComponentFixture<BecomeASeller>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BecomeASeller],
    }).compileComponents();

    fixture = TestBed.createComponent(BecomeASeller);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
