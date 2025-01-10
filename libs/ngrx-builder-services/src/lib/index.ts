import { EnvironmentProviders, inject, makeEnvironmentProviders } from "@angular/core";
import { IDENTITY_SERVICE, IdentityService } from "@ballware/meta-services";
import { identityUserLogin } from "@ballware/ngrx-meta-services";
import { Actions, createEffect, ofType, provideEffects, ROOT_EFFECTS_INIT } from "@ngrx/effects";
import { Store } from "@ngrx/store";
import { tap, asyncScheduler, of } from "rxjs";

const fakeUserLogin = createEffect((actions$ = inject(Actions), store = inject(Store)) => 
    actions$.pipe(ofType(ROOT_EFFECTS_INIT))
        .pipe(tap(() => {
            asyncScheduler.schedule(() => {
                store.dispatch(identityUserLogin({
                    refreshToken: 'fake_token',
                    accessToken: 'fake_token',
                    accessTokenExpiration: new Date(),
                    currentUser: {},
                    tenant: 'Builder',
                    userName: 'Builder'
                }));
            });            
        })), 
        { functional: true, dispatch: false });

const fakeIdentityService = {
    profileUrl$: of(undefined),    
    authenticated$: of(true),
    accessTokenExpiration$: of(new Date()),
    
    currentUser$: of({}),
    userTenant$: of('Builder'),
    userName$: of('Builder'),
    accessToken$: of('fake_token'),
    
    allowedTenants$: of([{ Id: 'Builder', Name: 'Builder' }]),
    
    initialize: () => {},
    
    refreshToken: () => {},
    manageProfile: () => {},
    logout: () => {},
    expired: () => {},
    switchTenant: () => {}
} as IdentityService;

const provideIdentityEffects = () => provideEffects({ fakeUserLogin });

export function provideBuilderFakeIdentity(): EnvironmentProviders {
  return makeEnvironmentProviders(    
    [  
        provideIdentityEffects(),
        {
            provide: IDENTITY_SERVICE,
            useValue: fakeIdentityService
        }
    ]);
}
