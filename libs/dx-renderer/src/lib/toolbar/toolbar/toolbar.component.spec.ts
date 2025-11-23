import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { ToolbarComponent } from './toolbar.component';
import { LOOKUP_SERVICE, PAGE_SERVICE, TRANSLATOR } from '@ballware/meta-services';

// Simple test doubles for the required services
class MockPageService {
  layout$ = new Subject<any>();
  paramEditorInitialized = jest.fn();
  paramEditorValueChanged = jest.fn();
  paramEditorEvent = jest.fn();
}

class MockLookupService {
  lookups$ = new Subject<any>();
}

const translatorMock = jest.fn((key: string) => key);

// Minimal mock of createLookupDelegateBuilder to avoid pulling in implementation
jest.mock('../../utils', () => ({
  createLookupDelegateBuilder: (lookups: any) => ({
    forIdentifier: jest.fn().mockReturnThis(),
    forStaticItems: jest.fn().mockReturnThis(),
    withDisplayExpr: jest.fn().mockReturnThis(),
    withValueExpr: jest.fn().mockReturnThis(),
    build: jest.fn(() => ({
      displayExpr: 'text',
      valueExpr: 'value',
      dataSource: [{ id: 1, text: 'A' }],
    })),
  }),
}));

describe('ToolbarComponent', () => {
  let component: ToolbarComponent;
  let pageService: MockPageService;
  let lookupService: MockLookupService;

  beforeEach(() => {
    pageService = new MockPageService();
    lookupService = new MockLookupService();

    TestBed.configureTestingModule({
      providers: [
        ToolbarComponent,
        { provide: PAGE_SERVICE, useValue: pageService },
        { provide: LOOKUP_SERVICE, useValue: lookupService },
        { provide: TRANSLATOR, useValue: translatorMock },
      ],
    });

    component = TestBed.inject(ToolbarComponent);
  });

  const emitLayoutAndLookups = (toolbaritems: any[] | null, withLookups = true) => {
    const layout = toolbaritems === null ? null : ({ toolbaritems } as any);
    const lookups = withLookups ? ({} as any) : null;
    lookupService.lookups$.next(lookups);
    pageService.layout$.next(layout);
  };

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should not create toolbar items when layout or lookups are missing', () => {
    emitLayoutAndLookups(null, true);
    expect(component.toolbarItems).toEqual([]);

    emitLayoutAndLookups([], false);
    expect(component.toolbarItems).toEqual([]);
  });

  it('should create a SelectBox toolbar item for lookup and notify value changes', () => {
    emitLayoutAndLookups([
      { type: 'lookup', name: 'l1', caption: 'Lookup', lookup: 'test' },
    ]);

    expect(component.toolbarItems.length).toBe(1);
    const item = component.toolbarItems[0];
    expect(item.widget).toBe('dxSelectBox');

    const options: any = item.options;
    expect(options.label).toBe('Lookup');
    expect(options.onInitialized).toBeDefined();
    expect(options.onValueChanged).toBeDefined();

    // simulate initialization and value change
    const componentMock: any = { option: jest.fn() };
    options.onInitialized({ component: componentMock });
    options.onValueChanged({ value: 42 });

    expect(pageService.paramEditorInitialized).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'l1' }),
    );
    expect(pageService.paramEditorValueChanged).toHaveBeenCalledWith({ name: 'l1', value: 42 });
  });

  it('should create a SelectBox toolbar item for static lookup and use static items configuration', () => {
    emitLayoutAndLookups([
      {
        type: 'staticklookup',
        name: 'sl1',
        caption: 'Static Lookup',
        options: {
          items: [
            { id: 1, text: 'One', value: '1' },
            { id: 2, text: 'Two', value: '2' },
          ],
          displayExpr: 'text',
          valueExpr: 'value',
        },
      },
    ]);

    expect(component.toolbarItems.length).toBe(1);
    const item = component.toolbarItems[0];
    expect(item.widget).toBe('dxSelectBox');

    const options: any = item.options;
    expect(options.label).toBe('Static Lookup');
    expect(options.searchEnabled).toBe(true);
    expect(options.showClearButton).toBe(true);
    expect(options.showDropDownButton).toBe(true);
    expect(options.displayExpr).toBe('text');
    expect(options.valueExpr).toBe('value');
    // dataSource may be transformed by the lookup builder; we only assert that it exists
    expect(options.dataSource).toBeDefined();
  });

  it('should create a TagBox toolbar item for multilookup and notify multiple value changes', () => {
    emitLayoutAndLookups([
      { type: 'multilookup', name: 'ml1', caption: 'Multi', lookup: 'multi' },
    ]);

    const item = component.toolbarItems[0];
    expect(item.widget).toBeDefined();

    const options: any = item.options;
    options.onValueChanged({ value: [1, 2, 3] });
    expect(pageService.paramEditorValueChanged).toHaveBeenCalledWith({ name: 'ml1', value: [1, 2, 3] });
  });

  it('should create a TagBox toolbar item for static multilookup and use static items configuration', () => {
    emitLayoutAndLookups([
      {
        type: 'statickmultilookup',
        name: 'sml1',
        caption: 'Static Multi',
        options: {
          items: [
            { id: 1, text: 'One', value: '1' },
            { id: 2, text: 'Two', value: '2' },
          ],
          displayExpr: 'text',
          valueExpr: 'value',
        },
      },
    ]);

    const item = component.toolbarItems[0];
    const options: any = item.options;

    expect(options.displayExpr).toBe('text');
    expect(options.valueExpr).toBe('value');
    // dataSource may be transformed by the lookup builder; we only assert that it exists
    expect(options.dataSource).toBeDefined();
    expect(options.showSelectionControls).toBe(true);
    expect(options.multiline).toBe(false);
    expect(options.maxDisplayedTags).toBe(3);
  });

  it('should create a DateBox toolbar item for datetime and notify date changes', () => {
    emitLayoutAndLookups([
      { type: 'datetime', name: 'dt1', caption: 'Date', width: '220px' },
    ]);

    const item = component.toolbarItems[0];
    expect(item.widget).toBe('dxDateBox');

    const options: any = item.options;
    expect(options.displayFormat).toBe('format.datetime');

    const date = new Date();
    options.onValueChanged({ value: date });
    expect(pageService.paramEditorValueChanged).toHaveBeenCalledWith({ name: 'dt1', value: date });
  });

  it('should create a DropDownButton toolbar item and notify click events', () => {
    emitLayoutAndLookups([
      {
        type: 'dropdownbutton',
        name: 'dd1',
        caption: 'Action',
        options: {
          items: [
            { id: 'a', text: 'A' },
            { id: 'b', text: 'B' },
          ],
        },
      },
    ]);

    const item = component.toolbarItems[0];
    expect(item.widget).toBe('dxDropDownButton');

    const options: any = item.options;

    // split button click
    options.onButtonClick({});
    expect(pageService.paramEditorEvent).toHaveBeenCalledWith({ name: 'dd1', event: 'click', param: undefined });

    // item click
    options.onItemClick({ itemData: { id: 'a' } });
    expect(pageService.paramEditorEvent).toHaveBeenCalledWith({ name: 'dd1', event: 'click', param: 'a' });
  });

  it('should create a Button toolbar item and notify click events', () => {
    emitLayoutAndLookups([
      { type: 'button', name: 'b1', caption: 'Button' },
    ]);

    const item = component.toolbarItems[0];
    expect(item.widget).toBe('dxButton');

    const options: any = item.options;
    options.onClick({});
    expect(pageService.paramEditorEvent).toHaveBeenCalledWith({ name: 'b1', event: 'click' });
  });

  it('should not call paramEditorInitialized when name is missing', () => {
    const e: any = { component: { option: jest.fn() } };
    component.onItemInitialized(e as any, '');
    expect(pageService.paramEditorInitialized).not.toHaveBeenCalled();
  });
});
