import { Mock, It } from 'moq.ts';
import { CrudItem, EditUtil, ScriptUtil } from "@ballware/meta-model";

import { compileEditorValueChanged } from "./editorvaluechanged";

describe("compileEditorValueChanged", () => {
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

        const subject = compileEditorValueChanged(undefined);

        subject(mockedItem, mockedEditUtil, 'editor', 1, mockedLookups, mockedScriptUtil);
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

        const subject = compileEditorValueChanged("editUtil.setEditorOption('mockedEditor', 'mockedOption', true);");

        subject(mockedItem, mockedEditUtil, 'editor', 1, mockedLookups, mockedScriptUtil);

        expect(setEditorOptionFn).toBeCalledTimes(1);
    })

    it("should fail to compile faulty custom script", () => {
        
        expect(() => compileEditorValueChanged("invalid javascript;")).toThrow(SyntaxError);
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


        const subject = compileEditorValueChanged("throw Error('Expected error');");

        expect(() => subject(mockedItem, mockedEditUtil, 'editor', 1, mockedLookups, mockedScriptUtil)).toThrowError('Expected error');
    })
})