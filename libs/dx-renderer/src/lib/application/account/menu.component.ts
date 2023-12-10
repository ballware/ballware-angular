import { Component, ViewChild } from '@angular/core';
import { ResponsiveService, SCREEN_SIZE, IdentityService } from '@ballware/meta-services';
import { I18NextPipe } from 'angular-i18next';
import { DxActionSheetComponent } from 'devextreme-angular';
import { combineLatest, map, Observable, takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';

@Component({
  selector: 'ballware-application-account-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  providers: []
})
export class ApplicationAccountMenuComponent extends WithDestroy() {

  @ViewChild('accountMenu', { static: false }) accountMenu?: DxActionSheetComponent;

  currentUser$: Observable<Record<string, unknown>|undefined>;
  username$: Observable<string|undefined>;
  usePopover$: Observable<boolean>;

  userMenuItems: Record<string, unknown>[] = [];

  constructor(private identityService: IdentityService, private responsiveService: ResponsiveService, private translationService: I18NextPipe) {
    super();

    combineLatest([this.identityService.userName$])
      .pipe(takeUntil(this.destroy$))
      .subscribe((userName) => {
        this.userMenuItems = userName ? [
          {
            text: this.translationService.transform('session.refresh'),
            onClick: () => {
              this.accountMenu?.instance.hide();              
              this.identityService.refreshToken();
            }
          },
          {
            text: this.translationService.transform('session.manageaccount'),
            onClick: () => {
              this.accountMenu?.instance.hide();
              this.identityService.manageProfile();
            }
          },
          {
            text: this.translationService.transform('session.logout', { user: userName }),
            onClick: () => {
              this.accountMenu?.instance.hide();
              this.identityService.logout();
            }
          }] : [

          ];
      });


    this.usePopover$ = this.responsiveService.onResize$
      .pipe(takeUntil(this.destroy$))
      .pipe(map((screenSize) => screenSize >= SCREEN_SIZE.SM));

    this.currentUser$ = this.identityService.currentUser$;
    this.username$ = this.identityService.userName$;
  }

  toggleShow(target?: Element): void {
    if (this.accountMenu?.visible) {
      this.accountMenu?.instance.hide();
    } else if (target) {
      this.accountMenu?.instance.option('target', target);
      this.accountMenu?.instance.show();
    }
  }
}

