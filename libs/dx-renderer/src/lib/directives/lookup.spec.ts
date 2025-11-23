import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Component, DestroyRef, Inject, OnInit, Provider } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EDIT_SERVICE, EditService, LOOKUP_SERVICE, LookupDescriptor, LookupService, LookupStoreDescriptor, NOTIFICATION_SERVICE, NotificationService } from '@ballware/meta-services';
import { BehaviorSubject, firstValueFrom, Subject, take } from 'rxjs';
import { EditItemLivecycle } from '@ballware/renderer-commons';
import { mockedEditServiceContext } from '../../test/editservice.spec';
import { Lookup } from './lookup';
import { mockedLookupServiceContext } from '../../test/lookupservice.spec';
import { Mock } from 'moq.ts';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'ballware-edit-lookup-test',
    template: '',
    styleUrls: [],
    imports: [],
    hostDirectives: [{ directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, Lookup]
})
class EditLookupTestComponent implements OnInit {

  public lookupItems$: Subject<(Record<string, unknown>[])|undefined> = new BehaviorSubject<(Record<string, unknown>[])|undefined>(undefined);

  constructor(
    private destroy: DestroyRef,
    public lookup: Lookup,
    @Inject(LOOKUP_SERVICE) private lookupService: LookupService,
    @Inject(NOTIFICATION_SERVICE) private notificationService: NotificationService,
    @Inject(EDIT_SERVICE) private editService: EditService) {
  }

  ngOnInit(): void {

    this.lookup.dataSource$.pipe(
      takeUntilDestroyed(this.destroy)
    ).subscribe((dataSource) => {
      dataSource?.load()
        .then(() => {
          this.lookupItems$.next(dataSource?.items() as Record<string, unknown>[]);
        });
    });
  }
}

describe('Lookup', () => {
  let lookupComponent: EditLookupTestComponent;
  let lookupFixture: ComponentFixture<EditLookupTestComponent>;

  const mockedNotificationService = new Mock<NotificationService>();
  const mockedLookupService = mockedLookupServiceContext();
  const mockedEditService = mockedEditServiceContext();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EditLookupTestComponent ],
      providers: [
        {
          provide: NOTIFICATION_SERVICE,
          useFactory: () => mockedNotificationService.object()
        },
        {
          provide: LOOKUP_SERVICE,
          useFactory: () => mockedLookupService.mock.object()
        },
        {
          provide: EDIT_SERVICE,
          useFactory: () => mockedEditService.mock.object()
        } as Provider
      ]
    })
    .compileComponents();
  });

  it('should create with lookup descriptor', async () => {
    lookupFixture = TestBed.createComponent(EditLookupTestComponent);

    const lookupByIdFn = jest.fn();
    const lookupListFn = jest.fn();

    mockedLookupService.lookups$.next({
      'mockedlookup': {
        type: 'lookup',
        store: {
          byIdFunc: lookupByIdFn,
          listFunc: lookupListFn
        } as LookupStoreDescriptor
      } as LookupDescriptor
    });

    const layoutItem = {
        type: 'selectbox',
        options: {
          dataMember: 'mockedmember',
          lookup: 'mockedlookup'
        }
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    const lookupList = [{ Id: '1',  Text: 'Item 1' }, { Id: '2',  Text: 'Item 2' }];

    lookupListFn.mockReturnValue(new BehaviorSubject(lookupList));

    lookupComponent = lookupFixture.componentInstance;
    expect(lookupComponent).toBeTruthy();

    lookupFixture.componentRef.setInput('initialLayoutItem' ,layoutItem);
    lookupFixture.detectChanges();

    await firstValueFrom(lookupComponent.lookup.ready$.pipe(take(1)));

    const receivedItems = await firstValueFrom(lookupComponent.lookupItems$);

    expect(lookupListFn).toHaveBeenCalledTimes(1);
    expect(receivedItems).toEqual(lookupList);
  });

  it('should create with lookup creator', async () => {
    lookupFixture = TestBed.createComponent(EditLookupTestComponent);

    const lookupByIdFn = jest.fn();
    const lookupListFn = jest.fn();

    mockedLookupService.lookups$.next({
      'mockedlookup': (_param: string | Array<string>) => ({
        type: 'lookup',
        store: {
          byIdFunc: lookupByIdFn,
          listFunc: lookupListFn
        } as LookupStoreDescriptor
      } as LookupDescriptor)
    });

    const layoutItem = {
        type: 'selectbox',
        options: {
          dataMember: 'mockedmember',
          lookup: 'mockedlookup',
          lookupParam: 'mockedParam'
        }
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    const lookupList = [{ Id: '1',  Text: 'Item 1' }, { Id: '2',  Text: 'Item 2' }];

    lookupListFn.mockReturnValue(new BehaviorSubject(lookupList));

    lookupComponent = lookupFixture.componentInstance;
    expect(lookupComponent).toBeTruthy();

    lookupFixture.componentRef.setInput('initialLayoutItem', layoutItem);
    lookupFixture.detectChanges();

    await firstValueFrom(lookupComponent.lookup.ready$.pipe(take(1)));

    const receivedItems = await firstValueFrom(lookupComponent.lookupItems$);

    expect(lookupListFn).toHaveBeenCalledTimes(1);
    expect(receivedItems).toEqual(lookupList);
  });

  it('should create with static list', async () => {
    lookupFixture = TestBed.createComponent(EditLookupTestComponent);

    const lookupList = [{ Value: '1',  Text: 'Item 1' }, { Value: '2',  Text: 'Item 2' }];

    const layoutItem = {
        type: 'selectbox',
        options: {
          dataMember: 'mockedmember',
          items: lookupList
        }
    } as EditLayoutItem;

    mockedLookupService.lookups$.next({});
    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    lookupComponent = lookupFixture.componentInstance;
    expect(lookupComponent).toBeTruthy();

    lookupFixture.componentRef.setInput('initialLayoutItem', layoutItem);
    lookupFixture.detectChanges();

    await firstValueFrom(lookupComponent.lookup.ready$.pipe(take(1)));

    const receivedItems = await firstValueFrom(lookupComponent.lookupItems$);

    expect(receivedItems).toEqual(lookupList);
  });

  it('should create with items from member', async () => {
    lookupFixture = TestBed.createComponent(EditLookupTestComponent);

    const lookupList = [{ Id: '1',  Text: 'Item 1' }, { Id: '2',  Text: 'Item 2' }];

    mockedEditService.getValue.mockReturnValue(lookupList);

    const layoutItem = {
        type: 'selectbox',
        options: {
          dataMember: 'mockedmember',
          itemsMember: 'itemsMember'
        }
    } as EditLayoutItem;

    mockedLookupService.lookups$.next({});
    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    lookupComponent = lookupFixture.componentInstance;
    expect(lookupComponent).toBeTruthy();

    lookupFixture.componentRef.setInput('initialLayoutItem', layoutItem);
    lookupFixture.detectChanges();

    await firstValueFrom(lookupComponent.lookup.ready$.pipe(take(1)));

    const receivedItems = await firstValueFrom(lookupComponent.lookupItems$);

    expect(mockedEditService.getValue).toHaveBeenCalledWith({ dataMember: 'itemsMember' });
    expect(receivedItems).toEqual(lookupList);
  });

  it('should handle custom displayExpr and valueExpr', async () => {
    lookupFixture = TestBed.createComponent(EditLookupTestComponent);

    const lookupList = [{ CustomId: '1',  CustomText: 'Item 1' }, { CustomId: '2',  CustomText: 'Item 2' }];

    const layoutItem = {
        type: 'selectbox',
        options: {
          dataMember: 'mockedmember',
          items: lookupList as any,
          displayExpr: 'CustomText',
          valueExpr: 'CustomId'
        }
    } as EditLayoutItem;

    mockedLookupService.lookups$.next({});
    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    lookupComponent = lookupFixture.componentInstance;
    expect(lookupComponent).toBeTruthy();

    lookupFixture.componentRef.setInput('initialLayoutItem', layoutItem);
    lookupFixture.detectChanges();

    await firstValueFrom(lookupComponent.lookup.ready$.pipe(take(1)));

    expect(await firstValueFrom(lookupComponent.lookup.displayExpr$)).toBe('CustomText');
    expect(await firstValueFrom(lookupComponent.lookup.valueExpr$)).toBe('CustomId');
  });

  it('should handle acceptCustomValue option', async () => {
    lookupFixture = TestBed.createComponent(EditLookupTestComponent);

    const lookupList = [{ Value: '1',  Text: 'Item 1' }];

    const layoutItem = {
        type: 'selectbox',
        options: {
          dataMember: 'mockedmember',
          items: lookupList,
          acceptCustomValue: true
        }
    } as EditLayoutItem;

    mockedLookupService.lookups$.next({});
    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    lookupComponent = lookupFixture.componentInstance;

    lookupFixture.componentRef.setInput('initialLayoutItem', layoutItem);
    lookupFixture.detectChanges();

    await firstValueFrom(lookupComponent.lookup.ready$.pipe(take(1)));

    expect(await firstValueFrom(lookupComponent.lookup.acceptCustomValue$)).toBe(true);
  });

  it('should handle hintExpr option', async () => {
    lookupFixture = TestBed.createComponent(EditLookupTestComponent);

    const lookupList = [{ Value: '1',  Text: 'Item 1', Hint: 'Hint 1' }];

    const layoutItem = {
        type: 'selectbox',
        options: {
          dataMember: 'mockedmember',
          items: lookupList,
          hintExpr: 'Hint'
        }
    } as EditLayoutItem;

    mockedLookupService.lookups$.next({});
    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    lookupComponent = lookupFixture.componentInstance;

    lookupFixture.componentRef.setInput('initialLayoutItem', layoutItem);
    lookupFixture.detectChanges();

    await firstValueFrom(lookupComponent.lookup.ready$.pipe(take(1)));

    expect(await firstValueFrom(lookupComponent.lookup.hasLookupItemHint$)).toBe(true);
  });

  it('should handle lookupGroupBy option', async () => {
    lookupFixture = TestBed.createComponent(EditLookupTestComponent);

    const lookupList = [
      { Value: '1',  Text: 'Item 1', Group: 'Group A' },
      { Value: '2',  Text: 'Item 2', Group: 'Group B' }
    ];

    const layoutItem = {
        type: 'selectbox',
        options: {
          dataMember: 'mockedmember',
          items: lookupList,
          lookupGroupBy: 'Group'
        }
    } as EditLayoutItem;

    mockedLookupService.lookups$.next({});
    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    lookupComponent = lookupFixture.componentInstance;

    lookupFixture.componentRef.setInput('initialLayoutItem', layoutItem);
    lookupFixture.detectChanges();

    await firstValueFrom(lookupComponent.lookup.ready$.pipe(take(1)));

    expect(await firstValueFrom(lookupComponent.lookup.grouped$)).toBe(true);
  });

  it('should call getLookupItemKeyValue', async () => {
    lookupFixture = TestBed.createComponent(EditLookupTestComponent);

    const lookupList = [{ Value: '1',  Text: 'Item 1' }];

    const layoutItem = {
        type: 'selectbox',
        options: {
          dataMember: 'mockedmember',
          items: lookupList,
          valueExpr: 'Value'
        }
    } as EditLayoutItem;

    mockedLookupService.lookups$.next({});
    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    lookupComponent = lookupFixture.componentInstance;

    lookupFixture.componentRef.setInput('initialLayoutItem', layoutItem);
    lookupFixture.detectChanges();

    await firstValueFrom(lookupComponent.lookup.ready$.pipe(take(1)));

    const keyValue = lookupComponent.lookup.getLookupItemKeyValue(lookupList[0]);
    expect(keyValue).toBe('1');
  });

  it('should call getLookupItemDisplayValue', async () => {
    lookupFixture = TestBed.createComponent(EditLookupTestComponent);

    const lookupList = [{ Value: '1',  Text: 'Item 1' }];

    const layoutItem = {
        type: 'selectbox',
        options: {
          dataMember: 'mockedmember',
          items: lookupList,
          displayExpr: 'Text'
        }
    } as EditLayoutItem;

    mockedLookupService.lookups$.next({});
    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    lookupComponent = lookupFixture.componentInstance;

    lookupFixture.componentRef.setInput('initialLayoutItem', layoutItem);
    lookupFixture.detectChanges();

    await firstValueFrom(lookupComponent.lookup.ready$.pipe(take(1)));

    const displayValue = lookupComponent.lookup.getLookupItemDisplayValue(lookupList[0]);
    expect(displayValue).toBe('Item 1');
  });

  it('should call getLookupItemHintValue', async () => {
    lookupFixture = TestBed.createComponent(EditLookupTestComponent);

    const lookupList = [{ Value: '1',  Text: 'Item 1', Hint: 'This is a hint' }];

    const layoutItem = {
        type: 'selectbox',
        options: {
          dataMember: 'mockedmember',
          items: lookupList,
          hintExpr: 'Hint'
        }
    } as EditLayoutItem;

    mockedLookupService.lookups$.next({});
    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    lookupComponent = lookupFixture.componentInstance;

    lookupFixture.componentRef.setInput('initialLayoutItem', layoutItem);
    lookupFixture.detectChanges();

    await firstValueFrom(lookupComponent.lookup.ready$.pipe(take(1)));

    const hintValue = lookupComponent.lookup.getLookupItemHintValue(lookupList[0]);
    expect(hintValue).toBe('This is a hint');
  });

  it('should call setLookupItems', async () => {
    lookupFixture = TestBed.createComponent(EditLookupTestComponent);

    const initialLookupList = [{ Value: '1',  Text: 'Item 1' }];
    const newLookupList = [{ Value: '2',  Text: 'Item 2' }, { Value: '3',  Text: 'Item 3' }];

    const layoutItem = {
        type: 'selectbox',
        options: {
          dataMember: 'mockedmember',
          items: initialLookupList
        }
    } as EditLayoutItem;

    mockedLookupService.lookups$.next({});
    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    lookupComponent = lookupFixture.componentInstance;

    lookupFixture.componentRef.setInput('initialLayoutItem', layoutItem);
    lookupFixture.detectChanges();

    await firstValueFrom(lookupComponent.lookup.ready$.pipe(take(1)));

    lookupComponent.lookup.setLookupItems(newLookupList);

    const receivedItems = await firstValueFrom(lookupComponent.lookupItems$);
    expect(receivedItems).toEqual(newLookupList);
  });

  it('should call setAcceptCustomValue', async () => {
    lookupFixture = TestBed.createComponent(EditLookupTestComponent);

    const lookupList = [{ Value: '1',  Text: 'Item 1' }];

    const layoutItem = {
        type: 'selectbox',
        options: {
          dataMember: 'mockedmember',
          items: lookupList,
          acceptCustomValue: false
        }
    } as EditLayoutItem;

    mockedLookupService.lookups$.next({});
    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    lookupComponent = lookupFixture.componentInstance;

    lookupFixture.componentRef.setInput('initialLayoutItem', layoutItem);
    lookupFixture.detectChanges();

    await firstValueFrom(lookupComponent.lookup.ready$.pipe(take(1)));

    expect(await firstValueFrom(lookupComponent.lookup.acceptCustomValue$)).toBe(false);

    lookupComponent.lookup.setAcceptCustomValue(true);

    expect(await firstValueFrom(lookupComponent.lookup.acceptCustomValue$)).toBe(true);
  });

  it('should access getter properties', async () => {
    lookupFixture = TestBed.createComponent(EditLookupTestComponent);

    const lookupList = [{ Value: '1',  Text: 'Item 1' }];

    const layoutItem = {
        type: 'selectbox',
        options: {
          dataMember: 'mockedmember',
          items: lookupList,
          displayExpr: 'Text',
          valueExpr: 'Value',
          acceptCustomValue: true
        }
    } as EditLayoutItem;

    mockedLookupService.lookups$.next({});
    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    lookupComponent = lookupFixture.componentInstance;

    lookupFixture.componentRef.setInput('initialLayoutItem', layoutItem);
    lookupFixture.detectChanges();

    await firstValueFrom(lookupComponent.lookup.ready$.pipe(take(1)));

    expect(lookupComponent.lookup.displayExpr).toBe('Text');
    expect(lookupComponent.lookup.valueExpr).toBe('Value');
    expect(lookupComponent.lookup.acceptCustomValue).toBe(true);
    expect(lookupComponent.lookup.lookupItems).toEqual(lookupList);
    expect(lookupComponent.lookup.dataSource).toBeDefined();
  });

  it('should handle onCustomItemCreating event', async () => {
    lookupFixture = TestBed.createComponent(EditLookupTestComponent);

    const lookupList = [{ Value: '1',  Text: 'Item 1' }];

    const layoutItem = {
        type: 'selectbox',
        options: {
          dataMember: 'mockedmember',
          items: lookupList,
          acceptCustomValue: true
        }
    } as EditLayoutItem;

    mockedLookupService.lookups$.next({});
    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    lookupComponent = lookupFixture.componentInstance;

    lookupFixture.componentRef.setInput('initialLayoutItem', layoutItem);
    lookupFixture.detectChanges();

    await firstValueFrom(lookupComponent.lookup.ready$.pipe(take(1)));

    const mockEvent = {
      text: 'New Item',
      customItem: undefined
    };

    lookupComponent.lookup.onCustomItemCreating(mockEvent);

    expect(mockEvent.customItem).toBeDefined();
  });

  it('should handle API errors via notification service', async () => {
    lookupFixture = TestBed.createComponent(EditLookupTestComponent);

    const lookupByIdFn = jest.fn();
    const lookupListFn = jest.fn();

    mockedLookupService.lookups$.next({
      'mockedlookup': {
        type: 'lookup',
        store: {
          byIdFunc: lookupByIdFn,
          listFunc: lookupListFn
        } as LookupStoreDescriptor
      } as LookupDescriptor
    });

    const layoutItem = {
        type: 'selectbox',
        options: {
          dataMember: 'mockedmember',
          lookup: 'mockedlookup'
        }
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    const errorSubject = new BehaviorSubject<Record<string, unknown>[]>([]);
    lookupListFn.mockReturnValue(errorSubject);

    lookupComponent = lookupFixture.componentInstance;

    lookupFixture.componentRef.setInput('initialLayoutItem', layoutItem);
    lookupFixture.detectChanges();

    await firstValueFrom(lookupComponent.lookup.ready$.pipe(take(1)));

    // Test dass der Lookup-Service aufgerufen wurde
    expect(lookupListFn).toHaveBeenCalled();
  });

  it('should handle lookup with lookupParam option', async () => {
    lookupFixture = TestBed.createComponent(EditLookupTestComponent);

    const lookupByIdFn = jest.fn();
    const lookupListFn = jest.fn();
    const paramValue = 'testParam';

    mockedEditService.getValue.mockReturnValue(paramValue);

    mockedLookupService.lookups$.next({
      'mockedlookup': (_param: string | Array<string>) => ({
        type: 'lookup',
        store: {
          byIdFunc: lookupByIdFn,
          listFunc: lookupListFn
        } as LookupStoreDescriptor
      } as LookupDescriptor)
    });

    const layoutItem = {
        type: 'selectbox',
        options: {
          dataMember: 'mockedmember',
          lookup: 'mockedlookup',
          lookupParam: 'paramMember'
        }
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    const lookupList = [{ Id: '1',  Text: 'Item 1' }];
    lookupListFn.mockReturnValue(new BehaviorSubject(lookupList));

    lookupComponent = lookupFixture.componentInstance;

    lookupFixture.componentRef.setInput('initialLayoutItem', layoutItem);
    lookupFixture.detectChanges();

    await firstValueFrom(lookupComponent.lookup.ready$.pipe(take(1)));

    expect(mockedEditService.getValue).toHaveBeenCalledWith({ dataMember: 'paramMember' });
  });

  it('should register acceptCustomValue option', async () => {
    lookupFixture = TestBed.createComponent(EditLookupTestComponent);

    const lookupList = [{ Value: '1',  Text: 'Item 1' }];

    const layoutItem = {
        type: 'selectbox',
        options: {
          dataMember: 'mockedmember',
          items: lookupList,
          acceptCustomValue: true
        }
    } as EditLayoutItem;

    mockedLookupService.lookups$.next({});
    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    lookupComponent = lookupFixture.componentInstance;
    lookupFixture.componentRef.setInput('initialLayoutItem', layoutItem);
    lookupFixture.detectChanges();

    await firstValueFrom(lookupComponent.lookup.ready$.pipe(take(1)));

    // Verify that the option was registered in the livecycle
    expect(lookupComponent.lookup.acceptCustomValue).toBe(true);
  });

  it('should register items option', async () => {
    lookupFixture = TestBed.createComponent(EditLookupTestComponent);

    const lookupList = [{ Value: '1',  Text: 'Item 1' }];

    const layoutItem = {
        type: 'selectbox',
        options: {
          dataMember: 'mockedmember',
          items: lookupList
        }
    } as EditLayoutItem;

    mockedLookupService.lookups$.next({});
    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    lookupComponent = lookupFixture.componentInstance;
    lookupFixture.componentRef.setInput('initialLayoutItem', layoutItem);
    lookupFixture.detectChanges();

    await firstValueFrom(lookupComponent.lookup.ready$.pipe(take(1)));

    // Verify that the option was registered in the livecycle
    expect(lookupComponent.lookup.lookupItems).toEqual(lookupList);
  });
});

