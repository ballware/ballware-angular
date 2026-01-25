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
              { dataMember: 'orderDate', caption: 'Order Date', type: 'date' },
              { dataMember: 'deliveryDateTime', caption: 'Delivery', type: 'datetime' },
              { dataMember: 'active', caption: 'Active', type: 'bool' },
              { dataMember: 'action', caption: 'Action', type: 'button', hint: 'Details', editable: true },
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
          { name: 'Item 1', quantity: 2, price: 10.99, orderDate: new Date('2024-01-15'), deliveryDateTime: new Date('2024-01-20T14:30:00'), active: true },
          { name: 'Item 2', quantity: 1, price: 25.5, orderDate: new Date('2024-02-10'), deliveryDateTime: new Date('2024-02-15T09:00:00'), active: false },
          { name: 'Item 3', quantity: 5, price: 5, orderDate: new Date('2024-03-05'), deliveryDateTime: new Date('2024-03-10T16:45:00'), active: true },
        ],
      },
      editing: {
        columns: [
          { dataField: 'name', caption: 'Name', dataType: 'string' },
          { dataField: 'quantity', caption: 'Quantity', dataType: 'number' },
          { dataField: 'price', caption: 'Price', dataType: 'number' },
          { dataField: 'orderDate', caption: 'Order Date', dataType: 'date' },
          { dataField: 'deliveryDateTime', caption: 'Delivery', dataType: 'datetime' },
          { dataField: 'active', caption: 'Active', dataType: 'boolean' },
          { dataField: 'action', caption: 'Action', dataType: 'button' },
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

          if (dataMember === 'items' && identifier === 'dynamic_button') {
            options.type = 'button';
            options.hint = detailItem['id'] === 1 ? 'View' : detailItem['id'] === 2 ? 'Edit' : 'Delete';
            options.editable = true;
          }

          if (dataMember === 'items' && identifier === 'dynamic_date') {
            // For even IDs: date, for odd IDs: datetime
            if ((detailItem['id'] as number) % 2 === 0) {
              options.type = 'date';
            } else {
              options.type = 'datetime';
            }
            options.editable = true;
          }

          return options;
        })
      }
    });

    mockEditService.subjects.item$.next({
      items: [
        { id: 1, name: 'Dynamic Item 1', value: 100, lookup_value: '7f6b2c98-8eec-4092-aa7c-977d874e4f9e', dynamic_lookup_value: '7f6b2c98-8eec-4092-aa7c-977d874e4f9e', editable: true, dynamic_bool_value: true, createdDate: new Date('2024-01-10'), dynamic_date: new Date('2024-02-15T10:30:00') },
        { id: 2, name: 'Dynamic Item 2', value: 200, lookup_value: '33acc2c2-e69f-48f2-871b-77377f01a34d', dynamic_lookup_value: '33acc2c2-e69f-48f2-871b-77377f01a34d', editable: false, dynamic_bool_value: false, createdDate: new Date('2024-02-15'), dynamic_date: new Date('2024-03-20') },
        { id: 3, name: 'Dynamic Item 3', value: 300, lookup_value: '938877a7-db27-4ab7-be75-713239d8a247', dynamic_lookup_value: '938877a7-db27-4ab7-be75-713239d8a247', editable: true, dynamic_bool_value: true, createdDate: new Date('2024-03-20'), dynamic_date: new Date('2024-04-25T14:45:00') },
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
              { dataMember: 'createdDate', caption: 'Created', type: 'date', editable: true },
              { dataMember: 'lookup_value', caption: 'Lookup', type: 'lookup', editable: true, lookup: 'simpleLookup', displayExpr: 'text', valueExpr: 'value', required: true },
              { dataMember: 'dynamic_lookup_value', caption: 'Dynamic Lookup', type: 'dynamic', editable: true },
              { dataMember: 'dynamic_bool_value', caption: 'Dynamic Bool', type: 'dynamic', editable: true },
              { dataMember: 'dynamic_date', caption: 'Dynamic Date/DateTime', type: 'dynamic', editable: true },
              { dataMember: 'static_button', caption: 'Info', type: 'button', hint: 'Show Info', editable: true },
              { dataMember: 'dynamic_button', caption: 'Dynamic Action', type: 'dynamic' },
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

          if (dataMember === 'items' && identifier === 'dynamic_button') {
            options.type = 'button';
            options.hint = `Process ${detailItem['id']}`;
            options.editable = true;
          }

          if (dataMember === 'items' && identifier === 'dynamic_datetime') {
            options.type = 'datetime';
            options.editable = true;
          }

          return options;
        })
      }
    });

    mockEditService.subjects.item$.next({
      items: [
        { id: 1, name: 'Dynamic Item 1', value: 100, lookup_value: '7f6b2c98-8eec-4092-aa7c-977d874e4f9e', dynamic_lookup_value: '7f6b2c98-8eec-4092-aa7c-977d874e4f9e', enabled: true, dynamic_bool_value: true, dynamic_datetime: new Date('2024-01-15T10:30:00') },
        { id: 2, name: 'Dynamic Item 2', value: 200, lookup_value: '33acc2c2-e69f-48f2-871b-77377f01a34d', dynamic_lookup_value: '33acc2c2-e69f-48f2-871b-77377f01a34d', enabled: false, dynamic_bool_value: false, dynamic_datetime: new Date('2024-02-20T14:15:00') },
        { id: 3, name: 'Dynamic Item 3', value: 300, lookup_value: '938877a7-db27-4ab7-be75-713239d8a247', dynamic_lookup_value: '938877a7-db27-4ab7-be75-713239d8a247', enabled: true, dynamic_bool_value: true, dynamic_datetime: new Date('2024-03-25T16:45:00') },
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
              { dataMember: 'dynamic_datetime', caption: 'Dynamic DateTime', type: 'dynamic', editable: true },
              { dataMember: 'dynamic_button', caption: 'Actions', type: 'dynamic' },
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

export const ButtonColumns: Story = {
  render: (args) => {

    const mockEditService = createMockedEditService({
      overrides: {
        initNewDetailItem$: new BehaviorSubject(({ detailItem }) => {
          detailItem['id'] = 0;
          detailItem['name'] = 'New item';
          detailItem['status'] = 'pending';
        }),
        detailGridCellPreparing$: new BehaviorSubject(({ dataMember, identifier, detailItem, options}) => {

          // Dynamic button column with different actions based on status
          if (dataMember === 'items' && identifier === 'dynamic_action') {
            options.type = 'button';
            options.editable = true;

            switch(detailItem['status']) {
              case 'pending':
                options.hint = 'Approve';
                break;
              case 'approved':
                options.hint = 'Process';
                break;
              case 'processed':
                options.hint = 'Complete';
                break;
              case 'completed':
                options.hint = 'Archive';
                break;
              default:
                options.hint = 'View';
            }
          }

          return options;
        })
      }
    });

    mockEditService.subjects.item$.next({
      items: [
        { id: 1, name: 'Order #1001', status: 'pending', amount: 150.00 },
        { id: 2, name: 'Order #1002', status: 'approved', amount: 275.50 },
        { id: 3, name: 'Order #1003', status: 'processed', amount: 89.99 },
        { id: 4, name: 'Order #1004', status: 'completed', amount: 450.00 },
        { id: 5, name: 'Order #1005', status: 'pending', amount: 320.00 },
      ]
    });

    return {
      props: {
        ...args,
        initialLayoutItem: createDetailGridLayoutItem(
          'items',
          'Button Columns Demo',
          {
            editMode: 'instant',
            add: true,
            update: true,
            delete: true,
            columns: [
              { dataMember: 'id', caption: 'ID', type: 'number' },
              { dataMember: 'name', caption: 'Name', type: 'string', editable: true },
              { dataMember: 'status', caption: 'Status', type: 'string', editable: true },
              { dataMember: 'amount', caption: 'Amount', type: 'number', editable: true },
              { dataMember: 'static_view', caption: '', type: 'button', hint: 'View Details', editable: true },
              { dataMember: 'dynamic_action', caption: 'Action', type: 'dynamic' }
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

export const DynamicButtonTypes: Story = {
  render: (args) => {

    const mockEditService = createMockedEditService({
      overrides: {
        initNewDetailItem$: new BehaviorSubject(({ detailItem }) => {
          detailItem['id'] = 0;
          detailItem['name'] = 'New item';
          detailItem['type'] = 'info';
        }),
        detailGridCellPreparing$: new BehaviorSubject(({ dataMember, identifier, detailItem, options}) => {

          // Dynamic column that can be button, bool, or string based on row type
          if (dataMember === 'items' && identifier === 'dynamic_field') {
            switch(detailItem['type']) {
              case 'action':
                options.type = 'button';
                options.hint = 'Execute';
                options.editable = true;
                break;
              case 'toggle':
                options.type = 'bool';
                options.editable = true;
                break;
              case 'info':
              default:
                options.type = 'string';
                options.editable = false;
                break;
            }
          }

          return options;
        })
      }
    });

    mockEditService.subjects.item$.next({
      items: [
        { id: 1, name: 'Task A', type: 'action', dynamic_field: null },
        { id: 2, name: 'Task B', type: 'toggle', dynamic_field: true },
        { id: 3, name: 'Task C', type: 'info', dynamic_field: 'Read-only information' },
        { id: 4, name: 'Task D', type: 'action', dynamic_field: null },
        { id: 5, name: 'Task E', type: 'toggle', dynamic_field: false },
        { id: 6, name: 'Task F', type: 'info', dynamic_field: 'Additional notes' },
      ]
    });

    return {
      props: {
        ...args,
        initialLayoutItem: createDetailGridLayoutItem(
          'items',
          'Dynamic Button Types Demo',
          {
            editMode: 'instant',
            add: true,
            update: true,
            delete: true,
            columns: [
              { dataMember: 'id', caption: 'ID', type: 'number' },
              { dataMember: 'name', caption: 'Name', type: 'string', editable: true },
              { dataMember: 'type', caption: 'Type', type: 'string', editable: true },
              { dataMember: 'dynamic_field', caption: 'Dynamic Field (Button/Bool/String)', type: 'dynamic', editable: true }
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

export const DateTimeColumns: Story = {
  render: (args) => {

    const mockEditService = createMockedEditService({
      overrides: {
        initNewDetailItem$: new BehaviorSubject(({ detailItem }) => {
          detailItem['id'] = 0;
          detailItem['title'] = 'New Event';
          detailItem['category'] = 'meeting';
        }),
        detailGridCellPreparing$: new BehaviorSubject(({ dataMember, identifier, detailItem, options}) => {

          // Dynamic column that becomes date or datetime based on category
          if (dataMember === 'items' && identifier === 'dynamic_datetime_field') {
            switch(detailItem['category']) {
              case 'meeting':
              case 'appointment':
                options.type = 'datetime';
                options.editable = true;
                break;
              case 'deadline':
              case 'birthday':
                options.type = 'date';
                options.editable = true;
                break;
              default:
                options.type = 'string';
                options.editable = false;
                break;
            }
          }

          return options;
        })
      }
    });

    mockEditService.subjects.item$.next({
      items: [
        { id: 1, title: 'Team Meeting', category: 'meeting', startDate: new Date('2024-06-15'), timestamp: new Date('2024-06-15T14:00:00'), dynamic_datetime_field: new Date('2024-06-15T14:00:00') },
        { id: 2, title: 'Doctor Appointment', category: 'appointment', startDate: new Date('2024-07-10'), timestamp: new Date('2024-07-10T10:30:00'), dynamic_datetime_field: new Date('2024-07-10T10:30:00') },
        { id: 3, title: 'Project Deadline', category: 'deadline', startDate: new Date('2024-08-01'), timestamp: new Date('2024-08-01T23:59:00'), dynamic_datetime_field: new Date('2024-08-01') },
        { id: 4, title: 'Birthday Party', category: 'birthday', startDate: new Date('2024-09-20'), timestamp: new Date('2024-09-20T18:00:00'), dynamic_datetime_field: new Date('2024-09-20') },
        { id: 5, title: 'Note', category: 'other', startDate: new Date('2024-10-05'), timestamp: new Date('2024-10-05T12:00:00'), dynamic_datetime_field: 'No specific time' },
      ]
    });

    return {
      props: {
        ...args,
        initialLayoutItem: createDetailGridLayoutItem(
          'items',
          'Date and DateTime Columns Demo',
          {
            editMode: 'instant',
            add: true,
            update: true,
            delete: true,
            columns: [
              { dataMember: 'id', caption: 'ID', type: 'number' },
              { dataMember: 'title', caption: 'Title', type: 'string', editable: true },
              { dataMember: 'category', caption: 'Category', type: 'string', editable: true },
              { dataMember: 'startDate', caption: 'Date', type: 'date', editable: true },
              { dataMember: 'timestamp', caption: 'Date & Time', type: 'datetime', editable: true },
              { dataMember: 'dynamic_datetime_field', caption: 'Dynamic Date/DateTime Field', type: 'dynamic', editable: true }
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

export const MultilookupColumn: Story = {
  render: (args) => {

    const categoryLookupValues = [
      { value: 'cat-1', text: 'Electronics' },
      { value: 'cat-2', text: 'Books' },
      { value: 'cat-3', text: 'Clothing' },
      { value: 'cat-4', text: 'Food' },
      { value: 'cat-5', text: 'Sports' },
    ];

    const tagLookupValues = [
      { value: 'tag-1', text: 'New' },
      { value: 'tag-2', text: 'Popular' },
      { value: 'tag-3', text: 'Sale' },
      { value: 'tag-4', text: 'Limited' },
      { value: 'tag-5', text: 'Featured' },
    ];

    const mockLookupService = createMockedLookupService({
      lookups: {
        categoryLookup: {
          type: 'lookup',
          store: {
            listFunc: () => of(categoryLookupValues),
            byIdFunc: (id) => of(categoryLookupValues.find(v => v.value === id))
          },
          displayMember: 'text',
          valueMember: 'value'
        } as LookupDescriptor,
        tagLookup: {
          type: 'lookup',
          store: {
            listFunc: () => of(tagLookupValues),
            byIdFunc: (id) => of(tagLookupValues.find(v => v.value === id))
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
          detailItem['name'] = 'New Product';
          detailItem['categories'] = [];
          detailItem['tags'] = [];
        }),
      }
    });

    mockEditService.subjects.item$.next({
      items: [
        { id: 1, name: 'Laptop', description: 'High-performance laptop', categories: ['cat-1', 'cat-3'], tags: ['tag-2', 'tag-5'] },
        { id: 2, name: 'Novel', description: 'Bestselling novel', categories: ['cat-2'], tags: ['tag-1', 'tag-2'] },
        { id: 3, name: 'Running Shoes', description: 'Comfortable running shoes', categories: ['cat-3', 'cat-5'], tags: ['tag-3', 'tag-4'] },
        { id: 4, name: 'Organic Apple', description: 'Fresh organic apples', categories: ['cat-4'], tags: ['tag-1'] },
        { id: 5, name: 'Smartphone', description: 'Latest smartphone model', categories: ['cat-1'], tags: ['tag-1', 'tag-2', 'tag-5'] },
      ]
    });

    return {
      props: {
        ...args,
        initialLayoutItem: createDetailGridLayoutItem(
          'items',
          'Multilookup Columns Demo',
          {
            editMode: 'instant',
            add: true,
            update: true,
            delete: true,
            columns: [
              { dataMember: 'id', caption: 'ID', type: 'number' },
              { dataMember: 'name', caption: 'Product Name', type: 'string', editable: true },
              { dataMember: 'description', caption: 'Description', type: 'string', editable: true },
              { dataMember: 'categories', caption: 'Categories', type: 'multilookup', editable: true, lookup: 'categoryLookup', displayExpr: 'text', valueExpr: 'value' },
              { dataMember: 'tags', caption: 'Tags', type: 'multilookup', editable: true, lookup: 'tagLookup', displayExpr: 'text', valueExpr: 'value' },
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

    // Test: Data rows should be rendered
    await waitFor(
      async () => {
        const rows = canvasElement.querySelectorAll('.dx-data-row');
        await expect(rows.length).toBe(5);
      },
      { timeout: 5000 }
    );

    // Test: Column headers should exist
    await waitFor(
      async () => {
        const categoriesHeader = canvas.queryByText('Categories');
        await expect(categoriesHeader).toBeTruthy();
        const tagsHeader = canvas.queryByText('Tags');
        await expect(tagsHeader).toBeTruthy();
      },
      { timeout: 5000 }
    );
  },
};

export const DynamicMultilookupColumn: Story = {
  render: (args) => {

    const categoryLookupValues = [
      { value: 'cat-1', text: 'Electronics' },
      { value: 'cat-2', text: 'Books' },
      { value: 'cat-3', text: 'Clothing' },
      { value: 'cat-4', text: 'Food' },
      { value: 'cat-5', text: 'Sports' },
    ];

    const skillLookupValues = [
      { value: 'skill-1', text: 'JavaScript' },
      { value: 'skill-2', text: 'TypeScript' },
      { value: 'skill-3', text: 'Angular' },
      { value: 'skill-4', text: 'React' },
      { value: 'skill-5', text: 'Node.js' },
    ];

    const mockLookupService = createMockedLookupService({
      lookups: {
        categoryLookup: {
          type: 'lookup',
          store: {
            listFunc: () => of(categoryLookupValues),
            byIdFunc: (id) => of(categoryLookupValues.find(v => v.value === id))
          },
          displayMember: 'text',
          valueMember: 'value'
        } as LookupDescriptor,
        skillLookup: {
          type: 'lookup',
          store: {
            listFunc: () => of(skillLookupValues),
            byIdFunc: (id) => of(skillLookupValues.find(v => v.value === id))
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
          detailItem['name'] = 'New Item';
          detailItem['type'] = 'Product';
          detailItem['dynamic_multilookup'] = [];
        }),
        detailGridCellPreparing$: new BehaviorSubject(({ dataMember, identifier, detailItem, options}) => {

          // Dynamic column that becomes multilookup based on item type
          if (dataMember === 'items' && identifier === 'dynamic_multilookup') {
            if (detailItem['type'] === 'Product') {
              options.type = 'multilookup';
              options.lookup = 'categoryLookup';
              options.displayExpr = 'text';
              options.valueExpr = 'value';
              options.editable = true;
            } else if (detailItem['type'] === 'Person') {
              options.type = 'multilookup';
              options.lookup = 'skillLookup';
              options.displayExpr = 'text';
              options.valueExpr = 'value';
              options.editable = true;
            } else {
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
        { id: 1, name: 'Laptop', type: 'Product', description: 'Gaming laptop', dynamic_multilookup: ['cat-1', 'cat-3'] },
        { id: 2, name: 'John Doe', type: 'Person', description: 'Full-stack Developer', dynamic_multilookup: ['skill-1', 'skill-2', 'skill-3'] },
        { id: 3, name: 'Smartphone', type: 'Product', description: 'Latest model', dynamic_multilookup: ['cat-1'] },
        { id: 4, name: 'Jane Smith', type: 'Person', description: 'Frontend Developer', dynamic_multilookup: ['skill-2', 'skill-4'] },
        { id: 5, name: 'Generic Item', type: 'Other', description: 'Miscellaneous', dynamic_multilookup: 'N/A' },
      ]
    });

    return {
      props: {
        ...args,
        initialLayoutItem: createDetailGridLayoutItem(
          'items',
          'Dynamic Multilookup Column Demo',
          {
            editMode: 'instant',
            add: true,
            update: true,
            delete: true,
            columns: [
              { dataMember: 'id', caption: 'ID', type: 'number' },
              { dataMember: 'name', caption: 'Name', type: 'string', editable: true },
              { dataMember: 'type', caption: 'Type', type: 'string', editable: true },
              { dataMember: 'description', caption: 'Description', type: 'string', editable: true },
              { dataMember: 'dynamic_multilookup', caption: 'Dynamic Multilookup', type: 'dynamic', editable: true },
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

    // Test: Data rows should be rendered
    await waitFor(
      async () => {
        const rows = canvasElement.querySelectorAll('.dx-data-row');
        await expect(rows.length).toBe(5);
      },
      { timeout: 5000 }
    );

    // Test: Column headers should exist
    await waitFor(
      async () => {
        const dynamicMultilookupHeader = canvas.queryByText('Dynamic Multilookup');
        await expect(dynamicMultilookupHeader).toBeTruthy();
      },
      { timeout: 5000 }
    );
  },
};

export const DynamicStringAndNumberColumns: Story = {
  render: (args) => {

    const mockLookupService = createMockedLookupService({
      lookups: {}
    });

    const mockEditService = createMockedEditService({
      overrides: {
        initNewDetailItem$: new BehaviorSubject(({ detailItem }) => {
          detailItem['id'] = 0;
          detailItem['name'] = 'New Item';
          detailItem['description'] = '';
          detailItem['dynamic_string_value'] = '';
          detailItem['dynamic_number_value'] = 0;
          detailItem['dynamic_price'] = 0;
        }),
        detailGridCellPreparing$: new BehaviorSubject(({ dataMember, identifier, options}) => {

          // Dynamic column that becomes a string
          if (dataMember === 'items' && identifier === 'dynamic_string_value') {
            options.type = 'string';
            options.editable = true;
          }

          // Dynamic column that becomes a number
          if (dataMember === 'items' && identifier === 'dynamic_number_value') {
            options.type = 'number';
            options.editable = true;
          }

          // Dynamic column that becomes a formatted number (price)
          if (dataMember === 'items' && identifier === 'dynamic_price') {
            options.type = 'number';
            options.editable = true;
            options.precision = 2;
          }

          return options;
        })
      }
    });

    mockEditService.subjects.item$.next({
      items: [
        {
          id: 1,
          name: 'Product A',
          description: 'Description for Product A',
          dynamic_string_value: 'Dynamic String 1',
          dynamic_number_value: 100,
          dynamic_price: 19.99
        },
        {
          id: 2,
          name: 'Product B',
          description: 'Description for Product B',
          dynamic_string_value: 'Dynamic String 2',
          dynamic_number_value: 250,
          dynamic_price: 49.95
        },
        {
          id: 3,
          name: 'Product C',
          description: 'Description for Product C',
          dynamic_string_value: 'Dynamic String 3',
          dynamic_number_value: 75,
          dynamic_price: 9.99
        },
      ]
    });

    return {
      props: {
        ...args,
        initialLayoutItem: createDetailGridLayoutItem(
          'items',
          'Dynamic String and Number Columns',
          {
            editMode: 'instant',
            add: true,
            update: true,
            delete: true,
            columns: [
              { dataMember: 'id', caption: 'ID', type: 'number' },
              { dataMember: 'name', caption: 'Product Name', type: 'string', editable: true },
              { dataMember: 'description', caption: 'Description', type: 'string', editable: true },
              { dataMember: 'dynamic_string_value', caption: 'Dynamic String', type: 'dynamic', editable: true },
              { dataMember: 'dynamic_number_value', caption: 'Dynamic Number', type: 'dynamic', editable: true },
              { dataMember: 'dynamic_price', caption: 'Dynamic Price', type: 'dynamic', editable: true },
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

    // Test: Data rows should be rendered
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
        const dynamicStringHeader = canvas.queryByText('Dynamic String');
        await expect(dynamicStringHeader).toBeTruthy();
      },
      { timeout: 5000 }
    );

    await waitFor(
      async () => {
        const dynamicNumberHeader = canvas.queryByText('Dynamic Number');
        await expect(dynamicNumberHeader).toBeTruthy();
      },
      { timeout: 5000 }
    );

    await waitFor(
      async () => {
        const dynamicPriceHeader = canvas.queryByText('Dynamic Price');
        await expect(dynamicPriceHeader).toBeTruthy();
      },
      { timeout: 5000 }
    );

    // Test: Dynamic string values should be visible
    await waitFor(
      async () => {
        const stringValue = canvas.queryByText('Dynamic String 1');
        await expect(stringValue).toBeTruthy();
      },
      { timeout: 5000 }
    );
  },
};

export const DynamicColumnsWithMixedTypes: Story = {
  render: (args) => {

    const mockLookupService = createMockedLookupService({
      lookups: {}
    });

    const mockEditService = createMockedEditService({
      overrides: {
        initNewDetailItem$: new BehaviorSubject(({ detailItem }) => {
          detailItem['id'] = 0;
          detailItem['dynamic_code'] = '';
          detailItem['dynamic_quantity'] = 0;
          detailItem['dynamic_percentage'] = 0;
          detailItem['dynamic_amount'] = 0;
          detailItem['dynamic_comment'] = '';
        }),
        detailGridCellPreparing$: new BehaviorSubject(({ dataMember, identifier, options}) => {

          // Dynamic column that becomes a string (code)
          if (dataMember === 'items' && identifier === 'dynamic_code') {
            options.type = 'string';
            options.editable = true;
            options.required = true;
          }

          // Dynamic column that becomes a number (quantity)
          if (dataMember === 'items' && identifier === 'dynamic_quantity') {
            options.type = 'number';
            options.editable = true;
            options.precision = 0;
          }

          // Dynamic column that becomes a number (percentage)
          if (dataMember === 'items' && identifier === 'dynamic_percentage') {
            options.type = 'number';
            options.editable = true;
            options.precision = 2;
          }

          // Dynamic column that becomes a number (amount) - readonly in this case
          if (dataMember === 'items' && identifier === 'dynamic_amount') {
            options.type = 'number';
            options.editable = false;
            options.precision = 2;
          }

          // Dynamic column that becomes a string (comment) - multiline
          if (dataMember === 'items' && identifier === 'dynamic_comment') {
            options.type = 'string';
            options.editable = true;
          }

          return options;
        })
      }
    });

    mockEditService.subjects.item$.next({
      items: [
        {
          id: 1,
          dynamic_code: 'CODE-001',
          dynamic_quantity: 10,
          dynamic_percentage: 0.15,
          dynamic_amount: 150.00,
          dynamic_comment: 'First item comment'
        },
        {
          id: 2,
          dynamic_code: 'CODE-002',
          dynamic_quantity: 25,
          dynamic_percentage: 0.20,
          dynamic_amount: 500.00,
          dynamic_comment: 'Second item comment'
        },
        {
          id: 3,
          dynamic_code: 'CODE-003',
          dynamic_quantity: 5,
          dynamic_percentage: 0.10,
          dynamic_amount: 50.00,
          dynamic_comment: 'Third item comment'
        },
        {
          id: 4,
          dynamic_code: 'CODE-004',
          dynamic_quantity: 100,
          dynamic_percentage: 0.25,
          dynamic_amount: 2500.00,
          dynamic_comment: 'Fourth item comment'
        },
      ]
    });

    return {
      props: {
        ...args,
        initialLayoutItem: createDetailGridLayoutItem(
          'items',
          'Dynamic Columns with Mixed Types',
          {
            editMode: 'instant',
            add: true,
            update: true,
            delete: true,
            columns: [
              { dataMember: 'id', caption: 'ID', type: 'number' },
              { dataMember: 'dynamic_code', caption: 'Code (Dynamic String)', type: 'dynamic', editable: true },
              { dataMember: 'dynamic_quantity', caption: 'Quantity (Dynamic Number)', type: 'dynamic', editable: true },
              { dataMember: 'dynamic_percentage', caption: 'Discount % (Dynamic Number)', type: 'dynamic', editable: true },
              { dataMember: 'dynamic_amount', caption: 'Amount (Dynamic Number, Readonly)', type: 'dynamic', editable: false },
              { dataMember: 'dynamic_comment', caption: 'Comment (Dynamic String)', type: 'dynamic', editable: true },
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

    // Test: Data rows should be rendered
    await waitFor(
      async () => {
        const rows = canvasElement.querySelectorAll('.dx-data-row');
        await expect(rows.length).toBe(4);
      },
      { timeout: 5000 }
    );

    // Test: Column headers should exist
    await waitFor(
      async () => {
        const codeHeader = canvas.queryByText('Code (Dynamic String)');
        await expect(codeHeader).toBeTruthy();
      },
      { timeout: 5000 }
    );

    await waitFor(
      async () => {
        const quantityHeader = canvas.queryByText('Quantity (Dynamic Number)');
        await expect(quantityHeader).toBeTruthy();
      },
      { timeout: 5000 }
    );

    await waitFor(
      async () => {
        const percentageHeader = canvas.queryByText('Discount % (Dynamic Number)');
        await expect(percentageHeader).toBeTruthy();
      },
      { timeout: 5000 }
    );

    await waitFor(
      async () => {
        const amountHeader = canvas.queryByText('Amount (Dynamic Number, Readonly)');
        await expect(amountHeader).toBeTruthy();
      },
      { timeout: 5000 }
    );

    // Test: Dynamic string values should be visible
    await waitFor(
      async () => {
        const codeValue = canvas.queryByText('CODE-001');
        await expect(codeValue).toBeTruthy();
      },
      { timeout: 5000 }
    );
  },
};


