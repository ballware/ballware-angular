import { StoreModule } from '@ngrx/store';
import { tenantReducer } from './tenant.reducer';
import { tenantFeatureKey } from './tenant.state';
import { EffectsModule } from '@ngrx/effects';
import { fetchTenant } from './tenant.effects';

export * from './tenant.actions';
export * from './tenant.state';

export const TenantFeatureModule = StoreModule.forFeature(tenantFeatureKey, tenantReducer);
export const TenantEffectsModule = EffectsModule.forFeature({ fetchTenant });