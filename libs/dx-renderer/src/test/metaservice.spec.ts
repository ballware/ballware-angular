import { MetaService } from '@ballware/meta-services';
import { Mock } from 'moq.ts';
import { BehaviorSubject } from 'rxjs';

export const mockedMetaServiceContext = () => {

    // Setters
    const setIdentifier = jest.fn();
    const setEntity = jest.fn();
    const setReadOnly = jest.fn();
    const setHeadParams = jest.fn();
    const setInitialCustomParam = jest.fn();

    // Observables
    const headParams$ = new BehaviorSubject<any>(undefined);
    const customParam$ = new BehaviorSubject<Record<string, unknown>|undefined>(undefined);
    const entity$ = new BehaviorSubject<string|undefined>(undefined);
    const displayName$ = new BehaviorSubject<string|undefined>(undefined);
    const entityMetadata$ = new BehaviorSubject<any>(undefined);
    const entityDocuments$ = new BehaviorSubject<any>(undefined);
    const entityTemplates$ = new BehaviorSubject<any>(undefined);
    const customFunctions$ = new BehaviorSubject<any>(undefined);
    const prepareCustomFunction$ = new BehaviorSubject<any>(undefined);
    const evaluateCustomFunction$ = new BehaviorSubject<any>(undefined);
    const getGridLayout$ = new BehaviorSubject<any>(undefined);
    const getEditLayout$ = new BehaviorSubject<any>(undefined);
    const query$ = new BehaviorSubject<any>(undefined);
    const count$ = new BehaviorSubject<any>(undefined);
    const byId$ = new BehaviorSubject<any>(undefined);
    const create$ = new BehaviorSubject<any>(undefined);
    const save$ = new BehaviorSubject<any>(undefined);
    const saveBatch$ = new BehaviorSubject<any>(undefined);
    const drop$ = new BehaviorSubject<any>(undefined);
    const importItems$ = new BehaviorSubject<any>(undefined);
    const exportItems$ = new BehaviorSubject<any>(undefined);
    const addFunction$ = new BehaviorSubject<any>(undefined);
    const viewFunction$ = new BehaviorSubject<any>(undefined);
    const editFunction$ = new BehaviorSubject<any>(undefined);
    const dropAllowed$ = new BehaviorSubject<any>(undefined);
    const printAllowed$ = new BehaviorSubject<any>(undefined);
    const customFunctionAllowed$ = new BehaviorSubject<any>(undefined);
    const editorPreparing$ = new BehaviorSubject<any>(undefined);
    const editorInitialized$ = new BehaviorSubject<any>(undefined);
    const editorEntered$ = new BehaviorSubject<any>(undefined);

    return {
        setIdentifier,
        setEntity,
        setReadOnly,
        setHeadParams,
        setInitialCustomParam,

        headParams$,
        customParam$,
        entity$,
        displayName$,
        entityMetadata$,
        entityDocuments$,
        entityTemplates$,
        customFunctions$,
        prepareCustomFunction$,
        evaluateCustomFunction$,
        getGridLayout$,
        getEditLayout$,
        query$,
        count$,
        byId$,
        create$,
        save$,
        saveBatch$,
        drop$,
        importItems$,
        exportItems$,
        addFunction$,
        viewFunction$,
        editFunction$,
        dropAllowed$,
        printAllowed$,
        customFunctionAllowed$,
        editorPreparing$,
        editorInitialized$,
        editorEntered$,

        mock: new Mock<MetaService>()
            .setup(instance => instance.setIdentifier).returns(setIdentifier)
            .setup(instance => instance.setEntity).returns(setEntity)
            .setup(instance => instance.setReadOnly).returns(setReadOnly)
            .setup(instance => instance.setHeadParams).returns(setHeadParams)
            .setup(instance => instance.setInitialCustomParam).returns(setInitialCustomParam)
            .setup(instance => instance.headParams$).returns(headParams$)
            .setup(instance => instance.customParam$).returns(customParam$)
            .setup(instance => instance.entity$).returns(entity$)
            .setup(instance => instance.displayName$).returns(displayName$)
            .setup(instance => instance.entityMetadata$).returns(entityMetadata$)
            .setup(instance => instance.entityDocuments$).returns(entityDocuments$)
            .setup(instance => instance.entityTemplates$).returns(entityTemplates$)
            .setup(instance => instance.customFunctions$).returns(customFunctions$)
            .setup(instance => instance.prepareCustomFunction$).returns(prepareCustomFunction$)
            .setup(instance => instance.evaluateCustomFunction$).returns(evaluateCustomFunction$)
            .setup(instance => instance.getGridLayout$).returns(getGridLayout$)
            .setup(instance => instance.getEditLayout$).returns(getEditLayout$)
            .setup(instance => instance.query$).returns(query$)
            .setup(instance => instance.count$).returns(count$)
            .setup(instance => instance.byId$).returns(byId$)
            .setup(instance => instance.create$).returns(create$)
            .setup(instance => instance.save$).returns(save$)
            .setup(instance => instance.saveBatch$).returns(saveBatch$)
            .setup(instance => instance.drop$).returns(drop$)
            .setup(instance => instance.importItems$).returns(importItems$)
            .setup(instance => instance.exportItems$).returns(exportItems$)
            .setup(instance => instance.addFunction$).returns(addFunction$)
            .setup(instance => instance.viewFunction$).returns(viewFunction$)
            .setup(instance => instance.editFunction$).returns(editFunction$)
            .setup(instance => instance.dropAllowed$).returns(dropAllowed$)
            .setup(instance => instance.printAllowed$).returns(printAllowed$)
            .setup(instance => instance.customFunctionAllowed$).returns(customFunctionAllowed$)
            .setup(instance => instance.editorPreparing$).returns(editorPreparing$)
            .setup(instance => instance.editorInitialized$).returns(editorInitialized$)
            .setup(instance => instance.editorEntered$).returns(editorEntered$)
    };
}

describe('mockedMetaServiceContext', () => {
    it('should be ignored', () => {});
});

