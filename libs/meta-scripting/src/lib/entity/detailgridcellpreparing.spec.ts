import { Mock, It } from 'moq.ts';
import { CrudItem, GridLayoutColumn, ScriptUtil } from "@ballware/meta-model";

import { compileDetailGridCellPreparing } from "./detailgridcellpreparing";

describe("compileDetailGridCellPreparing", () => {
    it("should compile default implementation for undefined custom script", () => {
        const mockedItem = new Mock<CrudItem>()
            .object();

        const mockedDetailItem = new Mock<Record<string, unknown>>()
            .object();

        const mockedOptions = new Mock<GridLayoutColumn>()
            .object();

        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const subject = compileDetailGridCellPreparing(undefined);

        subject("EDIT", mockedItem, mockedDetailItem, "edit", mockedOptions, mockedScriptUtil);
    })

    it("should compile and execute given custom script", () => {
        const mockedItem = new Mock<CrudItem>()
            .object();

        const mockedDetailItem = new Mock<Record<string, unknown>>()
            .object();

        const mockedOptions = new Mock<GridLayoutColumn>()
            .object();

        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const subject = compileDetailGridCellPreparing("options.additionalValue = true");

        subject("EDIT", mockedItem, mockedDetailItem, "edit", mockedOptions, mockedScriptUtil);
    })

    it("should fail to compile faulty custom script", () => {
        
        expect(() => compileDetailGridCellPreparing("invalid javascript;")).toThrow(SyntaxError);
    })

    it("should compile and and throw error from custom script", () => {
        const mockedItem = new Mock<CrudItem>()
            .object();

        const mockedDetailItem = new Mock<Record<string, unknown>>()
            .object();

        const mockedOptions = new Mock<GridLayoutColumn>()
            .object();

        const mockedScriptUtil = new Mock<ScriptUtil>()
            .setup(() => It.IsAny()).throws(new Error('Function call not expected'))
            .object();

        const subject = compileDetailGridCellPreparing("throw Error('Expected error');");

        expect(() => subject("EDIT", mockedItem, mockedDetailItem, "edit", mockedOptions, mockedScriptUtil)).toThrowError('Expected error');
    })
})