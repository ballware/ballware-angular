import { StoreModule } from '@ngrx/store';
import { responsiveReducer } from './responsive.reducer';
import { responsiveFeatureKey } from './responsive.state';

export * from './responsive.actions';
export * from './responsive.proxy';
export * from './responsive.state';

export const ResponsiveFeatureModule = StoreModule.forFeature(responsiveFeatureKey, responsiveReducer);