import { Mock, It } from 'moq.ts';
import { CrudItem, ScriptUtil } from "@ballware/meta-model";

import { compileDetailGridRowValidating } from "./detailgridrowvalidating";

describe("compileDetailGridRowValidating", () => {
    it("should compile default implementation for undefined custom script", () => {
        const mockedItem = new Mock<CrudItem>()
            .object();

        const mockedDetailItem = new Mock<Record<string, unknown>>()
            .object();

        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const subject = compileDetailGridRowValidating(undefined);

        subject("EDIT", mockedItem, mockedDetailItem, "edit", mockedScriptUtil);
    })

    it("should compile and execute given custom script", () => {
        const mockedItem = new Mock<CrudItem>()
            .object();

        const mockedDetailItem = new Mock<Record<string, unknown>>()
            .object();

        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const subject = compileDetailGridRowValidating("return 'expected message'");

        expect(subject("EDIT", mockedItem, mockedDetailItem, "edit", mockedScriptUtil)).toBe('expected message');
    })

    it("should fail to compile faulty custom script", () => {
        
        expect(() => compileDetailGridRowValidating("invalid javascript;")).toThrow(SyntaxError);
    })

    it("should compile and and throw error from custom script", () => {
        const mockedItem = new Mock<CrudItem>()
            .object();

        const mockedDetailItem = new Mock<Record<string, unknown>>()
            .object();

        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const subject = compileDetailGridRowValidating("throw Error('Expected error');");

        expect(() => subject("EDIT", mockedItem, mockedDetailItem, "edit", mockedScriptUtil)).toThrowError('Expected error');
    })
})