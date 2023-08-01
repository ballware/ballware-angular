import { inject } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { MetaApiService } from "@ballware/meta-api";
import { identityUserLogin } from "../identity";
import { combineLatest, map, of, switchMap, withLatestFrom } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { tenantFetched } from "./tenant.actions";

export const fetchTenant = createEffect((actions$ = inject(Actions), httpClient = inject(HttpClient), metaApiService = inject(MetaApiService)) => 
    actions$.pipe(ofType(identityUserLogin))        
        .pipe(withLatestFrom(metaApiService.metaTenantApiFactory$))
        .pipe(switchMap(([user, tenantApi]) => combineLatest([of(user), tenantApi().metadataForTenant(httpClient, user.tenant)]) ))
        .pipe(map(([user, compiledTenant]) => tenantFetched({ user: user.currentUser, tenant: compiledTenant })))
, { functional: true, dispatch: true });