import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Component, Input, Provider } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EDIT_SERVICE } from '@ballware/meta-services';
import { Destroy } from './destroy';
import { EditItemLivecycle } from './edititemlivecycle';
import { mockedEditServiceContext } from '../../test/editservice.spec';
import { StringValue } from './value';

@Component({
  selector: 'lib-edit-value-test',
  template: '',
  styleUrls: [],
  imports: [],
  hostDirectives: [Destroy, { directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, StringValue],
  standalone: true
})
class EditValueTestComponent {

  constructor(
    public livecycle: EditItemLivecycle, public value: StringValue) {    
  }
}

describe('Value', () => {
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

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);

    mockedEditService.getValue.mockReturnValueOnce("initialvalue");

    fixture.detectChanges();

    expect(component.value.value).toBe("initialvalue");

    mockedEditService.getValue.mockReturnValueOnce("refreshedvalue");

    component.value.refreshValue();

    expect(component.value.value).toBe("refreshedvalue");

    component.value.value = 'changedvalue';
       
    expect(mockedEditService.editorValueChanged).toBeCalledWith({ dataMember: 'mockedmember', value: 'changedvalue', notify: true});

    component.value.setValueWithoutNotification('notnotifiedvalue');

    mockedEditService.editorValueChanged.mockClear();

    expect(component.value.value).toBe("notnotifiedvalue");
    expect(mockedEditService.editorValueChanged).toBeCalledTimes(0);
  });
});
