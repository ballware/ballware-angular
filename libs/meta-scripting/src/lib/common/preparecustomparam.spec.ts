import { Mock, It } from 'moq.ts';
import { ScriptUtil } from "@ballware/meta-model";

import { compilePrepareCustomParam } from "./preparecustomparam";

describe("compilePrepareCustomParam", () => {
    it("should compile default implementation for undefined custom script", () => {
        const mockedLookups = new Mock<Record<string, unknown>>()
            .object();

        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const callback = jest.fn();

        const subject = compilePrepareCustomParam(undefined);

        subject(mockedLookups, mockedScriptUtil, callback);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith({});
    })

    it("should compile and execute given custom script", () => {
        const mockedLookups = new Mock<Record<string, unknown>>()
            .object();

        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const callback = jest.fn();

        const subject = compilePrepareCustomParam("callback({ expected: true });");

        subject(mockedLookups, mockedScriptUtil, callback);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith({ expected: true });
    })

    it("should fail to compile faulty custom script", () => {
        
        expect(() => compilePrepareCustomParam("invalid javascript;")).toThrow(SyntaxError);
    })

    it("should compile and and throw error from custom script", () => {
        const mockedLookups = new Mock<Record<string, unknown>>()
            .object();

        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(Error('Function call not expected'))
            .object();

        const callback = jest.fn();

        const subject = compilePrepareCustomParam("throw Error('Expected error');");

        expect(() => subject(mockedLookups, mockedScriptUtil, callback)).toThrowError('Expected error');
    })
})