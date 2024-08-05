import { InitNewDetailItemFunc } from "@ballware/meta-model";

export const compileInitNewDetailItem = (customScript: string|undefined): InitNewDetailItemFunc => {
    if (customScript) {
        const compiledArgs = ['dataMember', 'item', 'detailItem', 'util'];

        const compiledFn = Function.apply(
            Function,
            compiledArgs.concat(customScript)
        );
  
        return (dataMember, item, detailItem, util) =>
            compiledFn.apply(compiledFn, [dataMember, item, detailItem, util]);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return (_dataMember, _item, _detailItem, _util) => {};
}