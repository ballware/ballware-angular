import { EvaluateCustomFunctionFunc } from "@ballware/meta-model";

export const compileEvaluateCustomFunction = (customScript: string|undefined): EvaluateCustomFunctionFunc => {
    if (customScript) {
        const compiledArgs = [
            'identifier',
            'lookups',
            'util',
            'param',
            'executeCallback',
            'messageCallback',
        ];
        
        const compiledFn = Function.apply(
            Function,
            compiledArgs.concat(customScript)
        );
    
        return (identifier, lookups, util, param, executeCallback, messageCallback) => compiledFn.apply(compiledFn, [
                    identifier,
                    lookups,
                    util,
                    param,
                    executeCallback,
                    messageCallback,
                ]);
    }

    return (_identifier, _lookups, _util, param, executeCallback, _messageCallback) => executeCallback(param);
}