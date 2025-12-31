import { mergeApplicationConfig, ApplicationConfig, LOCALE_ID, REQUEST } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { sharedConfig } from './app.config';
import { ENV } from './env';

const runtimeEnv = {
  BALLWARE_VERSION: process.env['BALLWARE_VERSION'],
  BALLWARE_BASEURL: process.env['BALLWARE_BASEURL'],
  BALLWARE_IDENTITYURL: process.env['BALLWARE_IDENTITYURL'],
  BALLWARE_METAURL: process.env['BALLWARE_METAURL'],
  BALLWARE_TENANTURL: process.env['BALLWARE_TENANTURL'],
  BALLWARE_GENERICURL: process.env['BALLWARE_GENERICURL'],
  BALLWARE_DOCUMENTURL: process.env['BALLWARE_DOCUMENTURL'],
  BALLWARE_DOCUMENT_DESIGNER_URL: process.env['BALLWARE_DOCUMENT_DESIGNER_URL'],
  BALLWARE_DOCUMENT_VIEWER_URL: process.env['BALLWARE_DOCUMENT_VIEWER_URL'],
  BALLWARE_DOCUMENT_SIGNON_URL: process.env['BALLWARE_DOCUMENT_SIGNON_URL'],
  BALLWARE_STORAGEURL: process.env['BALLWARE_STORAGEURL'],
  BALLWARE_MLURL: process.env['BALLWARE_MLURL'],
  BALLWARE_CLIENTID: process.env['BALLWARE_CLIENTID'],
  BALLWARE_CLIENTSECRET: process.env['BALLWARE_CLIENTSECRET'],
  BALLWARE_TENANTCLAIM: process.env['BALLWARE_TENANTCLAIM'],
  BALLWARE_USERNAMECLAIM: process.env['BALLWARE_USERNAMECLAIM'],
  BALLWARE_IDENTITYSCOPES: process.env['BALLWARE_IDENTITYSCOPES'],
  BALLWARE_ACCOUNTURL: process.env['BALLWARE_ACCOUNTURL'],
  BALLWARE_IDENTITYAUTOREFRESH: process.env['BALLWARE_IDENTITYAUTOREFRESH'],
  BALLWARE_GOOGLEKEY: process.env['BALLWARE_GOOGLEKEY'],
  BALLWARE_DEVEXTREMEKEY: process.env['BALLWARE_DEVEXTREMEKEY'],
};

const serverConfig: ApplicationConfig = {
  providers: [
    {
      provide: ENV,
      useValue: runtimeEnv
    },
    {
      provide: LOCALE_ID,
      useFactory: (req: Request) =>
        req.headers.get('accept-language')?.split(',')[0] ?? 'de',
      deps: [REQUEST]
    },
    provideServerRendering()
  ]
};
export const config = mergeApplicationConfig(sharedConfig, serverConfig);
