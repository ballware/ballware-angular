import { PrepareGridLayoutFunc } from "@ballware/meta-model";

export const compilePrepareGridLayout = (customScript: string|undefined, commonUtils?: string|undefined): PrepareGridLayoutFunc => {
    if (customScript) {
        const prefixedCode = commonUtils ? commonUtils + '\n' + customScript : customScript;

        const compiledArgs = ['lookups', 'customParam', 'util', 'gridLayout'];
        const compiledFn = Function.apply(
          Function,
          compiledArgs.concat(prefixedCode)
        );
  
        return (lookups, customParam, util, gridLayout) =>
            compiledFn.apply(compiledFn, [
                lookups,
                customParam,
                util,
                gridLayout,
            ]);
    }

    return (_lookups, _customParam, _util, gridLayout) => gridLayout;
}