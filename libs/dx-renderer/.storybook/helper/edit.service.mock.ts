import { EditService } from '@ballware/meta-services';
import { Mock, It } from 'moq.ts';
import { BehaviorSubject, of } from 'rxjs';
import { EditModes } from '@ballware/meta-services';

/**
 * Creates a mocked EditService for Storybook stories
 * Uses moq.ts instead of jest for mocking
 */
export const createMockedEditService = (options?: {
  mode?: EditModes;
  readonly?: boolean;
  item?: Record<string, unknown>;
  entity?: string;
  overrides?: Partial<EditService>
}) => {
  const mode$ = new BehaviorSubject<EditModes | undefined>(options?.mode ?? EditModes.CREATE);
  const readonly$ = new BehaviorSubject<boolean | undefined>(options?.readonly ?? false);
  const item$ = new BehaviorSubject<Record<string, unknown> | undefined>(options?.item ?? {});
  const entity$ = new BehaviorSubject<string | undefined>(options?.entity ?? 'TestEntity');
  const editLayout$ = new BehaviorSubject<any>(undefined);

  // Create mock functions using moq.ts
  const getValue = (request: { dataMember: string }) => {
    return item$.value?.[request.dataMember];
  };

  const setValue = (request: { dataMember: string, value: unknown }) => {
    if (item$.value) {
      item$.value[request.dataMember] = request.value;
    }
  };

  const editorPreparing = (request: { dataMember: string, layoutItem: any }) => request.layoutItem;

  const editorInitialized = (_request: { dataMember: string, ref: any }) => {
    // Mock implementation
  };

  const editorEntered = (_request: { dataMember: string }) => {
    // Mock implementation
  };

  const editorEvent = (_request: { dataMember: string, event: string }) => {
    // Mock implementation
  };

  const editorValueChanged = (request: { dataMember: string, value: any, notify: boolean }) => {
    if (item$.value) {
      item$.value[request.dataMember] = request.value;
    }
  };

  const editorValidating = (_request: { dataMember: string, ruleIdentifier: string, value: any }) => of(true);

  const detailGridCellPreparing = (request: any) => request.options;

  const detailGridRowValidating = (_request: any) => of(undefined);

  const initNewDetailItem = (_request: { dataMember: string, detailItem: Record<string, unknown> }) => {
    // Mock implementation
  };

  const detailEditorInitialized = (_request: any) => {
    // Mock implementation
  };

  const detailEditorValidating = (_request: any) => of(true);

  const detailEditorEntered = (_request: any) => {
    // Mock implementation
  };

  const detailEditorEvent = (_request: any) => {
    // Mock implementation
  };

  const detailEditorValueChanged = (_request: any) => {
    // Mock implementation
  };

  const validator = () => of(true);

  // Create the EditService mock
  const mock = new Mock<EditService>()
    .setup(instance => instance.item$).returns(item$)
    .setup(instance => instance.mode$).returns(mode$)
    .setup(instance => instance.entity$).returns(entity$)
    .setup(instance => instance.editLayout$).returns(editLayout$)
    .setup(instance => instance.readonly$).returns(readonly$)
    .setup(instance => instance.getValue$).returns(new BehaviorSubject(getValue))
    .setup(instance => instance.setValue$).returns(new BehaviorSubject(setValue))
    .setup(instance => instance.editorPreparing$).returns(options?.overrides?.editorPreparing$ ?? new BehaviorSubject(editorPreparing))
    .setup(instance => instance.editorInitialized$).returns(options?.overrides?.editorInitialized$ ?? new BehaviorSubject(editorInitialized))
    .setup(instance => instance.editorEntered$).returns(options?.overrides?.editorEntered$ ?? new BehaviorSubject(editorEntered))
    .setup(instance => instance.editorEvent$).returns(options?.overrides?.editorEvent$ ?? new BehaviorSubject(editorEvent))
    .setup(instance => instance.editorValueChanged$).returns(options?.overrides?.editorValueChanged$ ?? new BehaviorSubject(editorValueChanged))
    .setup(instance => instance.editorValidating$).returns(options?.overrides?.editorValidating$ ?? new BehaviorSubject(editorValidating))
    .setup(instance => instance.detailGridCellPreparing$).returns(options?.overrides?.detailGridCellPreparing$ ?? new BehaviorSubject(detailGridCellPreparing))
    .setup(instance => instance.detailGridRowValidating$).returns(options?.overrides?.detailGridRowValidating$ ?? new BehaviorSubject(detailGridRowValidating))
    .setup(instance => instance.initNewDetailItem$).returns(options?.overrides?.initNewDetailItem$ ?? new BehaviorSubject(initNewDetailItem))
    .setup(instance => instance.detailEditorInitialized$).returns(options?.overrides?.detailEditorInitialized$ ?? new BehaviorSubject(detailEditorInitialized))
    .setup(instance => instance.detailEditorValidating$).returns(options?.overrides?.detailEditorValidating$ ?? new BehaviorSubject(detailEditorValidating))
    .setup(instance => instance.detailEditorEntered$).returns(options?.overrides?.detailEditorEntered$ ?? new BehaviorSubject(detailEditorEntered))
    .setup(instance => instance.detailEditorEvent$).returns(options?.overrides?.detailEditorEvent$ ?? new BehaviorSubject(detailEditorEvent))
    .setup(instance => instance.detailEditorValueChanged$).returns(options?.overrides?.detailEditorValueChanged$ ?? new BehaviorSubject(detailEditorValueChanged))
    .setup(instance => instance.validator$).returns(new BehaviorSubject(validator))
    .setup(instance => instance.setIdentifier(It.IsAny())).returns(undefined)
    .setup(instance => instance.setMode(It.IsAny())).returns(undefined)
    .setup(instance => instance.setEntity(It.IsAny())).returns(undefined)
    .setup(instance => instance.setItem(It.IsAny())).returns(undefined)
    .setup(instance => instance.setEditLayout(It.IsAny())).returns(undefined)
    .setup(instance => instance.setApply(It.IsAny())).returns(undefined)
    .setup(instance => instance.setCancel(It.IsAny())).returns(undefined)
    .setup(instance => instance.setValidator(It.IsAny())).returns(undefined)
    .setup(instance => instance.editUtil()).returns({} as any)
    .setup(instance => instance.ngOnDestroy()).returns(undefined);

  return {
    mock,
    service: mock.object(),
    // Expose the subjects for manipulation in stories
    subjects: {
      mode$,
      readonly$,
      item$,
      entity$,
      editLayout$,
    },
    // Expose the functions for verification or custom behavior if needed
    functions: {
      getValue,
      setValue,
      editorPreparing,
      editorInitialized,
      editorEntered,
      editorEvent,
      editorValueChanged,
      editorValidating,
      detailGridCellPreparing,
      detailGridRowValidating,
      initNewDetailItem,
      detailEditorInitialized,
      detailEditorValidating,
      detailEditorEntered,
      detailEditorEvent,
      detailEditorValueChanged,
      validator,
    },
  };
};

/**
 * Simplified version for basic use cases
 */
export const createSimpleEditServiceMock = () => {
  return createMockedEditService({
    mode: EditModes.EDIT,
    readonly: false,
    item: {},
    entity: 'TestEntity',
  });
};

