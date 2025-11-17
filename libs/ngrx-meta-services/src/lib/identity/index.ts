import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { fetchAllowedTenants, initializeOidc, logoutOAuth, manageProfile, notifyUserLogin, refreshToken, switchTenant, userBusy, userExpired, userIdle } from './identity.effects';
import { identityReducer } from './identity.reducer';
import { identityFeatureKey } from './identity.state';

export const provideIdentityFeature = () => provideState(identityFeatureKey, identityReducer);
export const provideIdentityOidcEffects = () => provideEffects({ initializeOidc, logoutOAuth, refreshToken, userExpired, userIdle, userBusy, manageProfile, notifyUserLogin, fetchAllowedTenants, switchTenant });
