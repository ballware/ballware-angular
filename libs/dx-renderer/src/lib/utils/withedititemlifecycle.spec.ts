import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Component, Inject, Input, OnInit, Provider } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EDIT_SERVICE, EditItemRef, EditService } from '@ballware/meta-services';
import { takeUntil } from 'rxjs';
import { WithDestroy } from './withdestroy';
import { WithEditItemLifecycle } from './withedititemlivecycle';
import { mockedEditServiceContext } from '../../test/editservice.spec';

@Component({
  selector: 'ballware-edit-lifecycle-test',
  template: '',
  styleUrls: [],
  imports: [],
  standalone: true
})
class EditLifecycleTestComponent extends WithEditItemLifecycle(WithDestroy()) implements OnInit, EditItemRef {

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
            this.layoutItem = layoutItem;

            this.onEntered();
            this.onEvent('mockedevent');
          }
        });
    }
  }
}

describe('WithEditItemLifecycle', () => {
  let component: EditLifecycleTestComponent;
  let fixture: ComponentFixture<EditLifecycleTestComponent>;
  
  const mockedEditService = mockedEditServiceContext();
        
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EditLifecycleTestComponent ],
      providers: [        
        {
          provide: EDIT_SERVICE,
          useFactory: () => mockedEditService.mock.object()
        } as Provider         
      ]
    })
    .compileComponents();
  });

  it('should create with lifecycle', () => {
    fixture = TestBed.createComponent(EditLifecycleTestComponent);
       
    const layoutItem = {
        options: {
            dataMember: 'mockedmember'
        }
    } as EditLayoutItem;
    
    component = fixture.componentInstance;   
    expect(component).toBeTruthy();

    component.initialLayoutItem = layoutItem;
    fixture.detectChanges();
       
    expect(mockedEditService.editorPreparing).toBeCalledTimes(1);
    expect(mockedEditService.editorPreparing).toBeCalledWith(expect.objectContaining({ dataMember: 'mockedmember' }));

    expect(mockedEditService.editorInitialized).toBeCalledTimes(1);
    expect(mockedEditService.editorInitialized).toBeCalledWith(expect.objectContaining({ dataMember: 'mockedmember' }));

    expect(mockedEditService.editorEntered).toBeCalledTimes(1);
    expect(mockedEditService.editorEntered).toBeCalledWith(expect.objectContaining({ dataMember: 'mockedmember' }));

    expect(mockedEditService.editorEvent).toBeCalledTimes(1);
    expect(mockedEditService.editorEvent).toBeCalledWith(expect.objectContaining({ dataMember: 'mockedmember', event: 'mockedevent' }));
    
  });
});
