import { ParamsInitializedFunc } from "@ballware/meta-model";

export const compileParamsInitialized = (customScript: string|undefined): ParamsInitializedFunc => {
    if (customScript) {
        const compiledArgs = ['hidden', 'lookups', 'util', 'actions', 'pageParam'];
        const compiledFn = Function.apply(
            Function,
            compiledArgs.concat(customScript)
        );

        return (hidden, lookups, util, actions, pageParam) =>
            compiledFn.apply(compiledFn, [hidden, lookups, util, actions, pageParam]);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return (_hidden, _lookups, _util, _actions, _pageParam) => {};
}