import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MetaApiModule } from '@ballware/meta-api';
import { MetaServicesModule } from '@ballware/meta-services';
import { OAuthModule } from 'angular-oauth2-oidc';
import { environment } from '../environments/environment';

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
