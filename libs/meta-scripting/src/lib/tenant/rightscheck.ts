import { TenantRightsCheckFunc } from "@ballware/meta-model";

export const compileTenantRightsCheck = (customScript: string|undefined): TenantRightsCheckFunc => {
    
    if (customScript) {
        const compiledArgs = ['userinfo', 'right'];

        const compiledFn = Function.apply(
            Function,
            compiledArgs.concat(customScript)
        );

        return (userinfo, right) => compiledFn.apply(compiledFn, [userinfo, right]);
    }

    return (_userinfo, _right) => true;
}