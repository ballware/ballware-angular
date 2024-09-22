import { EditService } from '@ballware/meta-services';
import { Mock } from 'moq.ts';
import { BehaviorSubject } from 'rxjs';

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

    return {
        editorPreparing,
        editorInitialized,
        editorEntered,
        editorEvent,

        getValue,
        editorValueChanged,

        readonly$,

        mock: new Mock<EditService>()
            .setup(instance => instance.editorPreparing$).returns(new BehaviorSubject(editorPreparing))
            .setup(instance => instance.editorInitialized$).returns(new BehaviorSubject(editorInitialized))
            .setup(instance => instance.editorEntered$).returns(new BehaviorSubject(editorEntered))
            .setup(instance => instance.editorEvent$).returns(new BehaviorSubject(editorEvent))
            .setup(instance => instance.getValue$).returns(new BehaviorSubject(getValue))
            .setup(instance => instance.editorValueChanged$).returns(new BehaviorSubject(editorValueChanged))
            .setup(instance => instance.readonly$).returns(readonly$)
            .setup(instance => instance.editorValidating$).returns(new BehaviorSubject(editorValidating))
    };
}

describe('mockedEditServiceContext', () => {
    it('should be ignored', () => {});
});