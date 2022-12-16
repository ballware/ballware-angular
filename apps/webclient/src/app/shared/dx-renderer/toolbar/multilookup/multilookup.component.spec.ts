import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultilookupComponent } from './multilookup.component';

describe('MultilookupComponent', () => {
  let component: MultilookupComponent;
  let fixture: ComponentFixture<MultilookupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultilookupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultilookupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
