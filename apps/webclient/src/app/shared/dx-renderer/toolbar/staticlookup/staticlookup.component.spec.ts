import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StaticlookupComponent } from './staticlookup.component';

describe('StaticlookupComponent', () => {
  let component: StaticlookupComponent;
  let fixture: ComponentFixture<StaticlookupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StaticlookupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StaticlookupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
