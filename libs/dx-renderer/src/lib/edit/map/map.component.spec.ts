import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLayoutMapComponent } from './map.component';
import { Provider } from '@angular/core';
import { EDIT_SERVICE, SETTINGS_SERVICE, SettingsService } from '@ballware/meta-services';
import { EditLayoutItem } from '@ballware/meta-model';
import { mockedEditServiceContext } from '../../../test/editservice.spec';
import { BehaviorSubject } from 'rxjs';

describe('EditLayoutMapComponent', () => {
  let component: EditLayoutMapComponent;
  let fixture: ComponentFixture<EditLayoutMapComponent>;

  const mockedEditService = mockedEditServiceContext();
        
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EditLayoutMapComponent ],      
      providers: [        
        {
          provide: SETTINGS_SERVICE,
          useValue: {  
            googlekey$: new BehaviorSubject<string|undefined>('unlicensed')
          }
        },
        {
          provide: EDIT_SERVICE,
          useFactory: () => mockedEditService.mock.object()
        } as Provider         
      ]
    })
    .compileComponents();
  });

  it('should create', () => {
    fixture = TestBed.createComponent(EditLayoutMapComponent);

    const layoutItem = {
      type: 'map',
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
    fixture = TestBed.createComponent(EditLayoutMapComponent);

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

    expect(component.livecycle.getOption('value')).toBe(null);    
    expect(component.livecycle.getOption('readonly')).toBe(false);
    expect(component.livecycle.getOption('visible')).toBe(false);

    component.livecycle.setOption('value', { lat: 0, lng: 0 });
    expect(component.livecycle.getOption('value')).toStrictEqual({ lat: 0, lng: 0 });

    component.livecycle.setOption('readonly', true);
    expect(component.livecycle.getOption('readonly')).toBe(true);

    component.livecycle.setOption('visible', true);
    expect(component.livecycle.getOption('visible')).toBe(true);

    expect(() => component.livecycle.getOption('undefined')).toThrowError('Unsupported option <undefined>');
    expect(() => component.livecycle.setOption('undefined', 'any value')).toThrowError('Unsupported option <undefined>');
  });
});
