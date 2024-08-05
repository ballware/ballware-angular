import { PrepareGridLayoutFunc } from "@ballware/meta-model";

export const compilePrepareGridLayout = (customScript: string|undefined): PrepareGridLayoutFunc => {
    if (customScript) {
        const compiledArgs = ['lookups', 'customParam', 'util', 'gridLayout'];
        const compiledFn = Function.apply(
          Function,
          compiledArgs.concat(customScript)
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