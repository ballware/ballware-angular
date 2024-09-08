import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLayoutTextComponent } from './text.component';
import { Provider } from '@angular/core';
import { EDIT_SERVICE } from '@ballware/meta-services';
import { EditLayoutItem } from '@ballware/meta-model';
import { mockedEditServiceContext } from '../../../test/editservice.spec';

describe('EditLayoutTextComponent', () => {
  let component: EditLayoutTextComponent;
  let fixture: ComponentFixture<EditLayoutTextComponent>;

  const mockedEditService = mockedEditServiceContext();
        
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EditLayoutTextComponent ],
      providers: [        
        {
          provide: EDIT_SERVICE,
          useFactory: () => mockedEditService.mock.object()
        } as Provider         
      ]
    })
    .compileComponents();
  });

  it('should create text', () => {
    fixture = TestBed.createComponent(EditLayoutTextComponent);

    const layoutItem = {
      type: 'text',
      options: {
          dataMember: 'mockedmember',
      }
    } as EditLayoutItem;
    
    component = fixture.componentInstance;   
    expect(component).toBeTruthy();

    component.initialLayoutItem = layoutItem;
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should create mail', () => {
    fixture = TestBed.createComponent(EditLayoutTextComponent);

    const layoutItem = {
      type: 'mail',
      options: {
          dataMember: 'mockedmember',
      }
    } as EditLayoutItem;
    
    component = fixture.componentInstance;   
    expect(component).toBeTruthy();

    component.initialLayoutItem = layoutItem;
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should apply options', () => {
    fixture = TestBed.createComponent(EditLayoutTextComponent);

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

    expect(component.getOption('value')).toBe("");
    expect(component.getOption('required')).toBe(false);
    expect(component.getOption('readonly')).toBe(false);
    expect(component.getOption('visible')).toBe(false);

    component.setOption('value', 'some text');
    expect(component.getOption('value')).toBe('some text');

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
