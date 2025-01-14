import { RightsParamForItemFunc } from "@ballware/meta-model";

export const compileRightsParamForItem = (customScript: string|undefined, commonUtils?: string|undefined): RightsParamForItemFunc => {
    if (customScript) {
        const prefixedCode = commonUtils ? commonUtils + '\n' + customScript : customScript;

        const compiledArgs = ['item', 'customParam', 'headParams'];
        const compiledFn = Function.apply(
            Function,
            compiledArgs.concat(prefixedCode)
        );
    
        console.warn('Use of deprecated rightsParamForItem script');

        return (item, customParam, headParams) =>
            compiledFn.apply(compiledFn, [item, customParam, headParams]);            
    }

    return (item, _customParam, _headParams) => item;
}