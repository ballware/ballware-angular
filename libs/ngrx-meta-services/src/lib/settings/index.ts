import { provideState } from '@ngrx/store';
import { settingsReducer } from './settings.reducer';
import { settingsFeatureKey } from './settings.state';

export const provideSettingsFeature = () => provideState(settingsFeatureKey, settingsReducer);