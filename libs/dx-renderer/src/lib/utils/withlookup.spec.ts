import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Component, Inject, Input, OnInit, Provider } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EDIT_SERVICE, EditItemRef, EditService, LOOKUP_SERVICE, LookupCreator, LookupDescriptor, LookupService, LookupStoreDescriptor, NOTIFICATION_SERVICE, NotificationService } from '@ballware/meta-services';
import { BehaviorSubject, firstValueFrom, Subject, takeUntil } from 'rxjs';
import { WithDestroy } from './withdestroy';
import { WithEditItemLifecycle } from './withedititemlivecycle';
import { mockedEditServiceContext } from '../../test/editservice.spec';
import { WithLookup } from './withlookup';
import { mockedLookupServiceContext } from '../../test/lookupservice.spec';
import { Mock } from 'moq.ts';
import { subscribe } from 'diagnostics_channel';

@Component({
  selector: 'ballware-edit-lookup-test',
  template: '',
  styleUrls: [],
  imports: [],
  standalone: true
})
class EditLookupTestComponent extends WithLookup(WithEditItemLifecycle(WithDestroy())) implements OnInit, EditItemRef {

  @Input() initialLayoutItem?: EditLayoutItem;

  public layoutItem: EditLayoutItem|undefined;

  public lookupItems$: Subject<Record<string, unknown>[]> = new Subject<Record<string, unknown>[]>();

  constructor(
    @Inject(LOOKUP_SERVICE) private lookupService: LookupService,
    @Inject(NOTIFICATION_SERVICE) private notificationService: NotificationService,
    @Inject(EDIT_SERVICE) private editService: EditService) {
    super();
  }

  ngOnInit(): void {
    if (this.initialLayoutItem) {
      this.initLifecycle(this.initialLayoutItem, this.editService, this);

      this.preparedLayoutItem$
        .pipe(takeUntil(this.destroy$))
        .subscribe((layoutItem) => {
          if (layoutItem) {
            this.initLookup(layoutItem, this.editService, this.lookupService, this.notificationService)
              .subscribe(() => {
                this.dataSource?.load()
                  .then(() => {
                    this.lookupItems$.next(this.dataSource?.items() as Record<string, unknown>[]);
                  });
              });

            this.layoutItem = layoutItem;
          }
        });
    }
  }
}

@Component({
  selector: 'ballware-edit-static-lookup-test',
  template: '',
  styleUrls: [],
  imports: [],
  standalone: true
})
class EditStaticLookupTestComponent extends WithLookup(WithEditItemLifecycle(WithDestroy())) implements OnInit, EditItemRef {

  @Input() initialLayoutItem?: EditLayoutItem;

  public layoutItem: EditLayoutItem|undefined;

  public lookupItems$: Subject<Record<string, unknown>[]> = new Subject<Record<string, unknown>[]>();

  constructor(
    @Inject(EDIT_SERVICE) private editService: EditService) {
    super();
  }

  ngOnInit(): void {
    if (this.initialLayoutItem) {
      this.initLifecycle(this.initialLayoutItem, this.editService, this);

      this.preparedLayoutItem$
        .pipe(takeUntil(this.destroy$))
        .subscribe((layoutItem) => {
          if (layoutItem) {
            this.initStaticLookup(layoutItem, this.editService)
              .subscribe(() => {
                this.dataSource?.load()
                  .then(() => {
                    this.lookupItems$.next(this.dataSource?.items() as Record<string, unknown>[]);
                  });
              });

            this.layoutItem = layoutItem;
          }
        });
    }
  }
}

describe('WithLookup', () => {
  let lookupComponent: EditLookupTestComponent;
  let lookupFixture: ComponentFixture<EditLookupTestComponent>;

  let staticLookupComponent: EditStaticLookupTestComponent;
  let staticLookupFixture: ComponentFixture<EditStaticLookupTestComponent>;
  
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
        options: {
          dataMember: 'mockedmember',
          lookup: 'mockedlookup'
        }
    } as EditLayoutItem;
    
    const lookupList = [{ Id: '1',  Text: 'Item 1' }, { Id: '2',  Text: 'Item 2' }];

    lookupListFn.mockReturnValue(new BehaviorSubject(lookupList));

    lookupComponent = lookupFixture.componentInstance;   
    expect(lookupComponent).toBeTruthy();

    lookupComponent.initialLayoutItem = layoutItem;
    lookupFixture.detectChanges();

    const receivedItems = await firstValueFrom(lookupComponent.lookupItems$);

    expect(lookupListFn).toHaveBeenCalledTimes(1);
    expect(receivedItems).toEqual(lookupList);
  });

  it('should create with lookup creator', async () => {
    lookupFixture = TestBed.createComponent(EditLookupTestComponent);
    
    const lookupByIdFn = jest.fn();
    const lookupListFn = jest.fn();

    mockedLookupService.lookups$.next({
      'mockedlookup': (param: string | Array<string>) => ({
        type: 'lookup',
        store: {
          byIdFunc: lookupByIdFn,
          listFunc: lookupListFn
        } as LookupStoreDescriptor
      } as LookupDescriptor)
    });

    const layoutItem = {
        options: {
          dataMember: 'mockedmember',
          lookup: 'mockedlookup',
          lookupParam: 'mockedParam'
        }
    } as EditLayoutItem;
    
    const lookupList = [{ Id: '1',  Text: 'Item 1' }, { Id: '2',  Text: 'Item 2' }];

    lookupListFn.mockReturnValue(new BehaviorSubject(lookupList));

    lookupComponent = lookupFixture.componentInstance;   
    expect(lookupComponent).toBeTruthy();

    lookupComponent.initialLayoutItem = layoutItem;
    lookupFixture.detectChanges();

    const receivedItems = await firstValueFrom(lookupComponent.lookupItems$);

    expect(lookupListFn).toHaveBeenCalledTimes(1);
    expect(receivedItems).toEqual(lookupList);
  });

  it('should create with static list', async () => {
    staticLookupFixture = TestBed.createComponent(EditStaticLookupTestComponent);
    
    const lookupList = [{ Value: '1',  Text: 'Item 1' }, { Value: '2',  Text: 'Item 2' }];
    
    const layoutItem = {
        options: {
          dataMember: 'mockedmember',
          items: lookupList
        }
    } as EditLayoutItem;
    
    staticLookupComponent = staticLookupFixture.componentInstance;   
    expect(staticLookupComponent).toBeTruthy();

    staticLookupComponent.initialLayoutItem = layoutItem;
    staticLookupFixture.detectChanges();

    const receivedItems = await firstValueFrom(staticLookupComponent.lookupItems$);

    expect(receivedItems).toEqual(lookupList);
  });
});
