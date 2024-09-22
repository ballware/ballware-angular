import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLayoutNumberComponent, NumberItemOptions } from './number.component';
import { Provider } from '@angular/core';
import { EDIT_SERVICE } from '@ballware/meta-services';
import { EditLayoutItem } from '@ballware/meta-model';
import { mockedEditServiceContext } from '../../../test/editservice.spec';

describe('EditLayoutNumberComponent', () => {
  let component: EditLayoutNumberComponent;
  let fixture: ComponentFixture<EditLayoutNumberComponent>;

  const mockedEditService = mockedEditServiceContext();
        
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EditLayoutNumberComponent ],
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
    fixture = TestBed.createComponent(EditLayoutNumberComponent);

    const layoutItem = {
      type: 'text',
      options: {
        dataMember: 'mockedmember',
        itemoptions: {
          min: 0,
          max: 100
        } as NumberItemOptions
      }
    } as EditLayoutItem;
    
    component = fixture.componentInstance;   
    expect(component).toBeTruthy();

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should apply options', () => {
    fixture = TestBed.createComponent(EditLayoutNumberComponent);

    const layoutItem = {
      options: {
          dataMember: 'mockedmember',
          required: false,
          readonly: false,            
          visible: false
      }
    } as EditLayoutItem;
    
    component = fixture.componentInstance;   
    expect(component).toBeTruthy();

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    expect(component.livecycle.getOption('value')).toBe(0);
    expect(component.livecycle.getOption('required')).toBe(false);
    expect(component.livecycle.getOption('readonly')).toBe(false);
    expect(component.livecycle.getOption('visible')).toBe(false);

    component.livecycle.setOption('value', 42);
    expect(component.livecycle.getOption('value')).toBe(42);

    component.livecycle.setOption('required', true);
    expect(component.livecycle.getOption('required')).toBe(true);

    component.livecycle.setOption('readonly', true);
    expect(component.livecycle.getOption('readonly')).toBe(true);

    component.livecycle.setOption('visible', true);
    expect(component.livecycle.getOption('visible')).toBe(true);

    component.livecycle.setOption('min', 2);
    expect(component.livecycle.getOption('min')).toBe(2);

    component.livecycle.setOption('max', 98);
    expect(component.livecycle.getOption('max')).toBe(98);

    expect(() => component.livecycle.getOption('undefined')).toThrowError('Unsupported option <undefined>');
    expect(() => component.livecycle.setOption('undefined', 'any value')).toThrowError('Unsupported option <undefined>');
  });
});
