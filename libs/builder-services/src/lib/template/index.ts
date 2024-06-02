import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { openTemplate, openedTemplate } from './template.effects';
import { templateReducer } from './template.reducer';
import { templateFeatureKey } from './template.state';

export { TemplateServiceProxy } from './template.proxy';

export const TemplateFeatureModule = StoreModule.forFeature(templateFeatureKey, templateReducer);
export const TemplateEffectsModule = EffectsModule.forFeature({ openTemplate, openedTemplate });