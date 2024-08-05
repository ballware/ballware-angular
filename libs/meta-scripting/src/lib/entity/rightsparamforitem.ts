import { RightsParamForItemFunc } from "@ballware/meta-model";

export const compileRightsParamForItem = (customScript: string|undefined): RightsParamForItemFunc => {
    if (customScript) {
        const compiledArgs = ['item', 'customParam', 'headParams'];
        const compiledFn = Function.apply(
            Function,
            compiledArgs.concat(customScript)
        );
    
        return (item, customParam, headParams) =>
            compiledFn.apply(compiledFn, [item, customParam, headParams]);            
    }

    return (item, _customParam, _headParams) => item;
}