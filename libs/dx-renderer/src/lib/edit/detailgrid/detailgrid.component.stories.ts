import { argsToTemplate, Meta, StoryObj } from '@storybook/angular';
import { applicationConfig, moduleMetadata } from '@storybook/angular';
import { provideAnimations } from '@angular/platform-browser/animations';
import { EditLayoutDetailGridComponent } from './detailgrid.component';
import { EDIT_SERVICE, LOOKUP_SERVICE, TRANSLATOR } from '@ballware/meta-services';
import { createMockedEditService } from '@storybook-helpers/edit.service.mock';
import { createMockedLookupService } from '@storybook-helpers/lookup.service.mock';
import { createSimpleTranslator } from '@storybook-helpers/translator.mock';
import { BehaviorSubject, of } from 'rxjs';
import { importProvidersFrom } from '@angular/core';
import { I18NextModule } from 'angular-i18next';
import { I18N_PROVIDERS } from '../../i18n/i18n';
import { expect, within, waitFor, userEvent } from 'storybook/test';
import { EditLayoutItemOptions, GridLayoutColumn } from '@ballware/meta-model';
import { DetailCollectionEditingOptions } from '../../directives';

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
          {
            columns: [
              { dataMember: 'name', caption: 'Name', type: 'string' },
              { dataMember: 'description', caption: 'Description', type: 'string' },
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
          {
            columns: [
              { dataMember: 'id', caption: 'ID', type: 'number' },
              { dataMember: 'status', caption: 'Status', type: 'string' },
              { dataMember: 'date', caption: 'Date', type: 'date' },
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
          {
            columns: [
              { dataMember: 'product', caption: 'Product', type: 'string' },
              { dataMember: 'category', caption: 'Category', type: 'string' },
              { dataMember: 'stock', caption: 'Stock', type: 'number' },
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

export const RowEditing: Story = {
  render: (args) => {

    const mockEditService = createMockedEditService({
      overrides: {
        initNewDetailItem$: new BehaviorSubject(({ detailItem }) => {
          detailItem['id'] = 0;
          detailItem['name'] = 'New item';
          detailItem['value'] = 0;
        })
      }
    });

    mockEditService.subjects.item$.next({
      items: [
        { id: 1, name: 'Dynamic Item 1', value: 100 },
        { id: 2, name: 'Dynamic Item 2', value: 200 },
        { id: 3, name: 'Dynamic Item 3', value: 300 },
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
            ],
          }
        )
      },
      template: `<ballware-edit-detailgrid [initialLayoutItem]='initialLayoutItem'></ballware-edit-detailgrid>`,
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
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Warte darauf, dass das Grid vollständig geladen ist
    await waitFor(
      async () => {
        const grid = canvasElement.querySelector('.dx-datagrid');
        await expect(grid).toBeTruthy();
      },
      { timeout: 5000 }
    );

    // Test 1: Überprüfe initiale Daten
    await waitFor(
      async () => {
        const dataRows = canvasElement.querySelectorAll('.dx-data-row');
        await expect(dataRows.length).toBe(3);
      },
      { timeout: 5000 }
    );

    // Test 2: Add-Funktionalität - Klicke auf "Add Row" Button
    const addButton = canvasElement.querySelector('.dx-datagrid-addrow-button') as HTMLElement;
    await expect(addButton).toBeTruthy();

    await userEvent.click(addButton);

    // Warte darauf, dass die neue Zeile im Edit-Modus erscheint
    await waitFor(
      async () => {
        const editRow = canvasElement.querySelector('.dx-row-inserted');
        await expect(editRow).toBeTruthy();
      },
      { timeout: 3000 }
    );

    // Finde die Input-Felder in der neuen Zeile
    const editRow = canvasElement.querySelector('.dx-row-inserted');
    await expect(editRow).toBeTruthy();

    // Überprüfe, dass die Felder mit Initialwerten gefüllt sind
    const nameInput = editRow?.querySelector('input[name*="name"]') as HTMLInputElement;
    if (nameInput) {
      await expect(nameInput.value).toBe('New item');
    }

    // Speichere die neue Zeile
    const saveButton = canvasElement.querySelector('.dx-link-save') as HTMLElement;
    if (saveButton) {
      await userEvent.click(saveButton);

      // Warte darauf, dass die Zeile gespeichert wurde
      await waitFor(
        async () => {
          const dataRows = canvasElement.querySelectorAll('.dx-data-row');
          await expect(dataRows.length).toBe(4);
        },
        { timeout: 3000 }
      );
    }

    // Test 3: Update-Funktionalität - Doppelklick auf eine Zeile zum Bearbeiten
    const firstDataRow = canvasElement.querySelector('.dx-data-row') as HTMLElement;
    await expect(firstDataRow).toBeTruthy();

    // Klicke auf Edit-Button in der ersten Zeile
    const editButton = firstDataRow?.querySelector('.dx-link-edit') as HTMLElement;
    if (editButton) {
      await userEvent.click(editButton);

      // Warte darauf, dass die Zeile in den Edit-Modus wechselt
      await waitFor(
        async () => {
          const editingRow = canvasElement.querySelector('.dx-edit-row');
          await expect(editingRow).toBeTruthy();
        },
        { timeout: 3000 }
      );

      // Finde das Name-Input-Feld und ändere den Wert
      const editingRow = canvasElement.querySelector('.dx-edit-row');
      const nameInputField = editingRow?.querySelector('input[name*="name"]') as HTMLInputElement;

      if (nameInputField) {
        await userEvent.clear(nameInputField);
        await userEvent.type(nameInputField, 'Updated Item 1');

        // Speichere die Änderungen
        const updateSaveButton = canvasElement.querySelector('.dx-link-save') as HTMLElement;
        if (updateSaveButton) {
          await userEvent.click(updateSaveButton);

          // Warte darauf, dass die Änderungen gespeichert wurden
          await waitFor(
            async () => {
              const updatedCell = canvas.queryByText('Updated Item 1');
              await expect(updatedCell).toBeTruthy();
            },
            { timeout: 3000 }
          );
        }
      }
    }

    // Test 4: Delete-Funktionalität - Lösche eine Zeile
    await waitFor(
      async () => {
        const dataRows = canvasElement.querySelectorAll('.dx-data-row');
        await expect(dataRows.length).toBeGreaterThan(0);
      },
      { timeout: 2000 }
    );

    const rowToDelete = canvasElement.querySelector('.dx-data-row:nth-child(2)') as HTMLElement;
    await expect(rowToDelete).toBeTruthy();

    // Klicke auf Delete-Button
    const deleteButton = rowToDelete?.querySelector('.dx-link-delete') as HTMLElement;
    if (deleteButton) {
      await userEvent.click(deleteButton);

      // Warte auf Bestätigungsdialog und klicke auf "Yes"
      await waitFor(
        async () => {
          const confirmDialog = document.querySelector('.dx-dialog-root, .dx-overlay-content');
          await expect(confirmDialog).toBeTruthy();
        },
        { timeout: 2000 }
      );

      // Finde und klicke auf Yes-Button im Dialog
      const yesButton = document.querySelector('.dx-dialog-button.dx-button:first-child, .dx-dialog-button:first-child') as HTMLElement;
      if (yesButton) {
        await userEvent.click(yesButton);
      }

      // Warte darauf, dass die Zeile gelöscht wurde
      await waitFor(
        async () => {
          // Überprüfe, dass die Anzahl der Zeilen reduziert wurde
          const remainingRows = canvasElement.querySelectorAll('.dx-data-row');
          await expect(remainingRows.length).toBeLessThan(4);
        },
        { timeout: 3000 }
      );
    }

    // Finale Überprüfung: Grid sollte noch funktionsfähig sein
    const finalGrid = canvasElement.querySelector('.dx-datagrid');
    await expect(finalGrid).toBeTruthy();
  }
};
