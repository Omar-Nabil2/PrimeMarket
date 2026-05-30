import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationSideBar } from './notification-side-bar';

describe('NotificationSideBar', () => {
  let component: NotificationSideBar;
  let fixture: ComponentFixture<NotificationSideBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationSideBar],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationSideBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
