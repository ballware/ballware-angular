import { cloneDeep } from 'lodash';
import { ItemMappingFunc } from "@ballware/meta-model";

export const compileItemMapping = (customScript: string|undefined, commonUtils?: string|undefined): ItemMappingFunc => {
    if (customScript) {
        const prefixedCode = commonUtils ? commonUtils + '\n' + customScript : customScript;

        const compiledArgs = ['item', 'customParam', 'util'];
        
        const compiledFn = Function.apply(
            Function,
            compiledArgs.concat(prefixedCode)
        );

        return (item, customParam, util) =>
            compiledFn.apply(compiledFn, [cloneDeep(item), customParam, util]);
    }

    return (item, _customParam, _util) => item;
}