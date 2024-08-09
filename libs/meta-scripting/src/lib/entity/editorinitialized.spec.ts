import { Mock, It } from 'moq.ts';
import { CrudItem, EditUtil, ScriptUtil } from "@ballware/meta-model";

import { compileEditorInitialized } from "./editorinitialized";

describe("compileEditorInitialized", () => {
    it("should compile default implementation for undefined custom script", () => {
        const mockedLookups = new Mock<Record<string, unknown>>()
            .object();

        const mockedItem = new Mock<CrudItem>()
            .object();

        const mockedEditUtil = new Mock<EditUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const subject = compileEditorInitialized(undefined);

        subject("EDIT", mockedItem, mockedEditUtil, 'editor', mockedLookups, mockedScriptUtil);
    })

    it("should compile and execute given custom script", () => {

        const setEditorOptionFn = jest.fn();

        const mockedLookups = new Mock<Record<string, unknown>>()
            .object();

        const mockedItem = new Mock<CrudItem>()
            .object();

        const mockedEditUtil = new Mock<EditUtil>()
            .setup(instance => instance.setEditorOption('mockedEditor', 'mockedOption', true))
            .callback(() => setEditorOptionFn())
            .object();

        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const subject = compileEditorInitialized("editUtil.setEditorOption('mockedEditor', 'mockedOption', true);");

        subject("EDIT", mockedItem, mockedEditUtil, 'editor', mockedLookups, mockedScriptUtil);

        expect(setEditorOptionFn).toBeCalledTimes(1);
    })

    it("should fail to compile faulty custom script", () => {
        
        expect(() => compileEditorInitialized("invalid javascript;")).toThrow(SyntaxError);
    })

    it("should compile and and throw error from custom script", () => {
        const mockedLookups = new Mock<Record<string, unknown>>()
            .object();

        const mockedItem = new Mock<CrudItem>()
            .object();

        const mockedEditUtil = new Mock<EditUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();


        const subject = compileEditorInitialized("throw Error('Expected error');");

        expect(() => subject("EDIT", mockedItem, mockedEditUtil, 'editor', mockedLookups, mockedScriptUtil)).toThrowError('Expected error');
    })
})