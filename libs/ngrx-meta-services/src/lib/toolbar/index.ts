import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { fetchDocumentation } from './toolbar.effects';
import { toolbarReducer } from './toolbar.reducer';
import { toolbarFeatureKey } from './toolbar.state';

export const ToolbarFeatureModule = StoreModule.forFeature(toolbarFeatureKey, toolbarReducer);
export const ToolbarEffectsModule = EffectsModule.forFeature({ fetchDocumentation });