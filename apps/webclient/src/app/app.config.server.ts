import { mergeApplicationConfig, ApplicationConfig, LOCALE_ID, REQUEST } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { appConfig } from './app.config';
const serverConfig: ApplicationConfig = {
  providers: [
    {
      provide: LOCALE_ID,
      useFactory: (req: Request) =>
        req.headers.get('accept-language')?.split(',')[0] ?? 'de',
      deps: [REQUEST]
    },
    provideServerRendering()
  ]
};
export const config = mergeApplicationConfig(appConfig, serverConfig);
