import { EditorValidatingFunc } from "@ballware/meta-model";

export const compileEditorValidating = (customScript: string|undefined): EditorValidatingFunc => {
    if (customScript) {
        const compiledArgs = [
            'item',
            'editUtil',
            'identifier',
            'value',
            'validation',
            'lookups',
            'util',
        ];

        const compiledFn = Function.apply(
            Function,
            compiledArgs.concat(customScript)
        );

        return (item, editUtil, identifier, value, validation, lookups, util) =>
            compiledFn.apply(compiledFn, [
                item,
                editUtil,
                identifier,
                value,
                validation,
                lookups,
                util,
            ]);
    }

    return (_item, _editUtil, _identifier, _value, _validation, _lookups, _util) => true;
}