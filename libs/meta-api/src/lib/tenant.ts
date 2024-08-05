import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';

import { parse } from 'json5/lib';

import { CompiledTenant, NavigationLayout, Template } from '@ballware/meta-model';
import { compileTenantRightsCheck } from '@ballware/meta-scripting';

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

  /**
   * Fetch list of allowed tenants for current user   
   * @returns List of tenants 
   */
  allowed: () => Observable<{ Id: string, Name: string}[]>;
}

interface Tenant {
  Id: string;
  Name: string;
  Navigation?: string;
  Templates?: string;
  RightsCheckScript?: string;
}

const compileTenant = (tenant: Tenant): CompiledTenant => {
  const compiledTenant = {
    id: tenant.Id,
    name: tenant.Name,
    navigation: tenant.Navigation
      ? (parse(tenant.Navigation) as NavigationLayout)
      : ({} as NavigationLayout),
    templates: tenant.Templates 
      ? (parse(tenant.Templates) as Array<{ identifier: string, definition: string }>).map(t => ({
            identifier: t.identifier,
            definition: parse(t.definition)
          } as Template))        
      : ([]),      
      hasRight: compileTenantRightsCheck(tenant.RightsCheckScript)
  } as CompiledTenant;

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

const allowedTenantFunc = (http: HttpClient, serviceBaseUrl: string) => (): Observable<{ Id: string, Name: string}[]> => {
  const url = `${serviceBaseUrl}/api/tenant/allowed`;

  return http
    .get<{ Id: string, Name: string}[]>(url);
}

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
    allowed: allowedTenantFunc(httpClient, serviceBaseUrl)
  } as MetaTenantApi;
}
