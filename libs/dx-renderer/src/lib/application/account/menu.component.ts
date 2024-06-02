import { Component, ViewChild } from '@angular/core';
import { ResponsiveService, SCREEN_SIZE } from '@ballware/common-services';
import { IdentityService } from '@ballware/meta-services';
import { I18NextPipe } from 'angular-i18next';
import { DxActionSheetComponent } from 'devextreme-angular';
import { Observable, combineLatest, map, takeUntil } from 'rxjs';
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

    combineLatest([this.identityService.userName$, this.identityService.allowedTenants$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([userName, allowedTenants]) => {

        const userMenuItems: Record<string, unknown>[] = [];
        
        if (userName) {
          userMenuItems.push({
            text: this.translationService.transform('session.refresh'),
            onClick: () => {
              this.accountMenu?.instance.hide();              
              this.identityService.refreshToken();
            }
          });

          userMenuItems.push({
            text: this.translationService.transform('session.manageaccount'),
            onClick: () => {
              this.accountMenu?.instance.hide();
              this.identityService.manageProfile();
            }
          });

          if (allowedTenants) {
            allowedTenants.forEach(t => userMenuItems.push({
              text: this.translationService.transform('session.switchtenant', { tenant: t.Name }),
              onClick: () => {
                this.accountMenu?.instance.hide();
                this.identityService.switchTenant(t.Id);
              }
            }));
          }

          userMenuItems.push({
            text: this.translationService.transform('session.logout', { user: userName }),
            onClick: () => {
              this.accountMenu?.instance.hide();
              this.identityService.logout();
            }
          });
        }
        
        this.userMenuItems = userMenuItems;        
      });


    this.usePopover$ = this.responsiveService.resize$
      .pipe(takeUntil(this.destroy$))
      .pipe(map((screenSize) => screenSize >= SCREEN_SIZE.SM));

    this.currentUser$ = this.identityService.currentUser$;
    this.username$ = this.identityService.userName$;
  }

  toggleShow(target?: Element): void {
    if (this.accountMenu?.visible) {
      this.accountMenu?.instance.hide();
    } else if (target) {      
      this.accountMenu?.instance.show();
    }
  }
}

