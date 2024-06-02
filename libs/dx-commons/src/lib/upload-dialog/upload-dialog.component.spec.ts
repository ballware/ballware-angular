import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DxCommonsComponent } from './dx-commons.component';

describe('DxCommonsComponent', () => {
  let component: DxCommonsComponent;
  let fixture: ComponentFixture<DxCommonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DxCommonsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DxCommonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
