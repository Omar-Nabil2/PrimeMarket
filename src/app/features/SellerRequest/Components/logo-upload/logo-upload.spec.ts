import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogoUpload } from './logo-upload';

describe('LogoUpload', () => {
  let component: LogoUpload;
  let fixture: ComponentFixture<LogoUpload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogoUpload],
    }).compileComponents();

    fixture = TestBed.createComponent(LogoUpload);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
