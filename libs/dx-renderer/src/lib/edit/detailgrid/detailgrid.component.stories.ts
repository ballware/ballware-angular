import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig, moduleMetadata } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { EditLayoutDetailGridComponent } from './detailgrid.component';
import { EDIT_SERVICE, LOOKUP_SERVICE, TRANSLATOR } from '@ballware/meta-services';
import { createMockedEditService } from '@storybook-helpers/edit.service.mock';
import { createMockedLookupService } from '@storybook-helpers/lookup.service.mock';
import { createSimpleTranslator } from '@storybook-helpers/translator.mock';
import { of } from 'rxjs';
import { importProvidersFrom } from '@angular/core';
import { I18NextModule } from 'angular-i18next';
import { I18N_PROVIDERS } from '../../i18n/i18n';
import { expect, within, waitFor } from 'storybook/test';

const meta: Meta<EditLayoutDetailGridComponent> = {
  title: 'DX Renderer/Edit/DetailGrid',
  component: EditLayoutDetailGridComponent,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        importProvidersFrom(I18NextModule.forRoot()),
        I18N_PROVIDERS,
        {
          provide: TRANSLATOR,
          useValue: createSimpleTranslator()
        },
        {
          provide: LOOKUP_SERVICE,
          useFactory: () => createMockedLookupService().service
        },
        {
          provide: EDIT_SERVICE,
          useFactory: () => createMockedEditService().service
        }
      ],
    }),
    moduleMetadata({
      imports: [EditLayoutDetailGridComponent],
    }),
  ],
};

export default meta;
type Story = StoryObj<EditLayoutDetailGridComponent>;

// Helper function to create a mock layout item for detail grid
const createDetailGridLayoutItem = (
  dataMember: string,
  caption: string,
  columns: any[],
  options: Record<string, unknown> = {}
) => ({
  type: 'detailgrid',
  options: {
    dataMember,
    caption,
    columns,
    ...options,
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
          [
            { dataField: 'name', caption: 'Name', dataType: 'string' },
            { dataField: 'quantity', caption: 'Quantity', dataType: 'number' },
            { dataField: 'price', caption: 'Price', dataType: 'number' },
          ]
        ),
        onEntered: () => console.log('Field entered'),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: {
        dataMember$: of('items'),
        value: [
          { name: 'Item 1', quantity: 2, price: 10.99 },
          { name: 'Item 2', quantity: 1, price: 25.50 },
          { name: 'Item 3', quantity: 5, price: 5.00 },
        ],
      },
      editing: {
        columns: [
          { dataField: 'name', caption: 'Name', dataType: 'string' },
          { dataField: 'quantity', caption: 'Quantity', dataType: 'number' },
          { dataField: 'price', caption: 'Price', dataType: 'number' },
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
    const grid = canvasElement.querySelector('.dx-datagrid');
    await expect(grid).toBeTruthy();

    // Test: Caption should be visible
    const caption = canvas.getByText('Items');
    await expect(caption).toBeTruthy();

    // Wait for data rows to be rendered (DevExtreme needs time to render)
    await waitFor(
      async () => {
        const rows = canvasElement.querySelectorAll('.dx-data-row');
        await expect(rows.length).toBe(3);
      },
      { timeout: 5000 }
    );

    // Test: Column headers should exist
    const nameHeader = canvas.getByText('Name');
    await expect(nameHeader).toBeTruthy();
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
          [
            { dataField: 'name', caption: 'Name', dataType: 'string' },
            { dataField: 'description', caption: 'Description', dataType: 'string' },
          ]
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
    const canvas = within(canvasElement);

    // Test: Grid should be visible
    const grid = canvasElement.querySelector('.dx-datagrid');
    await expect(grid).toBeTruthy();

    // Test: No data message or empty grid
    const rows = canvasElement.querySelectorAll('.dx-data-row');
    await expect(rows.length).toBe(0);
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
          [
            { dataField: 'id', caption: 'ID', dataType: 'number' },
            { dataField: 'status', caption: 'Status', dataType: 'string' },
            { dataField: 'date', caption: 'Date', dataType: 'date' },
          ]
        ),
        onEntered: () => console.log('Field entered'),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(true) },
      value: {
        dataMember$: of('readonlyItems'),
        value: [
          { id: 1, status: 'Active', date: new Date('2024-01-15') },
          { id: 2, status: 'Pending', date: new Date('2024-02-20') },
          { id: 3, status: 'Completed', date: new Date('2024-03-10') },
        ],
      },
      editing: {
        columns: [
          { dataField: 'id', caption: 'ID', dataType: 'number' },
          { dataField: 'status', caption: 'Status', dataType: 'string' },
          { dataField: 'date', caption: 'Date', dataType: 'date' },
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
          [
            { dataField: 'product', caption: 'Product', dataType: 'string' },
            { dataField: 'category', caption: 'Category', dataType: 'string' },
            { dataField: 'stock', caption: 'Stock', dataType: 'number' },
          ]
        ),
        onEntered: () => console.log('Field entered'),
      },
      visible: { visible$: of(true) },
      readonly: { readonly$: of(false) },
      value: {
        dataMember$: of('rowEditItems'),
        value: [
          { product: 'Laptop', category: 'Electronics', stock: 15 },
          { product: 'Mouse', category: 'Accessories', stock: 50 },
          { product: 'Keyboard', category: 'Accessories', stock: 30 },
        ],
      },
      editing: {
        columns: [
          { dataField: 'product', caption: 'Product', dataType: 'string' },
          { dataField: 'category', caption: 'Category', dataType: 'string' },
          { dataField: 'stock', caption: 'Stock', dataType: 'number' },
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
          [
            { dataField: 'col1', caption: 'Column 1', dataType: 'string' },
            { dataField: 'col2', caption: 'Column 2', dataType: 'string' },
            { dataField: 'col3', caption: 'Column 3', dataType: 'number' },
            { dataField: 'col4', caption: 'Column 4', dataType: 'number' },
            { dataField: 'col5', caption: 'Column 5', dataType: 'boolean' },
            { dataField: 'col6', caption: 'Column 6', dataType: 'date' },
          ]
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
          { dataField: 'col1', caption: 'Column 1', dataType: 'string' },
          { dataField: 'col2', caption: 'Column 2', dataType: 'string' },
          { dataField: 'col3', caption: 'Column 3', dataType: 'number' },
          { dataField: 'col4', caption: 'Column 4', dataType: 'number' },
          { dataField: 'col5', caption: 'Column 5', dataType: 'boolean' },
          { dataField: 'col6', caption: 'Column 6', dataType: 'date' },
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
          [
            { dataField: 'field1', caption: 'Field 1', dataType: 'string' },
          ]
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
          { dataField: 'field1', caption: 'Field 1', dataType: 'string' },
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
          [
            { dataField: 'id', caption: 'ID', dataType: 'number' },
            { dataField: 'name', caption: 'Name', dataType: 'string' },
            { dataField: 'value', caption: 'Value', dataType: 'number' },
          ]
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
        })),
      },
      editing: {
        columns: [
          { dataField: 'id', caption: 'ID', dataType: 'number' },
          { dataField: 'name', caption: 'Name', dataType: 'string' },
          { dataField: 'value', caption: 'Value', dataType: 'number' },
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

