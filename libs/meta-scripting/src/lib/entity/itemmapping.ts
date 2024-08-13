import { cloneDeep } from 'lodash';
import { ItemMappingFunc } from "@ballware/meta-model";

export const compileItemMapping = (customScript: string|undefined): ItemMappingFunc => {
    if (customScript) {
        const compiledArgs = ['item', 'customParam', 'util'];
        
        const compiledFn = Function.apply(
            Function,
            compiledArgs.concat(customScript)
        );

        return (item, customParam, util) =>
            compiledFn.apply(compiledFn, [cloneDeep(item), customParam, util]);
    }

    return (item, _customParam, _util) => item;
}