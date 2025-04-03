import { Observable } from 'rxjs';

import { CompiledTenant } from '@ballware/meta-model';
import { InjectionToken } from '@angular/core';

/**
 * Interface for tenant data operations
 */
 export interface MetaTenantApi {
  /**
   * Fetch list for lookup
   *
   * @returns Observable containing result list of lookup query
   */
  selectList: () => Observable<Array<Record<string, unknown>>>;

  /**
   * Fetch single element for lookup by id
   *
   * @param id Id of lookup element
   * @returns Observable containing lookup element
   */
  selectById: (id: string) => Observable<Record<string, unknown>>;

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
  allowed: () => Observable<Array<Record<string, unknown>>>;
}

export const META_TENANT_API = new InjectionToken<MetaTenantApi>('Meta tenant api');