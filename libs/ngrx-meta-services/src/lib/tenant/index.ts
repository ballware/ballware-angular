import { provideState } from '@ngrx/store';
import { tenantReducer } from './tenant.reducer';
import { tenantFeatureKey } from './tenant.state';
import { provideEffects } from '@ngrx/effects';
import { fetchTenant } from './tenant.effects';

export * from './tenant.actions';
export * from './tenant.state';

export const provideTenantFeature = () => provideState(tenantFeatureKey, tenantReducer);
export const provideTenantEffects = () => provideEffects({ fetchTenant });