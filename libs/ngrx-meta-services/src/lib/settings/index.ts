import { StoreModule } from '@ngrx/store';
import { settingsReducer } from './settings.reducer';
import { settingsFeatureKey } from './settings.state';

export const SettingsFeatureModule = StoreModule.forFeature(settingsFeatureKey, settingsReducer);