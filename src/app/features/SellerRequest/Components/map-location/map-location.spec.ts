import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapLocation } from './map-location';

describe('MapLocation', () => {
  let component: MapLocation;
  let fixture: ComponentFixture<MapLocation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapLocation],
    }).compileComponents();

    fixture = TestBed.createComponent(MapLocation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
