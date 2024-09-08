import { ComponentFixture, TestBed } from '@angular/core/testing';
import { when } from 'jest-when';

import { EditLayoutDatetimeComponent } from './datetime.component';
import { Provider } from '@angular/core';
import { EDIT_SERVICE, TRANSLATOR } from '@ballware/meta-services';
import { EditLayoutItem } from '@ballware/meta-model';
import { mockedEditServiceContext } from '../../../test/editservice.spec';

describe('EditLayoutDatetimeComponent', () => {
  let component: EditLayoutDatetimeComponent;
  let fixture: ComponentFixture<EditLayoutDatetimeComponent>;

  const mockedTranslator = jest.fn();
  const mockedEditService = mockedEditServiceContext();

  when(mockedTranslator).calledWith('format.date').mockReturnValue('MM/dd/yyyy');
  when(mockedTranslator).calledWith('format.datetime').mockReturnValue('MM/dd/yyyy HH:mm:ss');
        
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EditLayoutDatetimeComponent ],
      providers: [        
        {
          provide: TRANSLATOR,
          useValue: mockedTranslator
        },
        {
          provide: EDIT_SERVICE,
          useFactory: () => mockedEditService.mock.object()
        } as Provider         
      ]
    })
    .compileComponents();
  });

  it('should create date', () => {
    fixture = TestBed.createComponent(EditLayoutDatetimeComponent);

    const layoutItem = {
      type: 'date',
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

  it('should create datetime', () => {
    fixture = TestBed.createComponent(EditLayoutDatetimeComponent);

    const layoutItem = {
      type: 'datetime',
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
    fixture = TestBed.createComponent(EditLayoutDatetimeComponent);

    const layoutItem = {
      type: 'datetime',
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

    expect(component.getOption('value')).toBe(null);
    expect(component.getOption('required')).toBe(false);
    expect(component.getOption('readonly')).toBe(false);
    expect(component.getOption('visible')).toBe(false);

    component.setOption('value', Date.parse('2024-01-01T13:00:00'));
    expect(component.getOption('value')).toBe(Date.parse('2024-01-01T13:00:00'));

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
