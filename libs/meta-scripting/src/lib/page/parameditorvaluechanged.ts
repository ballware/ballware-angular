import { ParamEditorValueChangedFunc } from "@ballware/meta-model";

export const compileParamEditorValueChanged = (customScript: string|undefined): ParamEditorValueChangedFunc => {
    if (customScript) {
        const compiledArgs = [
            'name',
            'value',
            'editUtil',
            'lookups',
            'util',
            'actions',
            'pageParam',
        ];

        const compiledFn = Function.apply(
            Function,
            compiledArgs.concat(customScript)
        );

        return (name, value, editUtil, lookups, util, actions, pageParam) =>
            compiledFn.apply(compiledFn, [
                name,
                value,
                editUtil,
                lookups,
                util,
                actions,
                pageParam,
            ]);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return (_name, _value, _editUtil, _lookups, _util, _actions, _pageParam) => {};
}