import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { TemplateEffectsModule, TemplateFeatureModule, TemplateService, TemplateServiceProxy } from '@ballware/builder-services';
import { NotificationFeatureModule, NotificationService, NotificationServiceProxy, ResponsiveFeatureModule, ResponsiveService, ResponsiveServiceProxy } from '@ballware/common-services';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {  
  providers: [
    provideClientHydration(), 
    provideRouter(appRoutes),
    importProvidersFrom(StoreModule.forRoot(), StoreDevtoolsModule.instrument(), EffectsModule.forRoot(), ResponsiveFeatureModule, NotificationFeatureModule, TemplateFeatureModule, TemplateEffectsModule),
    { provide: ResponsiveService, useClass: ResponsiveServiceProxy },
    { provide: NotificationService, useClass: NotificationServiceProxy },
    { provide: TemplateService, useClass: TemplateServiceProxy }
  ],  
};
