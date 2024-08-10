import { Mock, It } from 'moq.ts';
import { ScriptUtil } from "@ballware/meta-model";

import { compileEvaluateCustomFunction } from "./evaluatecustomfunction";

describe("compileEvaluateCustomFunction", () => {
    it("should compile default implementation for undefined custom script", () => {
        const mockedLookups = new Mock<Record<string, unknown>>()
            .object();

        const mockedParam = new Mock<Record<string, unknown>>()
            .object();

        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const saveCallback = jest.fn();
        const messageCallback = jest.fn();

        const subject = compileEvaluateCustomFunction(undefined);

        subject('function', mockedLookups, mockedScriptUtil, mockedParam, saveCallback, messageCallback);

        expect(saveCallback).toBeCalledTimes(1);
        expect(saveCallback).toBeCalledWith(mockedParam);
    })

    it("should compile and execute given custom script", () => {

        const mockedLookups = new Mock<Record<string, unknown>>()
            .object();

        const mockedParam = new Mock<Record<string, unknown>>()
            .object();

        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const saveCallback = jest.fn();
        const messageCallback = jest.fn();

        const subject = compileEvaluateCustomFunction("messageCallback('Test message');");

        subject('function', mockedLookups, mockedScriptUtil, mockedParam, saveCallback, messageCallback);

        expect(messageCallback).toBeCalledTimes(1);
        expect(messageCallback).toBeCalledWith('Test message');
    })

    it("should fail to compile faulty custom script", () => {
        
        expect(() => compileEvaluateCustomFunction("invalid javascript;")).toThrow(SyntaxError);
    })

    it("should compile and and throw error from custom script", () => {
        const mockedLookups = new Mock<Record<string, unknown>>()
            .object();

        const mockedParam = new Mock<Record<string, unknown>>()
            .object();

        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const saveCallback = jest.fn();
        const messageCallback = jest.fn();

        const subject = compileEvaluateCustomFunction("throw Error('Expected error');");

        expect(() => subject('function', mockedLookups, mockedScriptUtil, mockedParam, saveCallback, messageCallback)).toThrowError('Expected error');
    })
})