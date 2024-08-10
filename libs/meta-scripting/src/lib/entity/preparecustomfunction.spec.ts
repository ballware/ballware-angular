import { Mock, It } from 'moq.ts';
import { CrudItem, QueryParams, ScriptUtil } from "@ballware/meta-model";

import { compilePrepareCustomFunction } from "./preparecustomfunction";

describe("compilePrepareCustomFunction", () => {
    it("should compile default implementation for undefined custom script", () => {
        const mockedLookups = new Mock<Record<string, unknown>>()
            .object();

        const mockedParams = new Mock<QueryParams>()
            .object();

        const mockedSelection = [
            { Id: 'unique id' }
        ] as CrudItem[];

        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const executeCallback = jest.fn();
        const messageCallback = jest.fn();

        const subject = compilePrepareCustomFunction(undefined);

        subject('function', mockedLookups, mockedScriptUtil, executeCallback, messageCallback, mockedParams, mockedSelection);

        expect(executeCallback).toBeCalledTimes(1);
        expect(executeCallback).toBeCalledWith(mockedSelection[0]);
    })

    it("should compile and execute given custom script", () => {

        const mockedLookups = new Mock<Record<string, unknown>>()
            .object();

        const mockedParams = new Mock<QueryParams>()
            .object();

        const mockedSelection = new Mock<CrudItem[]>()
            .object();

        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const executeCallback = jest.fn();
        const messageCallback = jest.fn();

        const subject = compilePrepareCustomFunction("messageCallback('Test message');");

        subject('function', mockedLookups, mockedScriptUtil, executeCallback, messageCallback, mockedParams, mockedSelection);

        expect(messageCallback).toBeCalledTimes(1);
        expect(messageCallback).toBeCalledWith('Test message');
    })

    it("should fail to compile faulty custom script", () => {
        
        expect(() => compilePrepareCustomFunction("invalid javascript;")).toThrow(SyntaxError);
    })

    it("should compile and and throw error from custom script", () => {
        const mockedLookups = new Mock<Record<string, unknown>>()
            .object();

        const mockedParams = new Mock<QueryParams>()
            .object();

        const mockedSelection = new Mock<CrudItem[]>()
            .object();

        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const executeCallback = jest.fn();
        const messageCallback = jest.fn();

        const subject = compilePrepareCustomFunction("throw Error('Expected error');");

        expect(() => subject('function', mockedLookups, mockedScriptUtil, executeCallback, messageCallback, mockedParams, mockedSelection)).toThrowError('Expected error');
    })
})