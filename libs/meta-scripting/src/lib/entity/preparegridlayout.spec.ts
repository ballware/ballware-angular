import { Mock, It, Times } from 'moq.ts';
import { GridLayout, ScriptUtil } from "@ballware/meta-model";

import { compilePrepareGridLayout } from "./preparegridlayout";

describe("compilePrepareGridLayout", () => {
    it("should compile default implementation for undefined custom script", () => {
        const mockedLookups = new Mock<Record<string, unknown>>()
            .object();

        const mockedCustomParam = new Mock<Record<string, unknown>>()
            .object();

        const mockedGridLayout = new Mock<GridLayout>()
            .object();

        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const subject = compilePrepareGridLayout(undefined);

        subject(mockedLookups, mockedCustomParam, mockedScriptUtil, mockedGridLayout);
    })

    it("should compile and execute given custom script", () => {

        const mockedLookups = new Mock<Record<string, unknown>>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const mockedCustomParam = new Mock<Record<string, unknown>>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const mockedGridLayout = new Mock<GridLayout>()
            .setup(instance => { instance.title = 'New title' }).returns(true as any);
           
        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const subject = compilePrepareGridLayout("gridLayout.title = 'New title';");

        subject(mockedLookups, mockedCustomParam, mockedScriptUtil, mockedGridLayout.object());

        mockedGridLayout.verify(instance => {
            instance.title = 'New title'
        }, Times.Once());
    })

    it("should fail to compile faulty custom script", () => {
        
        expect(() => compilePrepareGridLayout("invalid javascript;")).toThrow(SyntaxError);
    })

    it("should compile and and throw error from custom script", () => {
        const mockedLookups = new Mock<Record<string, unknown>>()
            .object();

        const mockedCustomParam = new Mock<Record<string, unknown>>()
            .object();

        const mockedGridLayout = new Mock<GridLayout>()
            .object();

        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const subject = compilePrepareGridLayout("throw Error('Expected error');");

        expect(() => subject(mockedLookups, mockedCustomParam, mockedScriptUtil, mockedGridLayout)).toThrowError('Expected error');
    })
})