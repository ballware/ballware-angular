import { ComponentFixture, TestBed } from '@angular/core/testing';

import { of } from 'rxjs';
import { It, Mock } from 'moq.ts';

import { EditLayoutTextComponent } from './text.component';
import { ComponentRef, Provider } from '@angular/core';
import { EDIT_SERVICE, RESPONSIVE_SERVICE, ResponsiveService, SCREEN_SIZE, TRANSLATOR } from '@ballware/meta-services';
import { EditLayoutItem } from '@ballware/meta-model';
import { mockedEditServiceContext } from '../../../test/editservice.spec';
import { I18NEXT_SERVICE, ITranslationService } from 'angular-i18next';

describe('EditLayoutTextComponent', () => {
  let component: EditLayoutTextComponent;
  let componentRef: ComponentRef<EditLayoutTextComponent>;
  let fixture: ComponentFixture<EditLayoutTextComponent>;

  const mockedTranslator = jest.fn();

  const mockedTranslationService = new Mock<ITranslationService>()
    .setup(instance => instance.t(It.IsAny<string>())).returns('mocked text');
    
  const mockedResponsiveService = new Mock<ResponsiveService>()
    .setup(instance => instance.onResize$).returns(of(SCREEN_SIZE.XL));
  const mockedEditService = mockedEditServiceContext();
          
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EditLayoutTextComponent ],
      providers: [        
        {
          provide: I18NEXT_SERVICE,
          useFactory: () => mockedTranslationService.object()
        },
                {
          provide: TRANSLATOR,
          useValue: mockedTranslator
        },
        {
          provide: RESPONSIVE_SERVICE,
          useFactory: () => mockedResponsiveService.object()
        },
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
    componentRef = fixture.componentRef;   
    expect(component).toBeTruthy();

    componentRef.setInput('initialLayoutItem', layoutItem);
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
    componentRef = fixture.componentRef;
    expect(component).toBeTruthy();

    componentRef.setInput('initialLayoutItem', layoutItem);
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
    componentRef = fixture.componentRef;
    expect(component).toBeTruthy();

    componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();
    
    expect(component.livecycle.getOption('value')).toBe("");
    expect(component.livecycle.getOption('required')).toBe(false);
    expect(component.livecycle.getOption('readonly')).toBe(false);
    expect(component.livecycle.getOption('visible')).toBe(false);

    component.livecycle.setOption('value', 'some text');
    expect(component.livecycle.getOption('value')).toBe('some text');

    component.livecycle.setOption('required', true);
    expect(component.livecycle.getOption('required')).toBe(true);

    component.livecycle.setOption('readonly', true);
    expect(component.livecycle.getOption('readonly')).toBe(true);

    component.livecycle.setOption('visible', true);
    expect(component.livecycle.getOption('visible')).toBe(true);

    expect(() => component.livecycle.getOption('undefined')).toThrowError('Unsupported option <undefined>');
    expect(() => component.livecycle.setOption('undefined', 'any value')).toThrowError('Unsupported option <undefined>');
    
  });
});
