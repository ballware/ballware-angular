import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { fetchAllowedTenants, initializeOAuth, logoutOAuth, manageProfile, notifyUserLogin, refreshToken, switchTenant, userExpired } from './identity.effects';
import { identityReducer } from './identity.reducer';
import { identityFeatureKey } from './identity.state';

export const provideIdentityFeature = () => provideState(identityFeatureKey, identityReducer);
export const provideIdentityEffects = () => provideEffects({ initializeOAuth, logoutOAuth, refreshToken, userExpired, manageProfile, notifyUserLogin, fetchAllowedTenants, switchTenant });