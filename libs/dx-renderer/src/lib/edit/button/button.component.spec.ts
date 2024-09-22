import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLayoutButtonComponent } from './button.component';
import { Provider } from '@angular/core';
import { EDIT_SERVICE } from '@ballware/meta-services';
import { EditLayoutItem } from '@ballware/meta-model';
import { mockedEditServiceContext } from '../../../test/editservice.spec';

describe('EditLayoutButtonComponent', () => {
  let component: EditLayoutButtonComponent;
  let fixture: ComponentFixture<EditLayoutButtonComponent>;

  const mockedEditService = mockedEditServiceContext();
        
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EditLayoutButtonComponent ],
      providers: [        
        {
          provide: EDIT_SERVICE,
          useFactory: () => mockedEditService.mock.object()
        } as Provider         
      ]
    })
    .compileComponents();
  });

  it('should create', () => {
    fixture = TestBed.createComponent(EditLayoutButtonComponent);

    const layoutItem = {
        options: {
            dataMember: 'mockedmember'
        }
    } as EditLayoutItem;
    
    component = fixture.componentInstance;   
    expect(component).toBeTruthy();

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should apply options', () => {
    fixture = TestBed.createComponent(EditLayoutButtonComponent);

    const layoutItem = {
        options: {
            dataMember: 'mockedmember',
            readonly: false,            
            visible: false
        }
    } as EditLayoutItem;
    
    component = fixture.componentInstance;   
    expect(component).toBeTruthy();

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    expect(component.livecycle.getOption('readonly')).toBe(false);
    expect(component.livecycle.getOption('visible')).toBe(false);
    
    component.livecycle.setOption('readonly', true);
    expect(component.livecycle.getOption('readonly')).toBe(true);

    component.livecycle.setOption('visible', true);
    expect(component.livecycle.getOption('visible')).toBe(true);

    expect(() => component.livecycle.getOption('undefined')).toThrowError('Unsupported option <undefined>');
    expect(() => component.livecycle.setOption('undefined', 'any value')).toThrowError('Unsupported option <undefined>');
  });

  it('should trigger click event', () => {    
    fixture = TestBed.createComponent(EditLayoutButtonComponent);

    const layoutItem = {
        options: {
            dataMember: 'mockedmember',
            readonly: false,            
            visible: true
        }
    } as EditLayoutItem;
    
    component = fixture.componentInstance;   
    expect(component).toBeTruthy();

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    component.livecycle.onEvent('click');

    expect(mockedEditService.editorEvent).toBeCalledTimes(1);
    expect(mockedEditService.editorEvent).toBeCalledWith({ dataMember: 'mockedmember', event: 'click'});
  });
});
