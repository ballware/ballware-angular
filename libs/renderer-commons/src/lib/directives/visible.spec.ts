import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Component, Provider } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EDIT_SERVICE } from '@ballware/meta-services';
import { Destroy } from './destroy';
import { EditItemLivecycle } from './edititemlivecycle';
import { mockedEditServiceContext } from '../../test/editservice.spec';
import { Visible } from './visible';

@Component({
  selector: 'lib-edit-visible-test',
  template: '',
  styleUrls: [],
  imports: [],
  hostDirectives: [Destroy, { directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, Visible],
  standalone: true
})
class EditVisibleTestComponent {
  constructor(public livecycle: EditItemLivecycle, public visible: Visible) {}
}

describe('Visible', () => {
  let component: EditVisibleTestComponent;
  let fixture: ComponentFixture<EditVisibleTestComponent>;
  
  const mockedEditService = mockedEditServiceContext();
        
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EditVisibleTestComponent ],
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
    fixture = TestBed.createComponent(EditVisibleTestComponent);
       
    const layoutItem = {
        options: {
            dataMember: 'mockedmember',
            visible: true
        }
    } as EditLayoutItem;
    
    component = fixture.componentInstance;   
    expect(component).toBeTruthy();

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);

    fixture.detectChanges();

    expect(component.livecycle.getOption('visible')).toBe(true);

    component.visible.setVisible(false);

    expect(component.livecycle.getOption('visible')).toBe(false);
  });
});
