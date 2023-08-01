import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MetaApiModule } from '@ballware/meta-api';
import { MetaServicesModule } from '@ballware/meta-services';
import { OAuthModule } from 'angular-oauth2-oidc';
import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing.module';
import { ResponsiveDetectorComponent } from './shared/components/responsive-detector/responsive-detector.component';
import { RenderFactoryModule } from './shared/dx-renderer/dx-renderer.module';
import { BearerTokenInterceptor } from './shared/interceptors/bearertoken.interceptor';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StoreRouterConnectingModule, routerReducer } from '@ngrx/router-store';
import { EffectsModule } from '@ngrx/effects';

@NgModule({
  declarations: [AppComponent, ResponsiveDetectorComponent],
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
    }),
    HttpClientModule,
    OAuthModule.forRoot(),
    AppRoutingModule,
    MetaApiModule.forRoot({
      identityServiceBaseUrl: environment.envVar.BALLWARE_IDENTITYURL,
      metaServiceBaseUrl: environment.envVar.BALLWARE_METAURL,
      documentServiceBaseUrl: environment.envVar.BALLWARE_DOCUMENTURL
    }),
    MetaServicesModule.forRoot(),
    RenderFactoryModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: BearerTokenInterceptor, multi: true }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
