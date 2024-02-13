import { Component, OnInit } from '@angular/core';
import { IdentityService, SettingsService } from '@ballware/meta-services';


declare let window :any;

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
      window.ENV.BALLWARE_VERSION,
      window.ENV.BALLWARE_GOOGLEKEY
    );

    this.identityService.initialize(
      window.ENV.BALLWARE_IDENTITYURL,
      window.ENV.BALLWARE_CLIENTID,
      window.ENV.BALLWARE_IDENTITYSCOPES,
      window.ENV.BALLWARE_TENANTCLAIM,
      window.ENV.BALLWARE_USERNAMECLAIM,
      window.ENV.BALLWARE_ACCOUNTURL
    );
  }
}
