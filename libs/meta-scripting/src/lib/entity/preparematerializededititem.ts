import { PrepareMaterializedEditItemFunc } from "@ballware/meta-model";

export const compilePrepareMaterializedEditItem = (customScript: string|undefined, commonUtils?: string|undefined): PrepareMaterializedEditItemFunc => {
    if (customScript) {
        const prefixedCode = commonUtils ? commonUtils + '\n' + customScript : customScript;

        const compiledArgs = [
            'mode',
            'lookups',
            'customParam',
            'util',
            'editLayout',
            'scope',
            'identifier',
            'materializedItem'
        ];
        
        const compiledFn = Function.apply(
            Function,
            compiledArgs.concat(prefixedCode)
        );

        return (mode, lookups, customParam, util, editLayout, scope, identifier, materializedItem) =>
            compiledFn.apply(compiledFn, [
                mode,
                lookups,
                customParam,
                util,
                editLayout,
                scope,
                identifier,
                materializedItem
            ]);
    }

    return (_mode, _lookups, _customParam, _util, _editLayout, _scope, _identifier, materializedItem) => materializedItem;
}