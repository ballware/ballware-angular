import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Component, Inject, OnInit, Provider } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EDIT_SERVICE, EditService, LOOKUP_SERVICE, LookupDescriptor, LookupService, LookupStoreDescriptor, NOTIFICATION_SERVICE, NotificationService } from '@ballware/meta-services';
import { BehaviorSubject, firstValueFrom, Subject, takeUntil } from 'rxjs';
import { Destroy, EditItemLivecycle } from '@ballware/renderer-commons';
import { mockedEditServiceContext } from '../../test/editservice.spec';
import { Lookup } from './lookup';
import { mockedLookupServiceContext } from '../../test/lookupservice.spec';
import { Mock } from 'moq.ts';

@Component({
  selector: 'ballware-edit-lookup-test',
  template: '',
  styleUrls: [],
  imports: [],
  hostDirectives: [Destroy, { directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, Lookup],
  standalone: true
})
class EditLookupTestComponent implements OnInit {

  public lookupItems$: Subject<Record<string, unknown>[]> = new Subject<Record<string, unknown>[]>();

  constructor(
    private destroy: Destroy,
    private lookup: Lookup,
    @Inject(LOOKUP_SERVICE) private lookupService: LookupService,
    @Inject(NOTIFICATION_SERVICE) private notificationService: NotificationService,
    @Inject(EDIT_SERVICE) private editService: EditService) {
  }

  ngOnInit(): void {

    this.lookup.dataSource$
      .pipe(takeUntil(this.destroy.destroy$))
      .subscribe((dataSource) => {
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
        options: {
          dataMember: 'mockedmember',
          lookup: 'mockedlookup'
        }
    } as EditLayoutItem;
    
    const lookupList = [{ Id: '1',  Text: 'Item 1' }, { Id: '2',  Text: 'Item 2' }];

    lookupListFn.mockReturnValue(new BehaviorSubject(lookupList));

    lookupComponent = lookupFixture.componentInstance;   
    expect(lookupComponent).toBeTruthy();

    lookupFixture.componentRef.setInput('initialLayoutItem' ,layoutItem);
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

    lookupFixture.componentRef.setInput('initialLayoutItem', layoutItem);
    lookupFixture.detectChanges();

    const receivedItems = await firstValueFrom(lookupComponent.lookupItems$);

    expect(lookupListFn).toHaveBeenCalledTimes(1);
    expect(receivedItems).toEqual(lookupList);
  });

  it('should create with static list', async () => {
    lookupFixture = TestBed.createComponent(EditLookupTestComponent);
    
    const lookupList = [{ Value: '1',  Text: 'Item 1' }, { Value: '2',  Text: 'Item 2' }];
    
    const layoutItem = {
        options: {
          dataMember: 'mockedmember',
          items: lookupList
        }
    } as EditLayoutItem;
    
    lookupComponent = lookupFixture.componentInstance;   
    expect(lookupComponent).toBeTruthy();

    lookupFixture.componentRef.setInput('initialLayoutItem', layoutItem);
    lookupFixture.detectChanges();

    const receivedItems = await firstValueFrom(lookupComponent.lookupItems$);

    expect(receivedItems).toEqual(lookupList);
  });
});
