import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLayoutTextareaComponent } from './textarea.component';
import { Provider } from '@angular/core';
import { EDIT_SERVICE, RESPONSIVE_SERVICE, ResponsiveService, SCREEN_SIZE, TRANSLATOR } from '@ballware/meta-services';
import { EditLayoutItem } from '@ballware/meta-model';
import { mockedEditServiceContext } from '../../../test/editservice.spec';
import { It, Mock } from 'moq.ts';
import { BehaviorSubject } from 'rxjs';
import { SPEECHRECOGNITION_SERVICE, SpeechRecognitionService } from '@ballware/renderer-commons';
import { I18NEXT_SERVICE, ITranslationService } from 'angular-i18next';

describe('EditLayoutTextareaComponent', () => {
  let component: EditLayoutTextareaComponent;
  let fixture: ComponentFixture<EditLayoutTextareaComponent>;

  const mockedTranslator = jest.fn();
  const mockedTranslationService = new Mock<ITranslationService>()
    .setup(instance => instance.t(It.IsAny<string>())).returns('mocked text');

  const mockedResponsiveService = new Mock<ResponsiveService>();
  mockedResponsiveService.setup(m => m.onResize$).returns(new BehaviorSubject(SCREEN_SIZE.XL));

  const mockedSpeechRecognitionService = new Mock<SpeechRecognitionService>();
  mockedSpeechRecognitionService.setup(m => m.available).returns(false);

  const mockedEditService = mockedEditServiceContext();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EditLayoutTextareaComponent ],
      providers: [
        {
          provide: I18NEXT_SERVICE,
          useFactory: () => mockedTranslationService.object()
        } as Provider,
        {
          provide: TRANSLATOR,
          useValue: mockedTranslator
        },
        {
          provide: RESPONSIVE_SERVICE,
          useFactory: () => mockedResponsiveService.object()
        } as Provider,
        {
          provide: SPEECHRECOGNITION_SERVICE,
          useFactory: () => mockedSpeechRecognitionService.object()
        } as Provider,
        {
          provide: EDIT_SERVICE,
          useFactory: () => mockedEditService.mock.object()
        } as Provider
      ]
    })
    .compileComponents();
  });

  it('should create', () => {
    fixture = TestBed.createComponent(EditLayoutTextareaComponent);

    const layoutItem = {
      options: {
          dataMember: 'mockedmember',
      }
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    component = fixture.componentInstance;
    expect(component).toBeTruthy();

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should apply options', () => {
    fixture = TestBed.createComponent(EditLayoutTextareaComponent);

    const layoutItem = {
      options: {
          dataMember: 'mockedmember',
          required: false,
          readonly: false,
          visible: false
      }
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    component = fixture.componentInstance;
    expect(component).toBeTruthy();

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
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
