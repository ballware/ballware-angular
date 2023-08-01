import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { identityReducer } from './identity.reducer';
import { identityFeatureKey } from './identity.state';
import { initializeOAuth, logoutOAuth, manageProfile, refreshToken } from './identity.effects';

export * from './identity.actions';
export * from './identity.state';

export const IdentityFeatureModule = StoreModule.forFeature(identityFeatureKey, identityReducer);
export const IdentityEffectsModule = EffectsModule.forFeature({ initializeOAuth, logoutOAuth, refreshToken, manageProfile });