import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MetaApiModule } from '@ballware/meta-api';
import { AuthService, MetaServicesModule } from '@ballware/meta-services';
import { OAuthModule } from 'angular-oauth2-oidc';
import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing.module';
import { ResponsiveDetectorComponent } from './shared/components/responsive-detector/responsive-detector.component';
import { RenderFactoryModule } from './shared/dx-renderer/dx-renderer.module';
import { BearerTokenInterceptor } from './shared/interceptors/bearertoken.interceptor';

@NgModule({
  declarations: [AppComponent, ResponsiveDetectorComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    HttpClientModule,
    OAuthModule.forRoot(),
    AppRoutingModule,
    MetaApiModule.forRoot({
      identityServiceBaseUrl: environment.envVar.BALLWARE_IDENTITYURL,
      metaServiceBaseUrl: environment.envVar.BALLWARE_METAURL,
      documentServiceBaseUrl: environment.envVar.BALLWARE_DOCUMENTURL
    }),
    MetaServicesModule.forRoot({
      version: '0.0.1',
      googlekey: environment.envVar.BALLWARE_GOOGLEKEY,
      identityIssuer: environment.envVar.BALLWARE_IDENTITYURL,
      identityClient: environment.envVar.BALLWARE_CLIENTID,
      identityScopes: environment.envVar.BALLWARE_IDENTITYSCOPES,
      identityTenantClaim: environment.envVar.BALLWARE_TENANTCLAIM,
      identityUsernameClaim: environment.envVar.BALLWARE_USERNAMECLAIM,
      identityProfileUrl: environment.envVar.BALLWARE_ACCOUNTURL
    }),
    RenderFactoryModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: BearerTokenInterceptor, multi: true },
    {
      provide: AuthService, useClass: AuthService
    }
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
