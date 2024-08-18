import { Component, Inject, ViewChild } from '@angular/core';
import { IDENTITY_SERVICE, IdentityService, RESPONSIVE_SERVICE, ResponsiveService, SCREEN_SIZE, Translator, TRANSLATOR } from '@ballware/meta-services';
import { DxContextMenuComponent, DxContextMenuModule } from 'devextreme-angular';
import { Observable, combineLatest, map, takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ballware-application-account-menu',
  templateUrl: './menu.component.html',
  styleUrls: [],
  imports: [CommonModule, DxContextMenuModule],
  standalone: true
})
export class ApplicationAccountMenuComponent extends WithDestroy() {

  @ViewChild('accountMenu', { static: false }) accountMenu?: DxContextMenuComponent;

  currentUser$: Observable<Record<string, unknown>|undefined>;
  username$: Observable<string|undefined>;
  usePopover$: Observable<boolean>;

  userMenuItems: Record<string, unknown>[] = [];

  constructor(
    @Inject(IDENTITY_SERVICE) private identityService: IdentityService, 
    @Inject(RESPONSIVE_SERVICE) private responsiveService: ResponsiveService, 
    @Inject(TRANSLATOR) private translator: Translator) {
    super();

    combineLatest([this.identityService.userName$, this.identityService.allowedTenants$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([userName, allowedTenants]) => {

        const userMenuItems: Record<string, unknown>[] = [];
        
        if (userName) {
          userMenuItems.push({
            text: this.translator('session.refresh'),
            onClick: () => {
              this.accountMenu?.instance.hide();              
              this.identityService.refreshToken();
            }
          });

          userMenuItems.push({
            text: this.translator('session.manageaccount'),
            onClick: () => {
              this.accountMenu?.instance.hide();
              this.identityService.manageProfile();
            }
          });

          if (allowedTenants) {
            allowedTenants.forEach(t => userMenuItems.push({
              text: this.translator('session.switchtenant', { tenant: t.Name }),
              onClick: () => {
                this.accountMenu?.instance.hide();
                this.identityService.switchTenant(t.Id);
              }
            }));
          }

          userMenuItems.push({
            text: this.translator('session.logout', { user: userName }),
            onClick: () => {
              this.accountMenu?.instance.hide();
              this.identityService.logout();
            }
          });
        }
        
        this.userMenuItems = userMenuItems;        
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
      this.accountMenu?.instance.show();
    }
  }
}

