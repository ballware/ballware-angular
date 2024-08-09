import { Mock, It, Times } from 'moq.ts';
import { CrudItem, EditLayoutItemOptions, ScriptUtil } from "@ballware/meta-model";

import { compileEditorPreparing } from "./editorpreparing";

describe("compileEditorPreparing", () => {
    it("should compile default implementation for undefined custom script", () => {
        const mockedLookups = new Mock<Record<string, unknown>>()
            .object();

        const mockedItem = new Mock<CrudItem>()
            .object();

        const mockedLayoutItemOptions = new Mock<EditLayoutItemOptions>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const subject = compileEditorPreparing(undefined);

        subject("EDIT", mockedItem, mockedLayoutItemOptions, 'editor', mockedLookups, mockedScriptUtil);
    })

    it("should compile and execute given custom script", () => {

        const mockedLookups = new Mock<Record<string, unknown>>()
            .object();

        const mockedItem = new Mock<CrudItem>()
            .object();

        const mockedLayoutItemOptions = new Mock<EditLayoutItemOptions>()
            .setup(instance => { instance.caption = 'caption' }).returns(true as any);

        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const subject = compileEditorPreparing("layoutItem.caption = 'caption';");

        subject("EDIT", mockedItem, mockedLayoutItemOptions.object(), 'editor', mockedLookups, mockedScriptUtil);

        mockedLayoutItemOptions.verify(instance => {
            instance.caption = 'caption'
        }, Times.Once());
    })

    it("should fail to compile faulty custom script", () => {
        
        expect(() => compileEditorPreparing("invalid javascript;")).toThrow(SyntaxError);
    })

    it("should compile and and throw error from custom script", () => {
        const mockedLookups = new Mock<Record<string, unknown>>()
            .object();

        const mockedItem = new Mock<CrudItem>()
            .object();

        const mockedLayoutItemOptions = new Mock<EditLayoutItemOptions>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();


        const subject = compileEditorPreparing("throw Error('Expected error');");

        expect(() => subject("EDIT", mockedItem, mockedLayoutItemOptions, 'editor', mockedLookups, mockedScriptUtil)).toThrowError('Expected error');
    })
})