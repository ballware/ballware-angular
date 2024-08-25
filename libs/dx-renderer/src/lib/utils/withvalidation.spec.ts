import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Component, Inject, Input, OnInit, Provider } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EDIT_SERVICE, EditItemRef, EditService } from '@ballware/meta-services';
import { firstValueFrom, from, lastValueFrom, takeUntil } from 'rxjs';
import { WithDestroy } from './withdestroy';
import { WithEditItemLifecycle } from './withedititemlivecycle';
import { mockedEditServiceContext } from '../../test/editservice.spec';
import { WithValue } from './withvalue';
import { WithValidation } from './withvalidation';
import { WithRequired } from './withrequired';

@Component({
  selector: 'ballware-edit-validation-test',
  template: '',
  styleUrls: [],
  imports: [],
  standalone: true
})
class EditValidationTestComponent extends WithRequired(WithValidation(WithValue(WithEditItemLifecycle(WithDestroy()), () => ""))) implements OnInit, EditItemRef {

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
            this.initValue(layoutItem, this.editService);
            this.initValidation(layoutItem, this.editService);
            this.initRequired(layoutItem, this.editService);

            this.layoutItem = layoutItem;
          }
        });
    }
  }

  public getOption(_option: string): any {
    return undefined;
  }

  public setOption(_option: string, _value: unknown) {
    throw Error('Not implemented');
  }
}

describe('WithValidation', () => {
  let component: EditValidationTestComponent;
  let fixture: ComponentFixture<EditValidationTestComponent>;
  
  const mockedEditService = mockedEditServiceContext();
        
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EditValidationTestComponent ],
      providers: [        
        {
          provide: EDIT_SERVICE,
          useFactory: () => mockedEditService.mock.object()
        } as Provider         
      ]
    })
    .compileComponents();
  });

  it('should create without validation', async () => {
    fixture = TestBed.createComponent(EditValidationTestComponent);
       
    const layoutItem = {
        options: {
            dataMember: 'mockedmember'
        }
    } as EditLayoutItem;
    
    component = fixture.componentInstance;   
    expect(component).toBeTruthy();

    component.initialLayoutItem = layoutItem;
    fixture.detectChanges();

    const validationRules$ = component.validationRules$;

    expect(validationRules$).toBeDefined();

    if (validationRules$) {
      await expect((firstValueFrom(validationRules$)))
        .resolves.toEqual([]);
    }
  });

  it('should create with required validation', async () => {
    fixture = TestBed.createComponent(EditValidationTestComponent);
       
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

    const validationRules$ = component.validationRules$;

    expect(validationRules$).toBeDefined();

    if (validationRules$) {
      await expect((firstValueFrom(validationRules$)))
        .resolves.toEqual([{
          type: "required"
        }]);
    }
  });

  it('should create with email validation', async () => {
    fixture = TestBed.createComponent(EditValidationTestComponent);
       
    const layoutItem = {
        options: {
            dataMember: 'mockedmember'
        }
    } as EditLayoutItem;
    
    component = fixture.componentInstance;   
    expect(component).toBeTruthy();

    component.initialLayoutItem = layoutItem;
    component.validateEmail(true);
    fixture.detectChanges();

    const validationRules$ = component.validationRules$;

    expect(validationRules$).toBeDefined();

    if (validationRules$) {
      await expect((firstValueFrom(validationRules$)))
        .resolves.toEqual([{
          type: "email"
        }]);
    }
  });
});
