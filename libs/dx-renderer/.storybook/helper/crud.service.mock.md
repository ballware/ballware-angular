# CrudService Mock für Storybook

Diese Datei bietet Mock-Implementierungen für den `CrudService`, die in Storybook Stories verwendet werden können.

## Verwendung

### Einfache Verwendung

```typescript
import { CRUD_SERVICE } from '@ballware/meta-services';
import { createSimpleCrudServiceMock } from '@storybook-helpers/crud.service.mock';

// In Storybook Decorators
{
  provide: CRUD_SERVICE,
  useFactory: () => createSimpleCrudServiceMock().service
}
```

### Erweiterte Verwendung mit Optionen

```typescript
import { CRUD_SERVICE } from '@ballware/meta-services';
import { createMockedCrudService } from '@storybook-helpers/crud.service.mock';

const crudMock = createMockedCrudService({
  queryIdentifier: 'my-query',
  addMenuItems: [
    { id: 'add1', text: 'Add Item 1', icon: 'plus' }
  ],
  exportMenuItems: [
    { id: 'export1', text: 'Export to Excel', icon: 'exportxlsx' }
  ],
  importMenuItems: [
    { id: 'import1', text: 'Import from CSV', icon: 'import' }
  ],
  headCustomFunctions: [
    { 
      id: 'custom1', 
      text: 'Custom Function',
      type: 'add'
    }
  ]
});

// In Storybook Decorators
{
  provide: CRUD_SERVICE,
  useValue: crudMock.service
}
```

### Zugriff auf Subjects zur Manipulation

```typescript
const crudMock = createMockedCrudService();

// Später in Tests oder Stories
crudMock.subjects.itemDialog$.next({
  mode: EditModes.CREATE,
  entity: 'TestEntity',
  item: {},
  title: 'Create New Item',
  supportContinueAfterSave: true,
  apply: (editUtil, item, continueAfterSave) => {
    console.log('Item saved:', item);
  },
  cancel: () => {
    console.log('Cancelled');
  }
});
```

### Überschreiben von Funktionen

```typescript
const customFunctionAllowed = (identifier: FunctionIdentifier, data: CrudItem) => {
  // Custom logic
  return identifier !== 'delete';
};

const crudMock = createMockedCrudService({
  overrides: {
    functionAllowed$: new BehaviorSubject(customFunctionAllowed)
  }
});
```

## API

### createMockedCrudService(options?)

Erstellt einen vollständig konfigurierbaren CrudService Mock.

**Options:**
- `queryIdentifier?: string` - Query Identifier (Standard: 'test-query')
- `addMenuItems?: CrudEditMenuItem[]` - Menu-Items für Hinzufügen-Aktionen
- `exportMenuItems?: CrudEditMenuItem[]` - Menu-Items für Export-Aktionen
- `importMenuItems?: CrudEditMenuItem[]` - Menu-Items für Import-Aktionen
- `headCustomFunctions?: EntityCustomFunction[]` - Custom Functions
- `overrides?: Partial<CrudService>` - Überschreibungen für Observables

**Rückgabewert:**
```typescript
{
  mock: Mock<CrudService>,           // Das moq.ts Mock-Objekt
  service: CrudService,               // Der Mock-Service (zu verwenden in Providers)
  subjects: {                         // BehaviorSubjects zur Manipulation
    currentInteractionTarget$,
    queryIdentifier$,
    reload$,
    addMenuItems$,
    headCustomFunctions$,
    exportMenuItems$,
    importMenuItems$,
    itemDialog$,
    removeDialog$,
    importDialog$,
    detailColumnEditDialog$,
    selectAddSheet$,
    selectActionSheet$,
    selectPrintSheet$,
    selectExportSheet$,
    selectImportSheet$
  },
  functions: {                        // Mock-Funktionen für Verifikation
    functionAllowed,
    functionExecute,
    setQuery,
    setIdentifier,
    reload,
    create,
    view,
    edit,
    remove,
    print,
    customEdit,
    exportItems,
    importItems,
    detailColumnEdit,
    save,
    saveBatch,
    drop,
    selectAdd,
    selectPrint,
    selectExport,
    selectImport,
    selectOptions,
    selectCustomOptions,
    selectAddDone,
    selectPrintDone,
    selectExportDone,
    selectImportDone,
    selectOptionsDone
  }
}
```

### createSimpleCrudServiceMock()

Erstellt einen einfachen CrudService Mock mit Standardwerten.

**Rückgabewert:** Wie `createMockedCrudService()`

## Beispiel Story

```typescript
import type { Meta, StoryObj } from '@storybook/angular';
import { applicationConfig } from '@storybook/angular';
import { CRUD_SERVICE } from '@ballware/meta-services';
import { createMockedCrudService } from '@storybook-helpers/crud.service.mock';
import { MyComponent } from './my.component';

const meta: Meta<MyComponent> = {
  title: 'My Component',
  component: MyComponent,
  decorators: [
    applicationConfig({
      providers: [
        {
          provide: CRUD_SERVICE,
          useFactory: () => createMockedCrudService({
            queryIdentifier: 'my-entity',
            addMenuItems: [
              { id: 'add', text: 'Add New', icon: 'plus' }
            ]
          }).service
        }
      ],
    }),
  ],
};

export default meta;
type Story = StoryObj<MyComponent>;

export const Default: Story = {
  args: {}
};
```
