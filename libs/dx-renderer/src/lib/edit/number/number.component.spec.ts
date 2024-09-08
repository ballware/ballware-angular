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

    component.initialLayoutItem = layoutItem;
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

    component.initialLayoutItem = layoutItem;
    fixture.detectChanges();

    expect(component.getOption('value')).toBe(0);
    expect(component.getOption('required')).toBe(false);
    expect(component.getOption('readonly')).toBe(false);
    expect(component.getOption('visible')).toBe(false);

    component.setOption('value', 42);
    expect(component.getOption('value')).toBe(42);

    component.setOption('required', true);
    expect(component.getOption('required')).toBe(true);

    component.setOption('readonly', true);
    expect(component.getOption('readonly')).toBe(true);

    component.setOption('visible', true);
    expect(component.getOption('visible')).toBe(true);

    component.setOption('min', 2);
    expect(component.getOption('min')).toBe(2);

    component.setOption('max', 98);
    expect(component.getOption('max')).toBe(98);

    expect(() => component.getOption('undefined')).toThrowError('Unsupported option <undefined>');
    expect(() => component.setOption('undefined', 'any value')).toThrowError('Unsupported option <undefined>');
  });
});
