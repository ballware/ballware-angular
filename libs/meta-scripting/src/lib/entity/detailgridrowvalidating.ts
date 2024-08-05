import { DetailGridRowValidatingFunc } from "@ballware/meta-model";

export const compileDetailGridRowValidating = (customScript: string|undefined): DetailGridRowValidatingFunc => {
    if (customScript) {
        const compiledArgs = ['mode', 'item', 'detailItem', 'identifier', 'util'];

        const compiledFn = Function.apply(
            Function,
            compiledArgs.concat(customScript)
        );

        return (mode, item, detailItem, identifier, util) =>
            compiledFn.apply(compiledFn, [
                mode,
                item,
                detailItem,
                identifier,
                util,
            ]);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return (_mode, _item, _detailItem, _identifier, _util) => undefined;
}