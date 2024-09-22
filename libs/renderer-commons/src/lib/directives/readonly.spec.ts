import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Component, Provider } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EDIT_SERVICE } from '@ballware/meta-services';
import { mockedEditServiceContext } from '../../test/editservice.spec';
import { Destroy } from './destroy';
import { EditItemLivecycle } from './edititemlivecycle';
import { Readonly } from './readonly';

@Component({
  selector: 'lib-edit-readonly-test',
  template: '',
  styleUrls: [],
  imports: [],
  hostDirectives: [Destroy, { directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, Readonly],
  standalone: true
})
class EditReadonlyTestComponent {
  
  constructor(
    public livecycle: EditItemLivecycle) {
  }
}

describe('WithReadonly', () => {
  let component: EditReadonlyTestComponent;
  let fixture: ComponentFixture<EditReadonlyTestComponent>;
  
  const mockedEditService = mockedEditServiceContext();
        
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EditReadonlyTestComponent ],
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
    fixture = TestBed.createComponent(EditReadonlyTestComponent);
       
    const layoutItem = {
        options: {
            dataMember: 'mockedmember'
        }
    } as EditLayoutItem;
    
    component = fixture.componentInstance;   
    expect(component).toBeTruthy();

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    expect(component.livecycle.getOption('readonly')).toBe(false);

    component.livecycle.setOption('readonly', true);

    expect(component.livecycle.getOption('readonly')).toBe(true);
  });
});
