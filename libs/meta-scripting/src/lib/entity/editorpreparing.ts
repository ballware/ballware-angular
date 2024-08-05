import { EditorPreparingFunc } from "@ballware/meta-model";

export const compileEditorPreparing = (customScript: string|undefined): EditorPreparingFunc => {
    if (customScript) {
        const compiledEditorPreparingArgs = [
            'mode',
            'item',
            'layoutItem',
            'identifier',
            'lookups',
            'util',
        ];

        const compiledEditorPreparingFn = Function.apply(
            Function,
            compiledEditorPreparingArgs.concat(customScript)
        );

        return (mode, item, layoutItem, identifier, lookups, util) =>
            compiledEditorPreparingFn.apply(compiledEditorPreparingFn, [
                mode,
                item,
                layoutItem,
                identifier,
                lookups,
                util,
            ]);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return (_mode, _item, _layoutItem, _identifier, _lookups, _util) => {};
}