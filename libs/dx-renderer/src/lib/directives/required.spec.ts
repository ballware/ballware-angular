import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Component, Provider } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EDIT_SERVICE } from '@ballware/meta-services';
import { mockedEditServiceContext } from '../../test/editservice.spec';
import { Destroy, EditItemLivecycle } from '@ballware/renderer-commons';
import { Required } from './required';
import { Validation } from './validation';

@Component({
  selector: 'ballware-edit-required-test',
  template: '',
  styleUrls: [],
  imports: [],
  hostDirectives: [Destroy, { directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, Validation, Required],
  standalone: true
})
class EditRequiredTestComponent {

  constructor(
    public livecycle: EditItemLivecycle) {
    
  }
}

describe('Required', () => {
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

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    expect(component.livecycle.getOption('required')).toBe(true);

    component.livecycle.setOption('required', false);

    expect(component.livecycle.getOption('required')).toBe(false);
  });
});
