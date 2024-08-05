import { ParamEditorEventFunc } from "@ballware/meta-model";

export const compileParamEditorEvent = (customScript: string|undefined): ParamEditorEventFunc => {
    if (customScript) {
        const compiledArgs = [
            'name',
            'event',
            'editUtil',
            'lookups',
            'util',
            'actions',
            'pageParam',
            'param',
        ];

        const compiledFn = Function.apply(
            Function,
            compiledArgs.concat(customScript)
        );

        return (name, event, editUtil, lookups, util, actions, pageParam, param) =>
            compiledFn.apply(compiledFn, [
                name,
                event,
                editUtil,
                lookups,
                util,
                actions,
                pageParam,
                param,
            ]);
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return (_name, _event, _editUtil, _lookups, _util, _actions, _pageParam, _param) => {};
}