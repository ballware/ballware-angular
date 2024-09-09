import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Component, Inject, Input, OnInit, Provider } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EDIT_SERVICE, EditItemRef, EditService } from '@ballware/meta-services';
import { takeUntil } from 'rxjs';
import { WithDestroy } from './withdestroy';
import { WithEditItemLifecycle } from './withedititemlivecycle';
import { mockedEditServiceContext } from '../../test/editservice.spec';
import { WithValue } from './withvalue';

@Component({
  selector: 'ballware-edit-value-test',
  template: '',
  styleUrls: [],
  imports: [],
  standalone: true
})
class EditValueTestComponent extends WithValue(WithEditItemLifecycle(WithDestroy()), () => "") implements OnInit, EditItemRef {

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

            this.layoutItem = layoutItem;

            
          }
        });
    }
  }
}

describe('WithValue', () => {
  let component: EditValueTestComponent;
  let fixture: ComponentFixture<EditValueTestComponent>;
  
  const mockedEditService = mockedEditServiceContext();
        
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EditValueTestComponent ],
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
    fixture = TestBed.createComponent(EditValueTestComponent);
       
    const layoutItem = {
        options: {
            dataMember: 'mockedmember'
        }
    } as EditLayoutItem;
    
    component = fixture.componentInstance;   
    expect(component).toBeTruthy();

    component.initialLayoutItem = layoutItem;

    mockedEditService.getValue.mockReturnValueOnce("initialvalue");

    fixture.detectChanges();

    expect(component.value).toBe("initialvalue");

    mockedEditService.getValue.mockReturnValueOnce("refreshedvalue");

    component.refreshValue();

    expect(component.value).toBe("refreshedvalue");

    component.value = 'changedvalue';
       
    expect(mockedEditService.editorValueChanged).toBeCalledWith({ dataMember: 'mockedmember', value: 'changedvalue', notify: true});

    component.setValueWithoutNotification('notnotifiedvalue');

    mockedEditService.editorValueChanged.mockClear();

    expect(component.value).toBe("notnotifiedvalue");
    expect(mockedEditService.editorValueChanged).toBeCalledTimes(0);
  });
});
