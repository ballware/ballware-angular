import { InteractionKeyboardLineFunc } from "@ballware/meta-model";

export const compileInteractionKeyboardLine = (customScript: string|undefined, commonUtils?: string|undefined): InteractionKeyboardLineFunc => {
    if (customScript) {
        const prefixedCode = commonUtils ? commonUtils + '\n' + customScript : customScript;

        const compiledArgs = [
            'item',
            'editUtil',
            'value',
            'lookups',
            'util',
        ];
        
        const compiledFn = Function.apply(
            Function,
            compiledArgs.concat(prefixedCode)
        );

        return (item, editUtil, value, lookups, util) =>
            compiledFn.apply(compiledFn, [
                item,
                editUtil,
                value,
                lookups,
                util,
            ]);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return (_item, _editUtil, _value, _lookups, _util) => {};
}