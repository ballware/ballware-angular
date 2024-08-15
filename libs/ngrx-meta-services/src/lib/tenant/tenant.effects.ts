import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { MetaApiService } from "@ballware/meta-api";
import { identityUserLogin } from "../identity/identity.actions";
import { combineLatest, map, of, switchMap } from "rxjs";
import { tenantFetched } from "./tenant.actions";

export const fetchTenant = createEffect((actions$ = inject(Actions), metaApiService = inject(MetaApiService)) => 
    actions$.pipe(ofType(identityUserLogin))                
        .pipe(switchMap((user) => combineLatest([of(user), metaApiService.metaTenantApi.metadataForTenant(user.tenant)]) ))
        .pipe(map(([user, compiledTenant]) => tenantFetched({ user: user.currentUser, tenant: compiledTenant })))
, { functional: true, dispatch: true });