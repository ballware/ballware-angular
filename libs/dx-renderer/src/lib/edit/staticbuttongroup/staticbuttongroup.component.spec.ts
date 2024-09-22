import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLayoutStaticButtonGroupComponent } from './staticbuttongroup.component';
import { Provider } from '@angular/core';
import { EDIT_SERVICE, LOOKUP_SERVICE, LookupService, NOTIFICATION_SERVICE, NotificationService } from '@ballware/meta-services';
import { EditLayoutItem } from '@ballware/meta-model';
import { mockedEditServiceContext } from '../../../test/editservice.spec';
import { Mock } from 'moq.ts';

describe('EditLayoutStaticButtonGroupComponent', () => {
  let component: EditLayoutStaticButtonGroupComponent;
  let fixture: ComponentFixture<EditLayoutStaticButtonGroupComponent>;

  const mockedNotificationService = new Mock<NotificationService>();
  const mockedLookupService = new Mock<LookupService>();
  const mockedEditService = mockedEditServiceContext();
        
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ EditLayoutStaticButtonGroupComponent ],
      providers: [        
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
        } as Provider         
      ]
    })
    .compileComponents();
  });

  it('should create', () => {
    fixture = TestBed.createComponent(EditLayoutStaticButtonGroupComponent);

    const layoutItem = {
      options: {
          dataMember: 'mockedmember',
          lookup: 'mockedlookup'
      }
    } as EditLayoutItem;
    
    component = fixture.componentInstance;   
    expect(component).toBeTruthy();

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();
  });

  it('should apply options', async () => {
    fixture = TestBed.createComponent(EditLayoutStaticButtonGroupComponent);

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

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    expect(component.livecycle.getOption('value')).toStrictEqual(null);
    expect(component.livecycle.getOption('readonly')).toBe(false);
    expect(component.livecycle.getOption('visible')).toBe(false);

    component.livecycle.setOption('value', '1');
    expect(component.livecycle.getOption('value')).toStrictEqual('1');

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
