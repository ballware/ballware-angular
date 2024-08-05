import { EditorEventFunc } from "@ballware/meta-model";

export const compileEditorEvent = (customScript: string|undefined): EditorEventFunc => {
    if (customScript) {
        const compiledArgs = [
            'item',
            'editUtil',
            'identifier',
            'event',
            'lookups',
            'util',
        ];
        
        const compiledFn = Function.apply(
            Function,
            compiledArgs.concat(customScript)
        );

        return (item, editUtil, identifier, event, lookups, util) =>
            compiledFn.apply(compiledFn, [
                item,
                editUtil,
                identifier,
                event,
                lookups,
                util,
            ]);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return (_item, _editUtil, _identifier, _event, _lookups, _util) => {};
}