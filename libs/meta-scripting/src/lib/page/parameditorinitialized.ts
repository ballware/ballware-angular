import { ParamEditorInitializedFunc } from "@ballware/meta-model";

export const compileParamEditorInitialized = (customScript: string|undefined): ParamEditorInitializedFunc => {
    if (customScript) {
        const compiledArgs = ['name', 'editUtil', 'lookups', 'util', 'actions', 'pageParam'];
        const compiledFn = Function.apply(
            Function,
            compiledArgs.concat(customScript)
        );

        return (name, editUtil, lookups, util, actions, pageParam) =>
            compiledFn.apply(compiledFn, [
                name,
                editUtil,
                lookups,
                util,
                actions,
                pageParam,
            ]);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return (_name, _editUtil, _lookups, _util, _actions, _pageParam) => {};
}