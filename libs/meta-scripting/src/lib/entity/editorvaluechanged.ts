import { EditorValueChangedFunc } from "@ballware/meta-model";

export const compileEditorValueChanged = (customScript: string|undefined): EditorValueChangedFunc => {
    if (customScript) {
        const compiledArgs = [
            'item',
            'editUtil',
            'identifier',
            'value',
            'lookups',
            'util',
        ];

        const compiledFn = Function.apply(
            Function,
            compiledArgs.concat(customScript)
        );

        return (item, editUtil, identifier, value, lookups, util) =>
            compiledFn.apply(compiledFn, [
                item,
                editUtil,
                identifier,
                value,
                lookups,
                util,
            ]);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return (_item, _editUtil, _identifier, _value, _lookups, _util) => {};
}