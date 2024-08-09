import { PrepareCustomParamFunc } from "@ballware/meta-model";

export const compilePrepareCustomParam = (customScript: string|undefined): PrepareCustomParamFunc => {
    if (customScript) {
      const compiledArgs = ['lookups', 'util', 'callback'];
      const compiledFn = Function.apply(
        Function,
        compiledArgs.concat(customScript)
      );

      return (lookups, util, callback) => compiledFn.apply(compiledFn, [lookups, util, callback]);
    }

    return (_lookups, _util, callback) => callback({});
}