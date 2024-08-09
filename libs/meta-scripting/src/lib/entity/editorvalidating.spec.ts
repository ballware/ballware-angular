import { Mock, It } from 'moq.ts';
import { CrudItem, EditUtil, ScriptUtil } from "@ballware/meta-model";

import { compileEditorValidating } from "./editorvalidating";

describe("compileEditorValidating", () => {
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

        const subject = compileEditorValidating(undefined);

        expect(subject(mockedItem, mockedEditUtil, 'editor', 1, 'validation', mockedLookups, mockedScriptUtil)).toBe(true);
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

        const subject = compileEditorValidating("editUtil.setEditorOption('mockedEditor', 'mockedOption', true); return false;");

        expect(subject(mockedItem, mockedEditUtil, 'editor', 1, 'validation', mockedLookups, mockedScriptUtil)).toBe(false);

        expect(setEditorOptionFn).toBeCalledTimes(1);
    })

    it("should fail to compile faulty custom script", () => {
        
        expect(() => compileEditorValidating("invalid javascript;")).toThrow(SyntaxError);
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


        const subject = compileEditorValidating("throw Error('Expected error');");

        expect(() => subject(mockedItem, mockedEditUtil, 'editor', 1, 'validation', mockedLookups, mockedScriptUtil)).toThrowError('Expected error');
    })
})