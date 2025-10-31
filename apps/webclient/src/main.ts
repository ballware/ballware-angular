import { isDevMode, NgZone } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

declare let window :any;

(async () => {
  if (isDevMode() && window.ENV.NG_TRACING === 1) {
    const { runWithTracing } = await import('./dev-tools');
    await runWithTracing(async () => {
      const appRef = await bootstrapApplication(AppComponent, appConfig);
      if (isDevMode()) {
        const { installAngularProbes } = await import('./dev-tools');
        const ngZone = appRef.injector.get(NgZone);
        installAngularProbes(appRef, ngZone);
      }
    });
    return;
  }

  await bootstrapApplication(AppComponent, appConfig);
})();
