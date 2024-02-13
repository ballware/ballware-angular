import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { fetchAllowedTenants, initializeOAuth, logoutOAuth, manageProfile, notifyUserLogin, refreshToken, switchTenant, userExpired } from './identity.effects';
import { identityReducer } from './identity.reducer';
import { identityFeatureKey } from './identity.state';

export const IdentityFeatureModule = StoreModule.forFeature(identityFeatureKey, identityReducer);
export const IdentityEffectsModule = EffectsModule.forFeature({ initializeOAuth, logoutOAuth, refreshToken, userExpired, manageProfile, notifyUserLogin, fetchAllowedTenants, switchTenant });