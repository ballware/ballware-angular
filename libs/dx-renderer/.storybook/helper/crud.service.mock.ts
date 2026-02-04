import { CrudService, CrudAction, CrudEditMenuItem, DetailColumnEditDialog, FunctionIdentifier, ImportDialog, ItemEditDialog, ItemRemoveDialog } from '@ballware/meta-services';
import { Mock, It } from 'moq.ts';
import { BehaviorSubject } from 'rxjs';
import { CrudItem, EntityCustomFunction, GridLayoutColumn } from '@ballware/meta-model';
import { EditModes } from '@ballware/meta-services';

/**
 * Creates a mocked CrudService for Storybook stories
 * Uses moq.ts instead of jest for mocking
 */
export const createMockedCrudService = (options?: {
  queryIdentifier?: string;
  addMenuItems?: CrudEditMenuItem[];
  exportMenuItems?: CrudEditMenuItem[];
  importMenuItems?: CrudEditMenuItem[];
  headCustomFunctions?: EntityCustomFunction[];
  overrides?: Partial<CrudService>
}) => {
  const currentInteractionTarget$ = new BehaviorSubject<Element | undefined>(undefined);
  const queryIdentifier$ = new BehaviorSubject<string | undefined>(options?.queryIdentifier ?? 'test-query');
  const reload$ = new BehaviorSubject<void>(undefined);

  const addMenuItems$ = new BehaviorSubject<CrudEditMenuItem[] | undefined>(options?.addMenuItems ?? []);
  const headCustomFunctions$ = new BehaviorSubject<EntityCustomFunction[] | undefined>(options?.headCustomFunctions ?? []);
  const exportMenuItems$ = new BehaviorSubject<CrudEditMenuItem[] | undefined>(options?.exportMenuItems ?? []);
  const importMenuItems$ = new BehaviorSubject<CrudEditMenuItem[] | undefined>(options?.importMenuItems ?? []);

  const itemDialog$ = new BehaviorSubject<ItemEditDialog | undefined>(undefined);
  const removeDialog$ = new BehaviorSubject<ItemRemoveDialog | undefined>(undefined);
  const importDialog$ = new BehaviorSubject<ImportDialog | undefined>(undefined);
  const detailColumnEditDialog$ = new BehaviorSubject<DetailColumnEditDialog | undefined>(undefined);

  const selectAddSheet$ = new BehaviorSubject<{ actions: CrudAction[] } | undefined>(undefined);
  const selectActionSheet$ = new BehaviorSubject<{ item: CrudItem, actions: CrudAction[] } | undefined>(undefined);
  const selectPrintSheet$ = new BehaviorSubject<{ items: CrudItem[], actions: CrudAction[] } | undefined>(undefined);
  const selectExportSheet$ = new BehaviorSubject<{ items: CrudItem[], actions: CrudAction[] } | undefined>(undefined);
  const selectImportSheet$ = new BehaviorSubject<{ actions: CrudAction[] } | undefined>(undefined);

  // Create mock functions
  const functionAllowed = (_identifier: FunctionIdentifier, _data: CrudItem) => true;

  const functionExecute = (_button: FunctionIdentifier, _editLayoutIdentifier: string, _data: CrudItem, _target: Element) => {
    // Mock implementation
  };

  const setQuery = (query: string) => {
    queryIdentifier$.next(query);
  };

  const setIdentifier = (_identifier: string) => {
    // Mock implementation
  };

  const reload = () => {
    reload$.next(undefined);
  };

  const create = (_request: { editLayout: string }) => {
    // Mock implementation
  };

  const view = (_request: { item: CrudItem, editLayout: string }) => {
    // Mock implementation
  };

  const edit = (_request: { item: CrudItem, editLayout: string }) => {
    // Mock implementation
  };

  const remove = (_request: { item: CrudItem }) => {
    // Mock implementation
  };

  const print = (_request: { documentId: string, items: CrudItem[] }) => {
    // Mock implementation
  };

  const customEdit = (_request: { customFunction: EntityCustomFunction, items?: CrudItem[] }) => {
    // Mock implementation
  };

  const exportItems = (_request: { customFunction: EntityCustomFunction, items: CrudItem[] }) => {
    // Mock implementation
  };

  const importItems = (_request: { customFunction: EntityCustomFunction }) => {
    // Mock implementation
  };

  const detailColumnEdit = (_request: { mode: EditModes, item: unknown, column: GridLayoutColumn }) => {
    // Mock implementation
  };

  const save = (_request: { customFunction: EntityCustomFunction, item: CrudItem, continueAfterSave: boolean }) => {
    // Mock implementation
  };

  const saveBatch = (_request: { customFunction: EntityCustomFunction, items: CrudItem[], continueAfterSave: boolean }) => {
    // Mock implementation
  };

  const drop = (_request: { item: CrudItem }) => {
    // Mock implementation
  };

  const selectAdd = (request: { target: Element, defaultEditLayout: string }) => {
    currentInteractionTarget$.next(request.target);
  };

  const selectPrint = (request: { items: CrudItem[], target: Element }) => {
    currentInteractionTarget$.next(request.target);
  };

  const selectExport = (request: { items: CrudItem[], target: Element }) => {
    currentInteractionTarget$.next(request.target);
  };

  const selectImport = (request: { target: Element }) => {
    currentInteractionTarget$.next(request.target);
  };

  const selectOptions = (request: { item: CrudItem, target: Element, defaultEditLayout: string }) => {
    currentInteractionTarget$.next(request.target);
  };

  const selectCustomOptions = (request: { item: CrudItem, target: Element, defaultEditLayout: string }) => {
    currentInteractionTarget$.next(request.target);
  };

  const selectAddDone = () => {
    selectAddSheet$.next(undefined);
  };

  const selectPrintDone = () => {
    selectPrintSheet$.next(undefined);
  };

  const selectExportDone = () => {
    selectExportSheet$.next(undefined);
  };

  const selectImportDone = () => {
    selectImportSheet$.next(undefined);
  };

  const selectOptionsDone = () => {
    selectActionSheet$.next(undefined);
  };

  // Create the CrudService mock
  const mock = new Mock<CrudService>()
    .setup(instance => instance.currentInteractionTarget$).returns(currentInteractionTarget$)
    .setup(instance => instance.functionAllowed$).returns(options?.overrides?.functionAllowed$ ?? new BehaviorSubject(functionAllowed))
    .setup(instance => instance.functionExecute$).returns(options?.overrides?.functionExecute$ ?? new BehaviorSubject(functionExecute))
    .setup(instance => instance.addMenuItems$).returns(addMenuItems$)
    .setup(instance => instance.headCustomFunctions$).returns(headCustomFunctions$)
    .setup(instance => instance.exportMenuItems$).returns(exportMenuItems$)
    .setup(instance => instance.importMenuItems$).returns(importMenuItems$)
    .setup(instance => instance.itemDialog$).returns(itemDialog$)
    .setup(instance => instance.removeDialog$).returns(removeDialog$)
    .setup(instance => instance.importDialog$).returns(importDialog$)
    .setup(instance => instance.detailColumnEditDialog$).returns(detailColumnEditDialog$)
    .setup(instance => instance.selectAddSheet$).returns(selectAddSheet$)
    .setup(instance => instance.selectActionSheet$).returns(selectActionSheet$)
    .setup(instance => instance.selectPrintSheet$).returns(selectPrintSheet$)
    .setup(instance => instance.selectExportSheet$).returns(selectExportSheet$)
    .setup(instance => instance.selectImportSheet$).returns(selectImportSheet$)
    .setup(instance => instance.queryIdentifier$).returns(queryIdentifier$)
    .setup(instance => instance.reload$).returns(reload$)
    .setup(instance => instance.setQuery(It.IsAny())).returns(undefined)
    .setup(instance => instance.setIdentifier(It.IsAny())).returns(undefined)
    .setup(instance => instance.reload()).returns(undefined)
    .setup(instance => instance.create(It.IsAny())).returns(undefined)
    .setup(instance => instance.view(It.IsAny())).returns(undefined)
    .setup(instance => instance.edit(It.IsAny())).returns(undefined)
    .setup(instance => instance.remove(It.IsAny())).returns(undefined)
    .setup(instance => instance.print(It.IsAny())).returns(undefined)
    .setup(instance => instance.customEdit(It.IsAny())).returns(undefined)
    .setup(instance => instance.exportItems(It.IsAny())).returns(undefined)
    .setup(instance => instance.importItems(It.IsAny())).returns(undefined)
    .setup(instance => instance.detailColumnEdit(It.IsAny())).returns(undefined)
    .setup(instance => instance.save(It.IsAny())).returns(undefined)
    .setup(instance => instance.saveBatch(It.IsAny())).returns(undefined)
    .setup(instance => instance.drop(It.IsAny())).returns(undefined)
    .setup(instance => instance.selectAdd(It.IsAny())).returns(undefined)
    .setup(instance => instance.selectPrint(It.IsAny())).returns(undefined)
    .setup(instance => instance.selectExport(It.IsAny())).returns(undefined)
    .setup(instance => instance.selectImport(It.IsAny())).returns(undefined)
    .setup(instance => instance.selectOptions(It.IsAny())).returns(undefined)
    .setup(instance => instance.selectCustomOptions(It.IsAny())).returns(undefined)
    .setup(instance => instance.selectAddDone()).returns(undefined)
    .setup(instance => instance.selectPrintDone()).returns(undefined)
    .setup(instance => instance.selectExportDone()).returns(undefined)
    .setup(instance => instance.selectImportDone()).returns(undefined)
    .setup(instance => instance.selectOptionsDone()).returns(undefined);

  return {
    mock,
    service: mock.object(),
    // Expose the subjects for manipulation in stories
    subjects: {
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
      selectImportSheet$,
    },
    // Expose the functions for verification or custom behavior if needed
    functions: {
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
      selectOptionsDone,
    },
  };
};

/**
 * Simplified version for basic use cases
 */
export const createSimpleCrudServiceMock = () => {
  return createMockedCrudService({
    queryIdentifier: 'test-query',
    addMenuItems: [],
    exportMenuItems: [],
    importMenuItems: [],
    headCustomFunctions: [],
  });
};
