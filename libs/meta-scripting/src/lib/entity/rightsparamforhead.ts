import { RightsParamForHeadFunc } from "@ballware/meta-model";

export const compileRightsParamForHead = (customScript: string|undefined): RightsParamForHeadFunc => {
    if (customScript) {
        const compiledArgs = ['customParam', 'headParams'];
        const compiledFn = Function.apply(
            Function,
            compiledArgs.concat(customScript)
        );

        console.warn('Use of deprecated rightsParamForHead script');

        return (customParam, headParams) => compiledFn.apply(compiledFn, [customParam, headParams]);
    }

    return (_customParam, headParams) => headParams;
}