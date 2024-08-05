import { EditorInitializedFunc } from "@ballware/meta-model";

export const compileEditorInitialized = (customScript: string|undefined): EditorInitializedFunc => {
    if (customScript) {
        const compiledEditorInitializedArgs = [
            'mode',
            'item',
            'editUtil',
            'identifier',
            'lookups',
            'util',
        ];        
        
        const compiledEditorInitializedFn = Function.apply(
            Function,
            compiledEditorInitializedArgs.concat(customScript)
        );

        return (mode, item, editUtil, identifier, lookups, util) =>
            compiledEditorInitializedFn.apply(compiledEditorInitializedFn, [
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