import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MetaApiModule } from '@ballware/meta-api';
import { MetaServicesModule } from '@ballware/meta-services';
import { OAuthModule } from 'angular-oauth2-oidc';
import { environment } from '../environments/environment';

import { ServiceWorkerModule } from '@angular/service-worker';
import { RenderFactoryModule } from '@ballware/dx-renderer';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule, routerReducer } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing.module';
import { PrintComponent } from './shared/components/print/print.component';
import { ResponsiveDetectorComponent } from './shared/components/responsive-detector/responsive-detector.component';
import { BearerTokenInterceptor } from './shared/interceptors/bearertoken.interceptor';

declare let window :any;

@NgModule({
  declarations: [AppComponent, ResponsiveDetectorComponent, PrintComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),    
    StoreModule.forRoot({
      router: routerReducer
    }),
    StoreRouterConnectingModule.forRoot(),
    EffectsModule.forRoot(),
    StoreDevtoolsModule.instrument({
      maxAge: 25,
      logOnly: environment.production,
      autoPause: true,
      trace: false,
      traceLimit: 75
    , connectInZone: true}),
    HttpClientModule,
    OAuthModule.forRoot(),
    AppRoutingModule,
    MetaApiModule.forRoot({
      identityServiceBaseUrl: window.ENV.BALLWARE_IDENTITYURL,
      metaServiceBaseUrl: window.ENV.BALLWARE_METAURL,
      documentServiceBaseUrl: window.ENV.BALLWARE_DOCUMENTURL
    }),
    MetaServicesModule.forRoot(),
    RenderFactoryModule.forRoot({ licenseKey: window.ENV.BALLWARE_DEVEXTREMEKEY }),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: BearerTokenInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
