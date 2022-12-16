import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResponsiveDetectorComponent } from './responsive-detector.component';

describe('ResponsiveDetectorComponent', () => {
  let component: ResponsiveDetectorComponent;
  let fixture: ComponentFixture<ResponsiveDetectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResponsiveDetectorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResponsiveDetectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
