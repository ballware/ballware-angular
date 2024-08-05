import { DetailGridCellPreparingFunc } from "@ballware/meta-model";

export const compileDetailGridCellPreparing = (customScript: string|undefined): DetailGridCellPreparingFunc => {
    if (customScript) {
        const compiledArgs = [
            'mode',
            'item',
            'detailItem',
            'identifier',
            'options',
            'util',
        ];

        const compiledFn = Function.apply(
            Function,
            compiledArgs.concat(customScript)
        );

        return (mode, item, detailItem, identifier, options, util) =>
            compiledFn.apply(compiledFn, [
                mode,
                item,
                detailItem,
                identifier,
                options,
                util,
            ]);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return (_mode, _item, _detailItem, _identifier, _options, _util) => {};
}