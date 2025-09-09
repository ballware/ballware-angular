import { InjectionToken } from '@angular/core';
import { SelectableMetaApi } from './selectable';

/**
 * Functions for accessing role information from identity provider
 */
export interface IdentityRoleApi extends SelectableMetaApi {
}

export const IDENTITY_ROLE_API = new InjectionToken<IdentityRoleApi>('Identity role api');
