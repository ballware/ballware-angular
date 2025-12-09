import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditLayoutStatisticComponent } from './editstatistic.component';
import { Provider } from '@angular/core';
import { EDIT_SERVICE, LOOKUP_SERVICE, META_SERVICE, STATISTIC_SERVICE_FACTORY } from '@ballware/meta-services';
import { EditLayoutItem } from '@ballware/meta-model';
import { mockedStatisticServiceContext } from '../../../../test/statisticservice.spec';
import { mockedMetaServiceContext } from '../../../../test/metaservice.spec';
import { mockedLookupServiceContext } from '../../../../test/lookupservice.spec';
import { mockedEditServiceContext } from '../../../../test/editservice.spec';

describe('EditLayoutStatisticComponent', () => {
  let component: EditLayoutStatisticComponent;
  let fixture: ComponentFixture<EditLayoutStatisticComponent>;
  let mockedStatisticService: ReturnType<typeof mockedStatisticServiceContext>;
  let mockedMetaService: ReturnType<typeof mockedMetaServiceContext>;
  let mockedLookupService: ReturnType<typeof mockedLookupServiceContext>;
  let mockedEditService: ReturnType<typeof mockedEditServiceContext>;

  beforeEach(async () => {
    // Reset mocks before each test
    mockedStatisticService = mockedStatisticServiceContext();
    mockedMetaService = mockedMetaServiceContext();
    mockedLookupService = mockedLookupServiceContext();
    mockedEditService = mockedEditServiceContext();

    await TestBed.configureTestingModule({
      imports: [ EditLayoutStatisticComponent ],
      providers: [
        {
          provide: EDIT_SERVICE,
          useFactory: () => mockedEditService.mock.object()
        } as Provider,
        {
          provide: META_SERVICE,
          useFactory: () => mockedMetaService.mock.object()
        } as Provider,
        {
          provide: LOOKUP_SERVICE,
          useFactory: () => mockedLookupService.mock.object()
        } as Provider,
        {
          provide: STATISTIC_SERVICE_FACTORY,
          useFactory: () => () => mockedStatisticService.mock.object()
        } as Provider
      ]
    })
    .compileComponents();
  });


  it('should create', () => {
    fixture = TestBed.createComponent(EditLayoutStatisticComponent);

    const layoutItem = {
      options: {
        itemoptions: {
          identifier: 'test-statistic',
          statistic: 'test-statistic-def'
        }
      }
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    component = fixture.componentInstance;
    expect(component).toBeTruthy();

    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    expect(fixture).toMatchSnapshot();
  });

  it('should initialize with layout item and set statistic identifier', () => {
    fixture = TestBed.createComponent(EditLayoutStatisticComponent);

    const layoutItem = {
      options: {
        itemoptions: {
          identifier: 'test-statistic',
          statistic: 'test-statistic-def',
          params: { key1: 'value1' }
        }
      }
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    component = fixture.componentInstance;
    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    expect(mockedStatisticService.setHeadParams).toHaveBeenCalledWith({ key1: 'value1' });
    expect(mockedStatisticService.setStatistic).toHaveBeenCalledWith('test-statistic');
  });

  it('should set custom param when meta service emits', () => {
    fixture = TestBed.createComponent(EditLayoutStatisticComponent);

    const layoutItem = {
      options: {
        itemoptions: {
          identifier: 'test-statistic',
          statistic: 'test-statistic-def'
        }
      }
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    component = fixture.componentInstance;
    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    const customParam = { param1: 'test', param2: 123 };
    mockedMetaService.customParam$.next(customParam);

    expect(mockedStatisticService.setCustomParam).toHaveBeenCalledWith(customParam);
  });

  it('should handle layout item without params', () => {
    fixture = TestBed.createComponent(EditLayoutStatisticComponent);

    const layoutItem = {
      options: {
        itemoptions: {
          identifier: 'test-statistic',
          statistic: 'test-statistic-def'
        }
      }
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    component = fixture.componentInstance;
    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    expect(mockedStatisticService.setHeadParams).toHaveBeenCalledWith({});
    expect(mockedStatisticService.setStatistic).toHaveBeenCalledWith('test-statistic');
  });

  it('should expose type$ observable based on layout type', () => {
    fixture = TestBed.createComponent(EditLayoutStatisticComponent);

    const layoutItem = {
      options: {
        itemoptions: {
          identifier: 'test-statistic',
          statistic: 'test-statistic-def'
        }
      }
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    component = fixture.componentInstance;
    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    // Test that type$ observable exists and can emit values
    let emittedType: 'chart' | 'map' | 'pivot' | undefined;
    component.type$.subscribe(type => emittedType = type);

    // Simulate layout change to chart
    mockedStatisticService.layout$.next({ type: 'chart' } as any);
    expect(emittedType).toBe('chart');

    // Simulate layout change to map
    mockedStatisticService.layout$.next({ type: 'map' } as any);
    expect(emittedType).toBe('map');

    // Simulate layout change to pivot
    mockedStatisticService.layout$.next({ type: 'pivot' } as any);
    expect(emittedType).toBe('pivot');

    // Simulate undefined layout
    mockedStatisticService.layout$.next(undefined);
    expect(emittedType).toBeUndefined();
  });

  it('should not initialize when layout item identifier is missing', () => {
    fixture = TestBed.createComponent(EditLayoutStatisticComponent);

    const layoutItem = {
      options: {
        itemoptions: {
          statistic: 'test-def'
        }
      }
    } as EditLayoutItem;

    mockedEditService.editorPreparing.mockReturnValue(layoutItem);

    component = fixture.componentInstance;
    fixture.componentRef.setInput('initialLayoutItem', layoutItem);
    fixture.detectChanges();

    // setStatistic should not be called when identifier is missing
    expect(mockedStatisticService.setStatistic).not.toHaveBeenCalled();
  });

  it('should handle null layout item gracefully', () => {
    fixture = TestBed.createComponent(EditLayoutStatisticComponent);

    mockedEditService.editorPreparing.mockReturnValue(undefined);

    component = fixture.componentInstance;
    fixture.componentRef.setInput('initialLayoutItem', null);
    fixture.detectChanges();

    expect(mockedStatisticService.setStatistic).not.toHaveBeenCalled();
  });
});

