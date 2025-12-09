import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLayoutRichtextComponent } from './editrichtext.component';
import { Provider } from '@angular/core';
import { EDIT_SERVICE, TRANSLATOR } from '@ballware/meta-services';
import { EditLayoutItem } from '@ballware/meta-model';
import { mockedEditServiceContext } from '../../../../test/editservice.spec';

describe('EditLayoutRichtextComponent', () => {
  let component: EditLayoutRichtextComponent;
  let fixture: ComponentFixture<EditLayoutRichtextComponent>;

  const mockedTranslator = jest.fn();
  const mockedEditService = mockedEditServiceContext();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EditLayoutRichtextComponent ],
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

  it('should create', () => {

    fixture = TestBed.createComponent(EditLayoutRichtextComponent);

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
  });

  it('should apply options', () => {
    fixture = TestBed.createComponent(EditLayoutRichtextComponent);

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

  it('should match snapshot', () => {
    fixture = TestBed.createComponent(EditLayoutRichtextComponent);

    const layoutItem = {
      options: {
          dataMember: 'mockedmember',
          required: true,
          readonly: false,
          visible: true
      }
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    component = fixture.componentInstance;
    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });
});
