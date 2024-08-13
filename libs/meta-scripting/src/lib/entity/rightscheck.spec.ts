import { Mock } from 'moq.ts';

import { compileRightsCheckFunc } from "./rightscheck";

describe("compileRightsCheckFunc", () => {
    it("should compile default implementation for undefined custom script", () => {
        const mockedUserInfo = new Mock<Record<string, unknown>>()
            .object();

        const mockedParam = new Mock<Record<string, unknown>>()
            .object();

        const subject = compileRightsCheckFunc(undefined);

        expect(subject(mockedUserInfo, 'application', 'entity', false, 'right', mockedParam, true)).toBe(true);
    })

    it("should compile and execute given custom script", () => {
        const mockedUserInfo = new Mock<Record<string, unknown>>()
            .object();

        const mockedParam = new Mock<Record<string, unknown>>()
            .object();

        const subject = compileRightsCheckFunc("return true;");

        expect(subject(mockedUserInfo, 'application', 'entity', false, 'right', mockedParam, false)).toBe(true);
    })

    it("should fail to compile faulty custom script", () => {
        
        expect(() => compileRightsCheckFunc("invalid javascript;")).toThrow(SyntaxError);
    })

    it("should compile and and throw error from custom script", () => {
        const mockedUserInfo = new Mock<Record<string, unknown>>()
            .object();

        const mockedParam = new Mock<Record<string, unknown>>()
            .object();

        const subject = compileRightsCheckFunc("throw Error('Expected error');");

        expect(() => subject(mockedUserInfo, 'application', 'entity', false, 'right', mockedParam, false)).toThrowError('Expected error');
    })
})