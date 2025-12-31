import { Component, Inject, OnInit } from '@angular/core';
import { ApplicationComponent } from '@ballware/dx-renderer';
import { IDENTITY_SERVICE, IdentityService, SETTINGS_SERVICE, SettingsService } from '@ballware/meta-services';

import { CommonModule } from '@angular/common';
import { ENV, RuntimeEnv } from './env';

@Component({
    selector: 'ballware-root',
    templateUrl: './app.component.html',
    styleUrls: [],
    imports: [CommonModule, ApplicationComponent],
    providers: []
})
export class AppComponent implements OnInit {
  title = 'ballware';

  constructor(
    @Inject(ENV) private readonly env: RuntimeEnv,
    @Inject(SETTINGS_SERVICE) private readonly settingsService: SettingsService,
    @Inject(IDENTITY_SERVICE) private readonly identityService: IdentityService,
  ) {}

  ngOnInit(): void {
    console.log(`Version ${this.env.BALLWARE_VERSION}`);

    this.settingsService.initialize(
      this.env.BALLWARE_VERSION,
      this.env.BALLWARE_GOOGLEKEY
    );

    this.identityService.initialize(
      this.env.BALLWARE_IDENTITYURL,
      this.env.BALLWARE_CLIENTID,
      this.env.BALLWARE_IDENTITYSCOPES,
      this.env.BALLWARE_TENANTCLAIM,
      this.env.BALLWARE_USERNAMECLAIM,
      this.env.BALLWARE_ACCOUNTURL,
      this.env.BALLWARE_IDENTITYAUTOREFRESH === '1'
    );
  }
}
