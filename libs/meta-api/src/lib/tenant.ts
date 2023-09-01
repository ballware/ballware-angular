import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { parse } from 'json5/lib';

import { CompiledTenant, NavigationLayout } from '@ballware/meta-model';

/**
 * Interface for tenant data operations
 */
 export interface MetaTenantApi {
  /**
   * Fetch metadatan for tenant
   * @param tenant Identifier of tenant
   * @returns Observable containing compiled tenant metadata
   */
  metadataForTenant: (tenant: string) => Observable<CompiledTenant>;
}

interface Tenant {
  Id: string;
  Name: string;
  Navigation?: string;
  RightsCheckScript?: string;
}

const compileTenant = (tenant: Tenant): CompiledTenant => {
  const compiledTenant = {
    id: tenant.Id,
    name: tenant.Name,
    navigation: tenant.Navigation
      ? (parse(tenant.Navigation) as NavigationLayout)
      : ({} as NavigationLayout),
  } as CompiledTenant;

  if (tenant.RightsCheckScript) {
    const compiledArgs = ['userinfo', 'right'];
    const compiledFn = Function.apply(
      Function,
      compiledArgs.concat(tenant.RightsCheckScript)
    );

    compiledTenant.hasRight = compiledFn
      ? (userinfo, right) => compiledFn.apply(compiledFn, [userinfo, right])
      : () => true;
  }

  return compiledTenant;
};

const metadataFunc = (http: HttpClient, serviceBaseUrl: string) => (
  tenant: string
): Observable<CompiledTenant> => {
  const url = `${serviceBaseUrl}/api/tenant/metadatafortenant/${tenant}`;

  return http
    .get<Tenant>(url)
    .pipe(map(data => compileTenant(data)));
};

/**
 * Create adapter for tenant fetch operations with ballware.meta.service
 * @param serviceBaseUrl Base URL to connect to ballware.meta.service
 * @returns Adapter object providing data operations
 */
export function createMetaBackendTenantApi(
  httpClient: HttpClient, 
  serviceBaseUrl: string
): MetaTenantApi {
  return {
    metadataForTenant: metadataFunc(httpClient, serviceBaseUrl),
  } as MetaTenantApi;
}
