import { provideState } from '@ngrx/store';
import { componentReducer } from './component.reducer';
import { componentFeatureKey } from './component.state';

export * from './component.actions';
export * from './component.state';

export const provideComponentFeature = () => provideState(componentFeatureKey, componentReducer);