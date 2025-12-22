import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { ToolbarComponent } from './toolbar.component';
import {
  AutocompleteCreator,
  LOOKUP_SERVICE,
  LookupCreator,
  LookupDescriptor,
  PAGE_SERVICE,
  PickvalueCreator,
  TRANSLATOR
} from '@ballware/meta-services';
import { createLookupDelegateBuilder, LOOKUP_DELEGATE_BUILDER_FACTORY } from '../../utils';
import { provideDefaultItemRegistries } from '../../registries';
import { provideDefaultToolbarItemConfigurations } from '../../components';

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
        provideDefaultItemRegistries(),
        provideDefaultToolbarItemConfigurations(),
        { provide: PAGE_SERVICE, useValue: pageService },
        { provide: LOOKUP_SERVICE, useValue: lookupService },
        { provide: TRANSLATOR, useValue: translatorMock },
        { provide: LOOKUP_DELEGATE_BUILDER_FACTORY, useFactory: () => (lookups: Record<string, LookupDescriptor | unknown[] | LookupCreator | PickvalueCreator | AutocompleteCreator>) => createLookupDelegateBuilder(lookups) }
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
        type: 'staticlookup',
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
        type: 'staticmultilookup',
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

  it('should create a NumberBox toolbar item for number and notify value changes', () => {
    emitLayoutAndLookups([
      { type: 'number', name: 'n1', caption: 'Number Input' },
    ]);

    expect(component.toolbarItems.length).toBe(1);
    const item = component.toolbarItems[0];
    expect(item.widget).toBe('dxNumberBox');

    const options: any = item.options;
    expect(options.label).toBe('Number Input');
    expect(options.onInitialized).toBeDefined();
    expect(options.onValueChanged).toBeDefined();

    // simulate initialization and value change
    const componentMock: any = { option: jest.fn() };
    options.onInitialized({ component: componentMock });
    options.onValueChanged({ value: 42 });

    expect(pageService.paramEditorInitialized).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'n1' }),
    );
    expect(pageService.paramEditorValueChanged).toHaveBeenCalledWith({ name: 'n1', value: 42 });
  });

  it('should create a CheckBox toolbar item for bool and notify value changes', () => {
    emitLayoutAndLookups([
      { type: 'bool', name: 'b1', caption: 'Boolean Flag' },
    ]);

    expect(component.toolbarItems.length).toBe(1);
    const item = component.toolbarItems[0];
    expect(item.widget).toBe('dxCheckBox');

    const options: any = item.options;
    expect(options.label).toBe('Boolean Flag');
    expect(options.onInitialized).toBeDefined();
    expect(options.onValueChanged).toBeDefined();

    // simulate initialization and value change
    const componentMock: any = { option: jest.fn() };
    options.onInitialized({ component: componentMock });
    options.onValueChanged({ value: true });

    expect(pageService.paramEditorInitialized).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'b1' }),
    );
    expect(pageService.paramEditorValueChanged).toHaveBeenCalledWith({ name: 'b1', value: true });
  });

  it('should create a TextBox toolbar item for text and notify value changes', () => {
    emitLayoutAndLookups([
      { type: 'text', name: 't1', caption: 'Text Input' },
    ]);

    expect(component.toolbarItems.length).toBe(1);
    const item = component.toolbarItems[0];
    expect(item.widget).toBe('dxTextBox');

    const options: any = item.options;
    expect(options.label).toBe('Text Input');
    expect(options.onInitialized).toBeDefined();
    expect(options.onValueChanged).toBeDefined();

    // simulate initialization and value change
    const componentMock: any = { option: jest.fn() };
    options.onInitialized({ component: componentMock });
    options.onValueChanged({ value: 'Hello World' });

    expect(pageService.paramEditorInitialized).toHaveBeenCalledWith(
      expect.objectContaining({ name: 't1' }),
    );
    expect(pageService.paramEditorValueChanged).toHaveBeenCalledWith({ name: 't1', value: 'Hello World' });
  });
});
