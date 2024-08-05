import { EntityRightsCheckFunc } from "@ballware/meta-model";

export const compileRightsCheckFunc = (customScript: string|undefined): EntityRightsCheckFunc => {

    if (customScript) {
      const compiledRightsCheckArgs = [
        'userinfo',
        'application',
        'entity',
        'readOnly',
        'right',
        'param',
        'result'
      ];
      const compiledRightsCheckFn = Function.apply(
        Function,
        compiledRightsCheckArgs.concat(customScript)
      );
  
      return (userinfo, application, entity, readOnly, right, param, result) =>
        compiledRightsCheckFn.apply(compiledRightsCheckFn, [
          userinfo,
          application,
          entity,
          readOnly,
          right,
          param,
          result
        ]);
    }
    
    return (_userinfo, _application, _entity, _readOnly, _right, _param, result) => result;
  }