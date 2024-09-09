import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Component, Inject, Input, OnInit, Provider } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EDIT_SERVICE, EditItemRef, EditService } from '@ballware/meta-services';
import { takeUntil } from 'rxjs';
import { WithDestroy } from './withdestroy';
import { WithEditItemLifecycle } from './withedititemlivecycle';
import { mockedEditServiceContext } from '../../test/editservice.spec';
import { WithRequired } from './withrequired';
import { WithValidation } from './withvalidation';

@Component({
  selector: 'ballware-edit-required-test',
  template: '',
  styleUrls: [],
  imports: [],
  standalone: true
})
class EditRequiredTestComponent extends WithRequired(WithValidation(WithEditItemLifecycle(WithDestroy()))) implements OnInit, EditItemRef {

  @Input() initialLayoutItem?: EditLayoutItem;

  public layoutItem: EditLayoutItem|undefined;

  constructor(
    @Inject(EDIT_SERVICE) private editService: EditService) {
    super();
  }

  ngOnInit(): void {
    if (this.initialLayoutItem) {
      this.initLifecycle(this.initialLayoutItem, this.editService, this);

      this.preparedLayoutItem$
        .pipe(takeUntil(this.destroy$))
        .subscribe((layoutItem) => {
          if (layoutItem) {
            this.initValidation(layoutItem, this.editService);
            this.initRequired(layoutItem, this.editService);

            this.layoutItem = layoutItem;
          }
        });
    }
  }
}

describe('WithRequired', () => {
  let component: EditRequiredTestComponent;
  let fixture: ComponentFixture<EditRequiredTestComponent>;
  
  const mockedEditService = mockedEditServiceContext();
        
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EditRequiredTestComponent ],
      providers: [        
        {
          provide: EDIT_SERVICE,
          useFactory: () => mockedEditService.mock.object()
        } as Provider         
      ]
    })
    .compileComponents();
  });

  it('should create with value', () => {
    fixture = TestBed.createComponent(EditRequiredTestComponent);
       
    const layoutItem = {
        options: {
            dataMember: 'mockedmember',
            required: true
        }
    } as EditLayoutItem;
    
    component = fixture.componentInstance;   
    expect(component).toBeTruthy();

    component.initialLayoutItem = layoutItem;
    fixture.detectChanges();

    expect(component.getOption('required')).toBe(true);

    component.setOption('required', false);

    expect(component.getOption('required')).toBe(false);
  });
});
