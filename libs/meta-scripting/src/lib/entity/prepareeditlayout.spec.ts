import { Mock, It, Times } from 'moq.ts';
import { EditLayout, ScriptUtil } from "@ballware/meta-model";

import { compilePrepareEditLayout } from "./prepareeditlayout";

describe("compilePrepareEditLayout", () => {
    it("should compile default implementation for undefined custom script", () => {
        const mockedLookups = new Mock<Record<string, unknown>>()
            .object();

        const mockedCustomParam = new Mock<Record<string, unknown>>()
            .object();

        const mockedEditLayout = new Mock<EditLayout>()
            .object();

        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const subject = compilePrepareEditLayout(undefined);

        subject('edit', mockedLookups, mockedCustomParam, mockedScriptUtil, mockedEditLayout);
    })

    it("should compile and execute given custom script", () => {

        const mockedLookups = new Mock<Record<string, unknown>>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const mockedCustomParam = new Mock<Record<string, unknown>>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const mockedEditLayout = new Mock<EditLayout>()
            .setup(instance => { instance.fullscreen = true }).returns(true as any);
           
        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const subject = compilePrepareEditLayout("editLayout.fullscreen = true;");

        subject('edit', mockedLookups, mockedCustomParam, mockedScriptUtil, mockedEditLayout.object());

        mockedEditLayout.verify(instance => {
            instance.fullscreen = true
        }, Times.Once());
    })

    it("should fail to compile faulty custom script", () => {
        
        expect(() => compilePrepareEditLayout("invalid javascript;")).toThrow(SyntaxError);
    })

    it("should compile and and throw error from custom script", () => {
        const mockedLookups = new Mock<Record<string, unknown>>()
            .object();

        const mockedCustomParam = new Mock<Record<string, unknown>>()
            .object();

        const mockedEditLayout = new Mock<EditLayout>()
            .object();

        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const subject = compilePrepareEditLayout("throw Error('Expected error');");

        expect(() => subject('edit', mockedLookups, mockedCustomParam, mockedScriptUtil, mockedEditLayout)).toThrowError('Expected error');
    })
})