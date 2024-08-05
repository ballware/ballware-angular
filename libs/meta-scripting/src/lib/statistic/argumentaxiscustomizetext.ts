import { ArgumentAxisCustomizeTextFunc } from "@ballware/meta-model";

export const compileArgumentAxisCustomizeText = (customScript: string|undefined): ArgumentAxisCustomizeTextFunc => {
    if (customScript) {
        const compiledArgs = ['layout', 'value', 'params', 'customParam', 'util'];
        const compiledFn = Function.apply(
            Function,
            compiledArgs.concat(customScript)
        );

        return (layout, value, params, customParam, util) =>
            compiledFn.apply(compiledFn, [
                layout,
                value,
                params,
                customParam,
                util,
            ]);
    }

    return (_layout, _value, _params, _customParam, _util) => undefined;
}