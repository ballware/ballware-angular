import { bootstrapApplication } from '@angular/platform-browser';
import { config } from './app/app.config.browser';
import { AppComponent } from './app/app.component';

(async () => {
  await bootstrapApplication(AppComponent, config);
})();
