import { Observable } from 'rxjs';

import { CompiledTenant } from '@ballware/meta-model';
import { InjectionToken } from '@angular/core';
import { SelectableMetaApi } from './selectable';

/**
 * Interface for tenant data operations
 */
 export interface MetaTenantApi extends SelectableMetaApi {

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
