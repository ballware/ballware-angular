import { PrepareCustomFunctionFunc } from "@ballware/meta-model";

export const compilePrepareCustomFunction = (customScript: string|undefined, commonUtils?: string|undefined): PrepareCustomFunctionFunc => {
    if (customScript) {
        const prefixedCode = commonUtils ? commonUtils + '\n' + customScript : customScript;

        const compiledArgs = [
            'identifier',
            'lookups',
            'util',
            'executeCallback',
            'messageCallback',
            'params',
            'selection',
        ];

        const compiledFn = Function.apply(
            Function,
            compiledArgs.concat(prefixedCode)
        );
    
        return (
                identifier,
                lookups,
                util,
                executeCallback,
                messageCallback,
                params,
                selection
            ) =>
                compiledFn.apply(compiledFn, [
                    identifier,
                    lookups,
                    util,
                    executeCallback,
                    messageCallback,
                    params,
                    selection,
            ]);
    }

    return (_identifier, _lookups, _util, executeCallback, _messageCallback, _params, selection) => selection?.forEach(s => executeCallback(s));
}