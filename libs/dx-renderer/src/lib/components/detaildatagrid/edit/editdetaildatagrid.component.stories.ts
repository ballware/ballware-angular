import { provideAnimations } from '@angular/platform-browser/animations';
import { EditLayoutItemOptions } from '@ballware/meta-model';
import {
  AutocompleteCreator, CRUD_SERVICE,
  EDIT_SERVICE,
  LOOKUP_SERVICE,
  LookupCreator,
  LookupDescriptor, NOTIFICATION_SERVICE,
  PickvalueCreator,
  TRANSLATOR
} from '@ballware/meta-services';
import { applicationConfig, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { provideI18Next } from 'angular-i18next';
import { BehaviorSubject, of } from 'rxjs';
import { expect, waitFor, within } from 'storybook/test';
import { createMockedEditService } from '@storybook-helpers/edit.service.mock';
import { createMockedLookupService } from '@storybook-helpers/lookup.service.mock';
import { createSimpleTranslator } from '@storybook-helpers/translator.mock';
import { DetailCollectionEditingOptions } from '../../../directives';
import { I18N_PROVIDERS } from '../../../i18n/i18n';
import { EditLayoutDetailDataGridComponent } from './editdetaildatagrid.component';
import { createLookupDelegateBuilder, LOOKUP_DELEGATE_BUILDER_FACTORY } from '../../../utils';
import { provideDefaultItemRegistries } from '../../../registries';
import { provideDefaultColumnConfigurations } from '../../index';
import { createMockedNotificationService } from '@storybook-helpers/notification.service.mock';
import { createMockedCrudService } from '@storybook-helpers/crud.service.mock';

const meta: Meta<EditLayoutDetailDataGridComponent> = {
  title: 'DX Renderer/Edit/DetailGrid',
  component: EditLayoutDetailDataGridComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        provideI18Next(),
        provideDefaultItemRegistries(),
        provideDefaultColumnConfigurations(),
        I18N_PROVIDERS,
        {
          provide: TRANSLATOR,
          useValue: createSimpleTranslator()
        },
        {
          provide: NOTIFICATION_SERVICE,
          useFactory: () => createMockedNotificationService().service
        },
        {
          provide: LOOKUP_SERVICE,
          useFactory: () => createMockedLookupService().service
        },
        {
          provide: CRUD_SERVICE,
          useFactory: () => createMockedCrudService().service
        },
        {
          provide: EDIT_SERVICE,
          useFactory: () => createMockedEditService().service
        },
        {
          provide: LOOKUP_DELEGATE_BUILDER_FACTORY,
          useFactory: () => (lookups: Record<string, LookupDescriptor | unknown[] | LookupCreator | PickvalueCreator | AutocompleteCreator>) => createLookupDelegateBuilder(lookups)
        }
      ],
    }),
    moduleMetadata({
      imports: [EditLayoutDetailDataGridComponent],
    }),
  ],
};

export default meta;
type Story = StoryObj<EditLayoutDetailDataGridComponent>;

// Helper function to create a mock layout item for detail grid
const createDetailGridLayoutItem = (
  dataMember: string,
  caption: string,
  itemOptions: DetailCollectionEditingOptions,
  additionalOptions?: Partial<EditLayoutItemOptions>
) => ({
  type: 'detailgrid',
  options: {
    dataMember,
    caption,
    itemoptions: itemOptions,
    ...additionalOptions
  },
});

export const Default: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createDetailGridLayoutItem(
          'items',
          'Items',
          {
            columns: [
              { dataMember: 'name', caption: 'Name', type: 'string' },
              { dataMember: 'quantity', caption: 'Quantity', type: 'number' },
              { dataMember: 'price', caption: 'Price', type: 'number' },
              { dataMember: 'active', caption: 'Active', type: 'bool' },
            ]
          }
        ),
        onEntered: () => console.log('Field entered'),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: {
        dataMember$: of('items'),
        value: [
          { name: 'Item 1', quantity: 2, price: 10.99, active: true },
          { name: 'Item 2', quantity: 1, price: 25.5, active: false },
          { name: 'Item 3', quantity: 5, price: 5, active: true },
        ],
      },
      editing: {
        columns: [
          { dataField: 'name', caption: 'Name', dataType: 'string' },
          { dataField: 'quantity', caption: 'Quantity', dataType: 'number' },
          { dataField: 'price', caption: 'Price', dataType: 'number' },
          { dataField: 'active', caption: 'Active', dataType: 'boolean' },
        ],
        height: 400,
        editMode: 'cell',
        allowAdd: true,
        allowUpdate: true,
        allowDelete: true,
        showSource: false,
        lookupParams: {},
        gridEditRowKey: undefined,
        gridEditChanges: [],
        validationAdapterConfig: {},
        onToolbarPreparing: () => {},
        onIntegratedEditorPreparing: () => {},
        onRowClick: () => {},
        onInitNewRow: () => {},
      },
    },
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Test: Grid should be visible
    await waitFor(
      async () => {
        const grid = canvasElement.querySelector('dx-data-grid');
        await expect(grid).toBeTruthy();
      },
      { timeout: 5000 }
    );

    // Test: Caption should be visible
    await waitFor(
      async () => {
        const caption = canvas.queryByText('Items');
        await expect(caption).toBeTruthy();
      },
      { timeout: 5000 }
    );

    // Wait for data rows to be rendered (DevExtreme needs time to render)
    await waitFor(
      async () => {
        const rows = canvasElement.querySelectorAll('.dx-data-row');
        await expect(rows.length).toBe(3);
      },
      { timeout: 5000 }
    );

    // Test: Column headers should exist
    await waitFor(
      async () => {
        const nameHeader = canvas.queryByText('Name');
        await expect(nameHeader).toBeTruthy();
      },
      { timeout: 5000 }
    );
  },
};

export const Empty: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createDetailGridLayoutItem(
          'emptyItems',
          'Empty Grid',
          {
            columns: [
              { dataMember: 'name', caption: 'Name', type: 'string' },
              { dataMember: 'description', caption: 'Description', type: 'string' },
              { dataMember: 'isAvailable', caption: 'Available', type: 'bool' },
            ]
          }
        ),
        onEntered: () => console.log('Field entered'),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: {
        dataMember$: of('emptyItems'),
        value: [],
      },
      editing: {
        columns: [
          { dataField: 'name', caption: 'Name', dataType: 'string' },
          { dataField: 'description', caption: 'Description', dataType: 'string' },
          { dataField: 'isAvailable', caption: 'Available', dataType: 'boolean' },
        ],
        height: 300,
        editMode: 'cell',
        allowAdd: true,
        allowUpdate: true,
        allowDelete: true,
        showSource: false,
        lookupParams: {},
        gridEditRowKey: undefined,
        gridEditChanges: [],
        validationAdapterConfig: {},
        onToolbarPreparing: () => {},
        onIntegratedEditorPreparing: () => {},
        onRowClick: () => {},
        onInitNewRow: () => {},
      },
    },
  }),
  play: async ({ canvasElement }) => {
    // Test: Grid should be visible
    await waitFor(
      async () => {
        const grid = canvasElement.querySelector('dx-data-grid');
        await expect(grid).toBeTruthy();
      },
      { timeout: 5000 }
    );

    // Test: No data message or empty grid
    await waitFor(
      async () => {
        const rows = canvasElement.querySelectorAll('.dx-data-row');
        await expect(rows.length).toBe(0);
      },
      { timeout: 3000 }
    );
  },
};

export const Readonly: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createDetailGridLayoutItem(
          'readonlyItems',
          'Readonly Grid',
          {
            columns: [
              { dataMember: 'id', caption: 'ID', type: 'number' },
              { dataMember: 'status', caption: 'Status', type: 'string' },
              { dataMember: 'date', caption: 'Date', type: 'date' },
              { dataMember: 'enabled', caption: 'Enabled', type: 'bool' },
            ]
          }
        ),
        onEntered: () => console.log('Field entered'),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(true) },
      value: {
        dataMember$: of('readonlyItems'),
        value: [
          { id: 1, status: 'Active', date: new Date('2024-01-15'), enabled: true },
          { id: 2, status: 'Pending', date: new Date('2024-02-20'), enabled: false },
          { id: 3, status: 'Completed', date: new Date('2024-03-10'), enabled: true },
        ],
      },
      editing: {
        columns: [
          { dataField: 'id', caption: 'ID', dataType: 'number' },
          { dataField: 'status', caption: 'Status', dataType: 'string' },
          { dataField: 'date', caption: 'Date', dataType: 'date' },
          { dataField: 'enabled', caption: 'Enabled', dataType: 'boolean' },
        ],
        height: 350,
        editMode: 'cell',
        allowAdd: false,
        allowUpdate: false,
        allowDelete: false,
        showSource: false,
        lookupParams: {},
        gridEditRowKey: undefined,
        gridEditChanges: [],
        validationAdapterConfig: {},
        onToolbarPreparing: () => {},
        onIntegratedEditorPreparing: () => {},
        onRowClick: () => {},
        onInitNewRow: () => {},
      },
    },
  }),
};

export const RowEditMode: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createDetailGridLayoutItem(
          'rowEditItems',
          'Row Edit Mode',
          {
            columns: [
              { dataMember: 'product', caption: 'Product', type: 'string' },
              { dataMember: 'category', caption: 'Category', type: 'string' },
              { dataMember: 'stock', caption: 'Stock', type: 'number' },
              { dataMember: 'inStock', caption: 'In Stock', type: 'bool' },
            ]
          }
        ),
        onEntered: () => console.log('Field entered'),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: {
        dataMember$: of('rowEditItems'),
        value: [
          { product: 'Laptop', category: 'Electronics', stock: 15, inStock: true },
          { product: 'Mouse', category: 'Accessories', stock: 50, inStock: true },
          { product: 'Keyboard', category: 'Accessories', stock: 30, inStock: false },
        ],
      },
      editing: {
        columns: [
          { dataField: 'product', caption: 'Product', dataType: 'string' },
          { dataField: 'category', caption: 'Category', dataType: 'string' },
          { dataField: 'stock', caption: 'Stock', dataType: 'number' },
          { dataField: 'inStock', caption: 'In Stock', dataType: 'boolean' },
        ],
        height: 400,
        editMode: 'row',
        allowAdd: true,
        allowUpdate: true,
        allowDelete: true,
        showSource: false,
        lookupParams: {},
        gridEditRowKey: undefined,
        gridEditChanges: [],
        validationAdapterConfig: {},
        onToolbarPreparing: () => {},
        onIntegratedEditorPreparing: () => {},
        onRowClick: () => {},
        onInitNewRow: () => {},
      },
    },
  }),
};

export const ManyColumns: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createDetailGridLayoutItem(
          'manyColumnsItems',
          'Grid with Many Columns',
          {
            columns: [
              { dataMember: 'col1', caption: 'Column 1', type: 'string' },
              { dataMember: 'col2', caption: 'Column 2', type: 'string' },
              { dataMember: 'col3', caption: 'Column 3', type: 'number' },
              { dataMember: 'col4', caption: 'Column 4', type: 'number' },
              { dataMember: 'col5', caption: 'Column 5', type: 'boolean' },
              { dataMember: 'col6', caption: 'Column 6', type: 'date' },
            ]
          }
        ),
        onEntered: () => console.log('Field entered'),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: {
        dataMember$: of('manyColumnsItems'),
        value: [
          { col1: 'Data 1', col2: 'Info A', col3: 100, col4: 50, col5: true, col6: new Date('2024-01-01') },
          { col1: 'Data 2', col2: 'Info B', col3: 200, col4: 75, col5: false, col6: new Date('2024-02-01') },
          { col1: 'Data 3', col2: 'Info C', col3: 150, col4: 60, col5: true, col6: new Date('2024-03-01') },
        ],
      },
      editing: {
        columns: [
          { dataMember: 'col1', caption: 'Column 1', type: 'string' },
          { dataMember: 'col2', caption: 'Column 2', type: 'string' },
          { dataMember: 'col3', caption: 'Column 3', type: 'number' },
          { dataMember: 'col4', caption: 'Column 4', type: 'number' },
          { dataMember: 'col5', caption: 'Column 5', type: 'boolean' },
          { dataMember: 'col6', caption: 'Column 6', type: 'date' },
        ],
        height: 450,
        editMode: 'cell',
        allowAdd: true,
        allowUpdate: true,
        allowDelete: true,
        showSource: false,
        lookupParams: {},
        gridEditRowKey: undefined,
        gridEditChanges: [],
        validationAdapterConfig: {},
        onToolbarPreparing: () => {},
        onIntegratedEditorPreparing: () => {},
        onRowClick: () => {},
        onInitNewRow: () => {},
      },
    },
  }),
};

export const Hidden: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createDetailGridLayoutItem(
          'hiddenItems',
          'Hidden Grid',
          {
            columns: [
              { dataMember: 'field1', caption: 'Field 1', type: 'string' },
            ]
          }
        ),
        onEntered: () => console.log('Field entered'),
      },
      visible: { visible$: of(false) },
      readonly: { readonly$: of(false) },
      value: {
        dataMember$: of('hiddenItems'),
        value: [],
      },
      editing: {
        columns: [
          { dataMember: 'field1', caption: 'Field 1', type: 'string' },
        ],
        height: 300,
        editMode: 'cell',
        allowAdd: true,
        allowUpdate: true,
        allowDelete: true,
        showSource: false,
        lookupParams: {},
        gridEditRowKey: undefined,
        gridEditChanges: [],
        validationAdapterConfig: {},
        onToolbarPreparing: () => {},
        onIntegratedEditorPreparing: () => {},
        onRowClick: () => {},
        onInitNewRow: () => {},
      },
    },
  }),
};

export const WithLargeDataset: Story = {
  render: (args) => ({
    props: {
      ...args,
      destroy: { destroy$: of(false) },
      livecycle: {
        layoutItem: createDetailGridLayoutItem(
          'largeDataset',
          'Large Dataset Grid',
          {
            columns: [
              { dataMember: 'id', caption: 'ID', type: 'number' },
              { dataMember: 'name', caption: 'Name', type: 'string' },
              { dataMember: 'value', caption: 'Value', type: 'number' },
              { dataMember: 'isActive', caption: 'Active', type: 'bool' },
            ]
          }
        ),
        onEntered: () => console.log('Field entered'),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: {
        dataMember$: of('largeDataset'),
        value: Array.from({ length: 50 }, (_, i) => ({
          id: i + 1,
          name: `Item ${i + 1}`,
          value: Math.random() * 1000,
          isActive: i % 2 === 0,
        })),
      },
      editing: {
        columns: [
          { dataField: 'id', caption: 'ID', dataType: 'number' },
          { dataField: 'name', caption: 'Name', dataType: 'string' },
          { dataField: 'value', caption: 'Value', dataType: 'number' },
          { dataField: 'isActive', caption: 'Active', dataType: 'boolean' },
        ],
        height: 500,
        editMode: 'cell',
        allowAdd: true,
        allowUpdate: true,
        allowDelete: true,
        showSource: false,
        lookupParams: {},
        gridEditRowKey: undefined,
        gridEditChanges: [],
        validationAdapterConfig: {},
        onToolbarPreparing: () => {},
        onIntegratedEditorPreparing: () => {},
        onRowClick: () => {},
        onInitNewRow: () => {},
      },
    },
  }),
};

export const RowEditing: Story = {
  render: (args) => {

    const simpleLookupValues = [
      { value: '7f6b2c98-8eec-4092-aa7c-977d874e4f9e', text: 'Value 1' },
      { value: '33acc2c2-e69f-48f2-871b-77377f01a34d', text: 'Value 2' },
      { value: '938877a7-db27-4ab7-be75-713239d8a247', text: 'Value 3' },
    ];

    const mockLookupService = createMockedLookupService({
      lookups: {
        simpleLookup: {
          type: 'lookup',
          store: {
            listFunc: () => of(simpleLookupValues),
            byIdFunc: (id) => of(simpleLookupValues.find(v => v.value === id))
          },
          displayMember: 'text',
          valueMember: 'value'
        } as LookupDescriptor
      }
    });

    const mockEditService = createMockedEditService({
      overrides: {
        initNewDetailItem$: new BehaviorSubject(({ detailItem }) => {
          detailItem['id'] = 0;
          detailItem['name'] = 'New item';
          detailItem['value'] = 0;
        }),
        detailGridCellPreparing$: new BehaviorSubject(({ dataMember, identifier, detailItem, options}) => {

          if (dataMember === 'items' && identifier === 'dynamic_lookup_value') {
            options.type = 'lookup';
            options.lookup = 'simpleLookup';
            options.displayExpr = 'text';
            options.valueExpr = 'value';
            options.editable = detailItem['id'] === 2
          }

          if (dataMember === 'items' && identifier === 'dynamic_bool_value') {
            options.type = 'bool';
            options.editable = detailItem['id'] !== 2
          }

          return options;
        })
      }
    });

    mockEditService.subjects.item$.next({
      items: [
        { id: 1, name: 'Dynamic Item 1', value: 100, lookup_value: '7f6b2c98-8eec-4092-aa7c-977d874e4f9e', dynamic_lookup_value: '7f6b2c98-8eec-4092-aa7c-977d874e4f9e', editable: true, dynamic_bool_value: true },
        { id: 2, name: 'Dynamic Item 2', value: 200, lookup_value: '33acc2c2-e69f-48f2-871b-77377f01a34d', dynamic_lookup_value: '33acc2c2-e69f-48f2-871b-77377f01a34d', editable: false, dynamic_bool_value: false },
        { id: 3, name: 'Dynamic Item 3', value: 300, lookup_value: '938877a7-db27-4ab7-be75-713239d8a247', dynamic_lookup_value: '938877a7-db27-4ab7-be75-713239d8a247', editable: true, dynamic_bool_value: true },
      ]
    });

    return {
      props: {
        ...args,
        initialLayoutItem: createDetailGridLayoutItem(
          'items',
          'Row editing',
          {
            editMode: 'row',
            add: true,
            update: true,
            delete: true,
            columns: [
              { dataMember: 'id', caption: 'ID', type: 'number' },
              { dataMember: 'name', caption: 'Name', type: 'string', editable: true },
              { dataMember: 'value', caption: 'Value', type: 'number', editable: true },
              { dataMember: 'lookup_value', caption: 'Lookup', type: 'lookup', editable: true, lookup: 'simpleLookup', displayExpr: 'text', valueExpr: 'value', required: true },
              { dataMember: 'dynamic_lookup_value', caption: 'Dynamic Lookup', type: 'dynamic', editable: true },
              { dataMember: 'dynamic_bool_value', caption: 'Dynamic Bool', type: 'dynamic', editable: true },
              { dataMember: 'editable', caption: 'Editable', type: 'bool', editable: true }
            ],
          }
        )
      },
      template: `<ballware-edit-detaildatagrid [initialLayoutItem]='initialLayoutItem'></ballware-edit-detaildatagrid>`,
      applicationConfig: {
      providers: [
        {
          provide: LOOKUP_SERVICE,
          useValue: mockLookupService.service
        },
        {
          provide: EDIT_SERVICE,
          useValue: mockEditService.service
        }
      ]
    }
    };
  },
};

export const RowEditingGlobalReadonly: Story = {
  render: (args) => {

    const simpleLookupValues = [
      { value: '7f6b2c98-8eec-4092-aa7c-977d874e4f9e', text: 'Value 1' },
      { value: '33acc2c2-e69f-48f2-871b-77377f01a34d', text: 'Value 2' },
      { value: '938877a7-db27-4ab7-be75-713239d8a247', text: 'Value 3' },
    ];

    const mockLookupService = createMockedLookupService({
      lookups: {
        simpleLookup: {
          type: 'lookup',
          store: {
            listFunc: () => of(simpleLookupValues),
            byIdFunc: (id) => of(simpleLookupValues.find(v => v.value === id))
          },
          displayMember: 'text',
          valueMember: 'value'
        } as LookupDescriptor
      }
    });

    const mockEditService = createMockedEditService({
      readonly: true,
      overrides: {
        initNewDetailItem$: new BehaviorSubject(({ detailItem }) => {
          detailItem['id'] = 0;
          detailItem['name'] = 'New item';
          detailItem['value'] = 0;
        }),
        detailGridCellPreparing$: new BehaviorSubject(({ dataMember, identifier, detailItem, options}) => {

          if (dataMember === 'items' && identifier === 'dynamic_lookup_value') {
            options.type = 'lookup';
            options.lookup = 'simpleLookup';
            options.displayExpr = 'text';
            options.valueExpr = 'value';
            options.editable = detailItem['id'] === 2
          }

          if (dataMember === 'items' && identifier === 'dynamic_bool_value') {
            options.type = 'bool';
            options.editable = detailItem['id'] === 1
          }

          return options;
        })
      }
    });

    mockEditService.subjects.item$.next({
      items: [
        { id: 1, name: 'Dynamic Item 1', value: 100, lookup_value: '7f6b2c98-8eec-4092-aa7c-977d874e4f9e', dynamic_lookup_value: '7f6b2c98-8eec-4092-aa7c-977d874e4f9e', active: true, dynamic_bool_value: false },
        { id: 2, name: 'Dynamic Item 2', value: 200, lookup_value: '33acc2c2-e69f-48f2-871b-77377f01a34d', dynamic_lookup_value: '33acc2c2-e69f-48f2-871b-77377f01a34d', active: false, dynamic_bool_value: true },
        { id: 3, name: 'Dynamic Item 3', value: 300, lookup_value: '938877a7-db27-4ab7-be75-713239d8a247', dynamic_lookup_value: '938877a7-db27-4ab7-be75-713239d8a247', active: true, dynamic_bool_value: false },
      ]
    });

    return {
      props: {
        ...args,
        initialLayoutItem: createDetailGridLayoutItem(
          'items',
          'Row editing',
          {
            editMode: 'row',
            add: true,
            update: true,
            delete: true,
            columns: [
              { dataMember: 'id', caption: 'ID', type: 'number' },
              { dataMember: 'name', caption: 'Name', type: 'string', editable: true },
              { dataMember: 'value', caption: 'Value', type: 'number', editable: true },
              { dataMember: 'lookup_value', caption: 'Lookup', type: 'lookup', editable: true, lookup: 'simpleLookup', displayExpr: 'text', valueExpr: 'value', required: true },
              { dataMember: 'dynamic_lookup_value', caption: 'Dynamic Lookup', type: 'dynamic', editable: true },
              { dataMember: 'dynamic_bool_value', caption: 'Dynamic Bool', type: 'dynamic', editable: true },
              { dataMember: 'active', caption: 'Active', type: 'bool', editable: true }
            ],
          }
        )
      },
      template: `<ballware-edit-detaildatagrid [initialLayoutItem]='initialLayoutItem'></ballware-edit-detaildatagrid>`,
      applicationConfig: {
      providers: [
        {
          provide: LOOKUP_SERVICE,
          useValue: mockLookupService.service
        },
        {
          provide: EDIT_SERVICE,
          useValue: mockEditService.service
        }
      ]
    }
    };
  },
};

export const InstantEditing: Story = {
  render: (args) => {

    const simpleLookupValues = [
      { value: '7f6b2c98-8eec-4092-aa7c-977d874e4f9e', text: 'Value 1' },
      { value: '33acc2c2-e69f-48f2-871b-77377f01a34d', text: 'Value 2' },
      { value: '938877a7-db27-4ab7-be75-713239d8a247', text: 'Value 3' },
    ];

    const mockLookupService = createMockedLookupService({
      lookups: {
        simpleLookup: {
          type: 'lookup',
          store: {
            listFunc: () => of(simpleLookupValues),
            byIdFunc: (id) => of(simpleLookupValues.find(v => v.value === id))
          },
          displayMember: 'text',
          valueMember: 'value'
        } as LookupDescriptor
      }
    });

    const mockEditService = createMockedEditService({
      overrides: {
        initNewDetailItem$: new BehaviorSubject(({ detailItem }) => {
          detailItem['id'] = 0;
          detailItem['name'] = 'New item';
          detailItem['value'] = 0;
        }),
        detailGridCellPreparing$: new BehaviorSubject(({ dataMember, identifier, detailItem, options}) => {

          if (dataMember === 'items' && identifier === 'dynamic_lookup_value') {
            options.type = 'lookup';
            options.lookup = 'simpleLookup';
            options.displayExpr = 'text';
            options.valueExpr = 'value';
            options.editable = detailItem['id'] === 2
          }

          if (dataMember === 'items' && identifier === 'dynamic_bool_value') {
            options.type = 'bool';
            options.editable = detailItem['id'] === 3
          }

          return options;
        })
      }
    });

    mockEditService.subjects.item$.next({
      items: [
        { id: 1, name: 'Dynamic Item 1', value: 100, lookup_value: '7f6b2c98-8eec-4092-aa7c-977d874e4f9e', dynamic_lookup_value: '7f6b2c98-8eec-4092-aa7c-977d874e4f9e', enabled: true, dynamic_bool_value: true },
        { id: 2, name: 'Dynamic Item 2', value: 200, lookup_value: '33acc2c2-e69f-48f2-871b-77377f01a34d', dynamic_lookup_value: '33acc2c2-e69f-48f2-871b-77377f01a34d', enabled: false, dynamic_bool_value: false },
        { id: 3, name: 'Dynamic Item 3', value: 300, lookup_value: '938877a7-db27-4ab7-be75-713239d8a247', dynamic_lookup_value: '938877a7-db27-4ab7-be75-713239d8a247', enabled: true, dynamic_bool_value: true },
      ]
    });

    return {
      props: {
        ...args,
        initialLayoutItem: createDetailGridLayoutItem(
          'items',
          'Row editing',
          {
            editMode: 'instant',
            add: true,
            update: true,
            delete: true,
            columns: [
              { dataMember: 'id', caption: 'ID', type: 'number' },
              { dataMember: 'name', caption: 'Name', type: 'string', editable: true },
              { dataMember: 'value', caption: 'Value', type: 'number', editable: true },
              { dataMember: 'lookup_value', caption: 'Lookup', type: 'lookup', editable: true, lookup: 'simpleLookup', displayExpr: 'text', valueExpr: 'value', required: true },
              { dataMember: 'dynamic_lookup_value', caption: 'Dynamic Lookup', type: 'dynamic', editable: true },
              { dataMember: 'dynamic_bool_value', caption: 'Dynamic Bool', type: 'dynamic', editable: true },
              { dataMember: 'enabled', caption: 'Enabled', type: 'bool', editable: true }
            ],
          }
        )
      },
      template: `<ballware-edit-detaildatagrid [initialLayoutItem]='initialLayoutItem'></ballware-edit-detaildatagrid>`,
      applicationConfig: {
      providers: [
        {
          provide: LOOKUP_SERVICE,
          useValue: mockLookupService.service
        },
        {
          provide: EDIT_SERVICE,
          useValue: mockEditService.service
        }
      ]
    }
    };
  },
};

export const InstantEditingGlobalReadonly: Story = {
  render: (args) => {

    const simpleLookupValues = [
      { value: '7f6b2c98-8eec-4092-aa7c-977d874e4f9e', text: 'Value 1' },
      { value: '33acc2c2-e69f-48f2-871b-77377f01a34d', text: 'Value 2' },
      { value: '938877a7-db27-4ab7-be75-713239d8a247', text: 'Value 3' },
    ];

    const mockLookupService = createMockedLookupService({
      lookups: {
        simpleLookup: {
          type: 'lookup',
          store: {
            listFunc: () => of(simpleLookupValues),
            byIdFunc: (id) => of(simpleLookupValues.find(v => v.value === id))
          },
          displayMember: 'text',
          valueMember: 'value'
        } as LookupDescriptor
      }
    });

    const mockEditService = createMockedEditService({
      readonly: true,
      overrides: {
        initNewDetailItem$: new BehaviorSubject(({ detailItem }) => {
          detailItem['id'] = 0;
          detailItem['name'] = 'New item';
          detailItem['value'] = 0;
        }),
        detailGridCellPreparing$: new BehaviorSubject(({ dataMember, identifier, detailItem, options}) => {

          if (dataMember === 'items' && identifier === 'dynamic_lookup_value') {
            options.type = 'lookup';
            options.lookup = 'simpleLookup';
            options.displayExpr = 'text';
            options.valueExpr = 'value';
            options.editable = detailItem['id'] === 2
          }

          if (dataMember === 'items' && identifier === 'dynamic_bool_value') {
            options.type = 'bool';
            options.editable = false
          }

          return options;
        })
      }
    });

    mockEditService.subjects.item$.next({
      items: [
        { id: 1, name: 'Dynamic Item 1', value: 100, lookup_value: '7f6b2c98-8eec-4092-aa7c-977d874e4f9e', dynamic_lookup_value: '7f6b2c98-8eec-4092-aa7c-977d874e4f9e', isActive: true, dynamic_bool_value: false },
        { id: 2, name: 'Dynamic Item 2', value: 200, lookup_value: '33acc2c2-e69f-48f2-871b-77377f01a34d', dynamic_lookup_value: '33acc2c2-e69f-48f2-871b-77377f01a34d', isActive: false, dynamic_bool_value: true },
        { id: 3, name: 'Dynamic Item 3', value: 300, lookup_value: '938877a7-db27-4ab7-be75-713239d8a247', dynamic_lookup_value: '938877a7-db27-4ab7-be75-713239d8a247', isActive: true, dynamic_bool_value: false },
      ]
    });

    return {
      props: {
        ...args,
        initialLayoutItem: createDetailGridLayoutItem(
          'items',
          'Row editing',
          {
            editMode: 'instant',
            add: true,
            update: true,
            delete: true,
            columns: [
              { dataMember: 'id', caption: 'ID', type: 'number' },
              { dataMember: 'name', caption: 'Name', type: 'string', editable: true },
              { dataMember: 'value', caption: 'Value', type: 'number', editable: true },
              { dataMember: 'lookup_value', caption: 'Lookup', type: 'lookup', editable: true, lookup: 'simpleLookup', displayExpr: 'text', valueExpr: 'value', required: true },
              { dataMember: 'dynamic_lookup_value', caption: 'Dynamic Lookup', type: 'dynamic', editable: true },
              { dataMember: 'dynamic_bool_value', caption: 'Dynamic Bool', type: 'dynamic', editable: true },
              { dataMember: 'isActive', caption: 'Active', type: 'bool', editable: true }
            ],
          }
        )
      },
      template: `<ballware-edit-detaildatagrid [initialLayoutItem]='initialLayoutItem'></ballware-edit-detaildatagrid>`,
      applicationConfig: {
      providers: [
        {
          provide: LOOKUP_SERVICE,
          useValue: mockLookupService.service
        },
        {
          provide: EDIT_SERVICE,
          useValue: mockEditService.service
        }
      ]
    }
    };
  },
};

export const DynamicBoolColumn: Story = {
  render: (args) => {

    const mockEditService = createMockedEditService({
      overrides: {
        initNewDetailItem$: new BehaviorSubject(({ detailItem }) => {
          detailItem['id'] = 0;
          detailItem['name'] = 'New item';
          detailItem['type'] = 'TypeA';
        }),
        detailGridCellPreparing$: new BehaviorSubject(({ dataMember, identifier, detailItem, options}) => {

          // Dynamic column that becomes a boolean based on row data
          if (dataMember === 'items' && identifier === 'dynamic_field') {
            // For TypeA and TypeB items, show as boolean
            if (detailItem['type'] === 'TypeA' || detailItem['type'] === 'TypeB') {
              options.type = 'bool';
              options.editable = true;
            } else {
              // For TypeC items, show as string
              options.type = 'string';
              options.editable = false;
            }
          }

          return options;
        })
      }
    });

    mockEditService.subjects.item$.next({
      items: [
        { id: 1, name: 'Item A1', type: 'TypeA', dynamic_field: true },
        { id: 2, name: 'Item A2', type: 'TypeA', dynamic_field: false },
        { id: 3, name: 'Item B1', type: 'TypeB', dynamic_field: true },
        { id: 4, name: 'Item B2', type: 'TypeB', dynamic_field: false },
        { id: 5, name: 'Item C1', type: 'TypeC', dynamic_field: 'N/A' },
        { id: 6, name: 'Item C2', type: 'TypeC', dynamic_field: 'N/A' },
      ]
    });

    return {
      props: {
        ...args,
        initialLayoutItem: createDetailGridLayoutItem(
          'items',
          'Dynamic Bool Column Demo',
          {
            editMode: 'instant',
            add: true,
            update: true,
            delete: true,
            columns: [
              { dataMember: 'id', caption: 'ID', type: 'number' },
              { dataMember: 'name', caption: 'Name', type: 'string', editable: true },
              { dataMember: 'type', caption: 'Type', type: 'string', editable: true },
              { dataMember: 'dynamic_field', caption: 'Dynamic Field (Bool for TypeA/B, String for TypeC)', type: 'dynamic', editable: true }
            ],
          }
        )
      },
      template: `<ballware-edit-detaildatagrid [initialLayoutItem]='initialLayoutItem'></ballware-edit-detaildatagrid>`,
      applicationConfig: {
      providers: [
        {
          provide: EDIT_SERVICE,
          useValue: mockEditService.service
        }
      ]
    }
    };
  },
};

