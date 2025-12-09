import { EditService } from '@ballware/meta-services';
import { Mock } from 'moq.ts';
import { BehaviorSubject, of } from 'rxjs';

export const mockedEditServiceContext = () => {

    // Lifecycle
    const editorPreparing = jest.fn();
    const editorInitialized = jest.fn();
    const editorEntered = jest.fn();
    const editorEvent = jest.fn();

    // Value
    const getValue = jest.fn();
    const editorValueChanged = jest.fn();

    // Readonly
    const readonly$ = new BehaviorSubject(false);

    // Validation
    const editorValidating = jest.fn();

    // Detail Grid
    const detailGridCellPreparing = jest.fn((req) => req.options);
    const detailGridRowValidating = jest.fn(() => of(undefined));
    const initNewDetailItem = jest.fn();
    const detailEditorInitialized = jest.fn();
    const detailEditorValidating = jest.fn(() => of(true));
    const detailEditorEntered = jest.fn();
    const detailEditorEvent = jest.fn();
    const detailEditorValueChanged = jest.fn();

    // Mode and Item
    const mode$ = new BehaviorSubject<any>('edit');
    const item$ = new BehaviorSubject<any>({});

    return {
        editorPreparing,
        editorInitialized,
        editorEntered,
        editorEvent,

        getValue,
        editorValueChanged,

        readonly$,
        mode$,
        item$,

        editorValidating,
        detailGridCellPreparing,
        detailGridRowValidating,
        initNewDetailItem,
        detailEditorInitialized,
        detailEditorValidating,
        detailEditorEntered,
        detailEditorEvent,
        detailEditorValueChanged,

        mock: new Mock<EditService>()
            .setup(instance => instance.editorPreparing$).returns(new BehaviorSubject(editorPreparing))
            .setup(instance => instance.editorInitialized$).returns(new BehaviorSubject(editorInitialized))
            .setup(instance => instance.editorEntered$).returns(new BehaviorSubject(editorEntered))
            .setup(instance => instance.editorEvent$).returns(new BehaviorSubject(editorEvent))
            .setup(instance => instance.getValue$).returns(new BehaviorSubject(getValue))
            .setup(instance => instance.editorValueChanged$).returns(new BehaviorSubject(editorValueChanged))
            .setup(instance => instance.readonly$).returns(readonly$)
            .setup(instance => instance.editorValidating$).returns(new BehaviorSubject(editorValidating))
            .setup(instance => instance.mode$).returns(mode$)
            .setup(instance => instance.item$).returns(item$)
            .setup(instance => instance.detailGridCellPreparing$).returns(new BehaviorSubject(detailGridCellPreparing))
            .setup(instance => instance.detailGridRowValidating$).returns(new BehaviorSubject(detailGridRowValidating))
            .setup(instance => instance.initNewDetailItem$).returns(new BehaviorSubject(initNewDetailItem))
            .setup(instance => instance.detailEditorInitialized$).returns(new BehaviorSubject(detailEditorInitialized))
            .setup(instance => instance.detailEditorValidating$).returns(new BehaviorSubject(detailEditorValidating))
            .setup(instance => instance.detailEditorEntered$).returns(new BehaviorSubject(detailEditorEntered))
            .setup(instance => instance.detailEditorEvent$).returns(new BehaviorSubject(detailEditorEvent))
            .setup(instance => instance.detailEditorValueChanged$).returns(new BehaviorSubject(detailEditorValueChanged))
    };
}

describe('mockedEditServiceContext', () => {
    it('should be ignored', () => {});
});
