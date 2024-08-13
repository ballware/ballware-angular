import { Mock, It, Times } from 'moq.ts';
import { EditLayout, EditLayoutItem, GridLayout, ScriptUtil } from "@ballware/meta-model";

import { compilePrepareMaterializedEditItem } from "./preparematerializededititem";

describe("compilePrepareMaterializedEditItem", () => {
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

        const mockedItem = new Mock<EditLayoutItem>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const subject = compilePrepareMaterializedEditItem(undefined);

        subject('edit', mockedLookups, mockedCustomParam, mockedScriptUtil, mockedEditLayout, 'meta', 'template', mockedItem);
    })

    it("should compile and execute given custom script", () => {

        const mockedLookups = new Mock<Record<string, unknown>>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const mockedCustomParam = new Mock<Record<string, unknown>>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const mockedEditLayout = new Mock<EditLayout>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();
           
        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const mockedItem = new Mock<EditLayoutItem>()
            .setup(instance => { instance.type = 'group' }).returns(true as any);

        const subject = compilePrepareMaterializedEditItem("materializedItem.type = 'group';");

        subject('edit', mockedLookups, mockedCustomParam, mockedScriptUtil, mockedEditLayout, 'meta', 'template', mockedItem.object());

        mockedItem.verify(instance => {
            instance.type = 'group'
        }, Times.Once());
    })

    it("should fail to compile faulty custom script", () => {
        
        expect(() => compilePrepareMaterializedEditItem("invalid javascript;")).toThrow(SyntaxError);
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

        const mockedItem = new Mock<EditLayoutItem>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const subject = compilePrepareMaterializedEditItem("throw Error('Expected error');");

        expect(() => subject('edit', mockedLookups, mockedCustomParam, mockedScriptUtil, mockedEditLayout, 'meta', 'template', mockedItem)).toThrowError('Expected error');
    })
})