import { PrepareEditLayoutFunc } from "@ballware/meta-model";

export const compilePrepareEditLayout = (customScript: string|undefined, commonUtils?: string|undefined): PrepareEditLayoutFunc => {
    if (customScript) {
        const prefixedCode = commonUtils ? commonUtils + '\n' + customScript : customScript;

        const compiledArgs = [
            'mode',
            'lookups',
            'customParam',
            'util',
            'editLayout',
        ];

        const compiledFn = Function.apply(
            Function,
            compiledArgs.concat(prefixedCode)
        );
    
        return (mode, lookups, customParam, util, editLayout) =>
            compiledFn.apply(compiledFn, [
            mode,
            lookups,
            customParam,
            util,
            editLayout,
            ]);
    }

    return (_mode, _lookups, _customParam, _util, editLayout) => editLayout;
}