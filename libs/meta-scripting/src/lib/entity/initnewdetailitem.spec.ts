import { Mock, It, Times } from 'moq.ts';
import { CrudItem, ScriptUtil } from "@ballware/meta-model";

import { compileInitNewDetailItem } from "./initnewdetailitem";

describe("compileInitNewDetailItem", () => {
    it("should compile default implementation for undefined custom script", () => {
        const mockedItem = new Mock<CrudItem>()
            .object();

        const mockedDetailItem = new Mock<Record<string, unknown>>()
            .object();

        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const subject = compileInitNewDetailItem(undefined);

        subject("member", mockedItem, mockedDetailItem, mockedScriptUtil);
    })

    it("should compile and execute given custom script", () => {
        const mockedItem = new Mock<CrudItem>()
            .object();

        const mockedDetailItem = new Mock<Record<string, unknown>>()
            .setup(instance => instance['additionalValue'] = true).returns(true as any);

        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const subject = compileInitNewDetailItem("detailItem.additionalValue = true");

        subject("member", mockedItem, mockedDetailItem.object(), mockedScriptUtil);

        mockedDetailItem.verify(instance => {
            instance['additionalValue'] = true
        }, Times.Once());
    })

    it("should fail to compile faulty custom script", () => {
        
        expect(() => compileInitNewDetailItem("invalid javascript;")).toThrow(SyntaxError);
    })

    it("should compile and and throw error from custom script", () => {
        const mockedItem = new Mock<CrudItem>()
            .object();

        const mockedDetailItem = new Mock<Record<string, unknown>>()
            .object();

        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const subject = compileInitNewDetailItem("throw Error('Expected error');");

        expect(() => subject("member", mockedItem, mockedDetailItem, mockedScriptUtil)).toThrowError('Expected error');
    })
})