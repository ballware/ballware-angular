import { StatisticMappingFunc } from "@ballware/meta-model";

export const compileStatisticMapping = (customScript: string|undefined): StatisticMappingFunc => {
    if (customScript) {
        const compiledArgs = [
            'data',
            'layout',
            'customParam',
            'params',
            'lookups',
            'util',
            'callback',
        ];
        
        const compiledFn = Function.apply(
            Function,
            compiledArgs.concat(customScript)
        );
      
        return (data, layout, customParam, params, lookups, util, callback) =>
            compiledFn.apply(compiledFn, [
                data,
                layout,
                customParam,
                params,
                lookups,
                util,
                callback,
            ]);
    }

    return (data, layout, _customParam, _params, _lookups, _util, callback) => callback(layout, data);
}