import { EditorEnteredFunc } from "@ballware/meta-model";

export const compileEditorEntered = (customScript: string|undefined): EditorEnteredFunc => {
    if (customScript) {
        const compiledArgs = [
            'mode',
            'item',
            'editUtil',
            'identifier',
            'lookups',
            'util',
        ];
        
        const compiledFn = Function.apply(
            Function,
            compiledArgs.concat(customScript)
        );

        return (mode, item, editUtil, identifier, lookups, util) =>
            compiledFn.apply(compiledFn, [
                mode,
                item,
                editUtil,
                identifier,
                lookups,
                util,
            ]);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return (_mode, _item, _editUtil, _identifier, _lookups, _util) => {};
}