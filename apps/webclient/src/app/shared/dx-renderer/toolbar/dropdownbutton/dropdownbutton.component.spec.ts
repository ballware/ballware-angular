import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropdownbuttonComponent } from './dropdownbutton.component';

describe('DropdownbuttonComponent', () => {
  let component: DropdownbuttonComponent;
  let fixture: ComponentFixture<DropdownbuttonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DropdownbuttonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DropdownbuttonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
