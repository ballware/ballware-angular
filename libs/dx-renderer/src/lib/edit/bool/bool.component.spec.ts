import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLayoutBoolComponent } from './bool.component';
import { Provider } from '@angular/core';
import { EDIT_SERVICE } from '@ballware/meta-services';
import { EditLayoutItem } from '@ballware/meta-model';
import { mockedEditServiceContext } from '../../../test/editservice.spec';

describe('EditLayoutBoolComponent', () => {
  let component: EditLayoutBoolComponent;
  let fixture: ComponentFixture<EditLayoutBoolComponent>;

  const mockedEditService = mockedEditServiceContext();
        
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EditLayoutBoolComponent ],
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
    fixture = TestBed.createComponent(EditLayoutBoolComponent);

    const layoutItem = {
        options: {
            dataMember: 'mockedmember'
        }
    } as EditLayoutItem;
    
    component = fixture.componentInstance;   
    expect(component).toBeTruthy();

    component.initialLayoutItem = layoutItem;
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should apply options', () => {
    fixture = TestBed.createComponent(EditLayoutBoolComponent);

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

    expect(component.getOption('value')).toBe(false);
    expect(component.getOption('required')).toBe(false);
    expect(component.getOption('readonly')).toBe(false);
    expect(component.getOption('visible')).toBe(false);

    component.setOption('value', true);
    expect(component.getOption('value')).toBe(true);

    component.setOption('required', true);
    expect(component.getOption('required')).toBe(true);

    component.setOption('readonly', true);
    expect(component.getOption('readonly')).toBe(true);

    component.setOption('visible', true);
    expect(component.getOption('visible')).toBe(true);

    expect(() => component.getOption('undefined')).toThrowError('Unsupported option <undefined>');
    expect(() => component.setOption('undefined', 'any value')).toThrowError('Unsupported option <undefined>');
  });
});
