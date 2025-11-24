import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLayoutLookupComponent } from './lookup.component';
import { Provider } from '@angular/core';
import {
  AutocompleteCreator,
  EDIT_SERVICE, LOOKUP_SERVICE, LookupCreator,
  LookupDescriptor, LookupService, NOTIFICATION_SERVICE, NotificationService, PickvalueCreator, TRANSLATOR
} from '@ballware/meta-services';
import { EditLayoutItem } from '@ballware/meta-model';
import { mockedEditServiceContext } from '../../../test/editservice.spec';
import { Mock } from 'moq.ts';
import { BehaviorSubject, firstValueFrom, take } from 'rxjs';
import { createLookupDelegateBuilder, LOOKUP_DELEGATE_BUILDER_FACTORY } from '../../utils';

describe('EditLayoutLookupComponent', () => {
  let component: EditLayoutLookupComponent;
  let fixture: ComponentFixture<EditLayoutLookupComponent>;

  const mockedTranslator = jest.fn();
  const mockedNotificationService = new Mock<NotificationService>();
  const mockedLookupService = new Mock<LookupService>();
  const mockedEditService = mockedEditServiceContext();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EditLayoutLookupComponent ],
      providers: [
        {
          provide: TRANSLATOR,
          useValue: mockedTranslator
        },
        {
          provide: NOTIFICATION_SERVICE,
          useFactory: () => mockedNotificationService.object()
        },
        {
          provide: LOOKUP_SERVICE,
          useFactory: () => mockedLookupService.object()
        },
        {
          provide: EDIT_SERVICE,
          useFactory: () => mockedEditService.mock.object()
        } as Provider,
        {
          provide: LOOKUP_DELEGATE_BUILDER_FACTORY,
          useFactory: () => (lookups: Record<string, LookupDescriptor | unknown[] | LookupCreator | PickvalueCreator | AutocompleteCreator>) => createLookupDelegateBuilder(lookups)
        }
      ]
    })
    .compileComponents();
  });

  it('should create', () => {
    fixture = TestBed.createComponent(EditLayoutLookupComponent);

    const layoutItem = {
      options: {
          dataMember: 'mockedmember',
          lookup: 'mockedlookup'
      }
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    component = fixture.componentInstance;
    expect(component).toBeTruthy();

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();
  });

  it('should apply options', async () => {
    fixture = TestBed.createComponent(EditLayoutLookupComponent);

    const layoutItem = {
      type: 'lookup',
      options: {
          dataMember: 'mockedmember',
          required: false,
          readonly: false,
          visible: false,
          items: []
      }
    } as EditLayoutItem;

    mockedLookupService.setup((s) => s.lookups$).returns(new BehaviorSubject<Record<string, unknown[]>>({}).asObservable());
    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    component = fixture.componentInstance;
    expect(component).toBeTruthy();

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    await firstValueFrom(component.lookup.ready$.pipe(take(1)));

    expect(component.livecycle.getOption('value')).toBe(null);
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

    const itemsFixture = [{ Id: '1', Name: 'Item 1' }, { Id: '2', Name: 'Item 2' }];

    component.livecycle.setOption('items', itemsFixture);

    await new Promise(process.nextTick);

    expect(component.livecycle.getOption('items')).toStrictEqual(itemsFixture);

    expect(() => component.livecycle.getOption('undefined')).toThrowError('Unsupported option <undefined>');
    expect(() => component.livecycle.setOption('undefined', 'any value')).toThrowError('Unsupported option <undefined>');
  });
});
