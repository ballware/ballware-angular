import { Component, OnInit } from '@angular/core';
import { IdentityService, SettingsService } from '@ballware/meta-services';

import { environment } from '../environments/environment';

@Component({
  selector: 'ballware-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'ballware';

  constructor(private settingsService: SettingsService, private identityService: IdentityService) {}

  ngOnInit(): void {
    this.settingsService.initialize(
      environment.version,
      environment.envVar.BALLWARE_GOOGLEKEY
    );

    this.identityService.initialize(
      environment.envVar.BALLWARE_IDENTITYURL,
      environment.envVar.BALLWARE_CLIENTID,
      environment.envVar.BALLWARE_IDENTITYSCOPES,
      environment.envVar.BALLWARE_TENANTCLAIM,
      environment.envVar.BALLWARE_USERNAMECLAIM,
      environment.envVar.BALLWARE_ACCOUNTURL
    );
  }
}
