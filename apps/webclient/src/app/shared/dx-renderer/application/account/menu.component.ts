import { Component, ViewChild } from '@angular/core';
import { AuthService, ResponsiveService, SCREEN_SIZE } from '@ballware/meta-services';
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

  constructor(private responsiveService: ResponsiveService, private translationService: I18NextPipe, private authService: AuthService) {
    super();

    combineLatest([this.authService.userName$])
      .pipe(takeUntil(this.destroy$))
      .subscribe((userName) => {
        this.userMenuItems = userName ? [
          {
            text: this.translationService.transform('session.refresh'),
            onClick: () => {
              this.accountMenu?.instance.hide();
              this.authService.refreshToken();
            }
          },
          {
            text: this.translationService.transform('session.manageaccount'),
            onClick: () => {
              this.accountMenu?.instance.hide();
              this.authService.manageProfile();
            }
          },
          {
            text: this.translationService.transform('session.logout', { user: userName }),
            onClick: () => {
              this.accountMenu?.instance.hide();
              this.authService.logout();
            }
          }] : [

          ];
      });


    this.usePopover$ = this.responsiveService.onResize$
      .pipe(takeUntil(this.destroy$))
      .pipe(map((screenSize) => screenSize >= SCREEN_SIZE.SM));

    this.currentUser$ = this.authService.currentUser$;

    this.username$ = this.currentUser$
      .pipe(takeUntil(this.destroy$))
      .pipe(map((user) => user ? user['preferred_username'] as string : undefined));
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

