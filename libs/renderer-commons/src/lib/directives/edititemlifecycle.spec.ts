import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Component, OnInit, Provider } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EDIT_SERVICE } from '@ballware/meta-services';
import { takeUntil } from 'rxjs';
import { Destroy } from './destroy';
import { EditItemLivecycle } from './edititemlivecycle';
import { mockedEditServiceContext } from '../../test/editservice.spec';

@Component({
  selector: 'lib-edit-lifecycle-test',
  template: '',
  styleUrls: [],
  imports: [],
  hostDirectives: [Destroy, { directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }],
  standalone: true
})
class EditLifecycleTestComponent implements OnInit {
  
  constructor(
    private destroy: Destroy,
    private livecycle: EditItemLivecycle) {    
  }

  ngOnInit(): void {
    this.livecycle.preparedLayoutItem$
      .pipe(takeUntil(this.destroy.destroy$))
      .subscribe((layoutItem) => {
        if (layoutItem) {
          this.livecycle.onEntered();
          this.livecycle.onEvent('mockedevent');
        }
      });
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

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
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
