import { Mock, It, Times } from 'moq.ts';
import { CrudItem, ScriptUtil } from "@ballware/meta-model";

import { compileItemMapping } from "./itemmapping";

describe("compileItemMapping", () => {
    it("should compile default implementation for undefined custom script", () => {
        const mockedItem = new Mock<CrudItem>()
            .object();

        const mockedCustomParam = new Mock<unknown>()
            .object();

        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const subject = compileItemMapping(undefined);

        expect(subject(mockedItem, mockedCustomParam, mockedScriptUtil)).toBe(mockedItem);
    })

    it("should compile and execute given custom script", () => {
        const mockedItem = { Id: 'unique id' } as CrudItem;

        const mockedCustomParam = new Mock<unknown>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const subject = compileItemMapping("item.additionalValue = true; return item;");

        const mappedItem = subject(mockedItem, mockedCustomParam, mockedScriptUtil);

        expect(mappedItem.Id).toBe('unique id');
        expect(mappedItem['additionalValue']).toBe(true);
    })

    it("should fail to compile faulty custom script", () => {
        
        expect(() => compileItemMapping("invalid javascript;")).toThrow(SyntaxError);
    })

    it("should compile and and throw error from custom script", () => {
        const mockedItem = new Mock<CrudItem>()
            .object();

        const mockedCustomParam = new Mock<unknown>()
            .object();

        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const subject = compileItemMapping("throw Error('Expected error');");

        expect(() => subject(mockedItem, mockedCustomParam, mockedScriptUtil)).toThrowError('Expected error');
    })
})