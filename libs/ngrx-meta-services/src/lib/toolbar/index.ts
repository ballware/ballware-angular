import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { fetchDocumentation } from './toolbar.effects';
import { toolbarReducer } from './toolbar.reducer';
import { toolbarFeatureKey } from './toolbar.state';

export const provideToolbarFeature = () => provideState(toolbarFeatureKey, toolbarReducer);
export const provideToolbarEffects = () => provideEffects({ fetchDocumentation });