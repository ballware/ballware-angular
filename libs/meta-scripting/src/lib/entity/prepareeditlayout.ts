import { PrepareEditLayoutFunc } from "@ballware/meta-model";

export const compilePrepareEditLayout = (customScript: string|undefined): PrepareEditLayoutFunc => {
    if (customScript) {
        const compiledArgs = [
            'mode',
            'lookups',
            'customParam',
            'util',
            'editLayout',
        ];

        const compiledFn = Function.apply(
            Function,
            compiledArgs.concat(customScript)
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