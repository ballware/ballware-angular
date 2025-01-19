import { PrepareCustomParamFunc } from "@ballware/meta-model";

export const compilePrepareCustomParam = (customScript: string|undefined): PrepareCustomParamFunc => {
    if (customScript) {
      const compiledArgs = ['lookups', 'util', 'initialCustomParam', 'callback'];
      const compiledFn = Function.apply(
        Function,
        compiledArgs.concat(customScript)
      );

      return (lookups, util, initialCustomParam, callback) => compiledFn.apply(compiledFn, [lookups, util, initialCustomParam, callback]);
    }

    return (_lookups, _util, initialCustomParam, callback) => callback(initialCustomParam);
}