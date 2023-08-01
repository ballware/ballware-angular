import { Component, ViewChild } from '@angular/core';
import { ResponsiveService, SCREEN_SIZE, identityManageProfile, identityRefreshToken, identityUserLogout, selectCurrentUser, selectUserName } from '@ballware/meta-services';
import { I18NextPipe } from 'angular-i18next';
import { DxActionSheetComponent } from 'devextreme-angular';
import { combineLatest, map, Observable, takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';
import { Store } from '@ngrx/store';

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

  constructor(private store: Store, private responsiveService: ResponsiveService, private translationService: I18NextPipe) {
    super();

    combineLatest([this.store.select(selectUserName)])
      .pipe(takeUntil(this.destroy$))
      .subscribe((userName) => {
        this.userMenuItems = userName ? [
          {
            text: this.translationService.transform('session.refresh'),
            onClick: () => {
              this.accountMenu?.instance.hide();
              this.store.dispatch(identityRefreshToken());
            }
          },
          {
            text: this.translationService.transform('session.manageaccount'),
            onClick: () => {
              this.accountMenu?.instance.hide();
              this.store.dispatch(identityManageProfile());
            }
          },
          {
            text: this.translationService.transform('session.logout', { user: userName }),
            onClick: () => {
              this.accountMenu?.instance.hide();
              this.store.dispatch(identityUserLogout());
            }
          }] : [

          ];
      });


    this.usePopover$ = this.responsiveService.onResize$
      .pipe(takeUntil(this.destroy$))
      .pipe(map((screenSize) => screenSize >= SCREEN_SIZE.SM));

    this.currentUser$ = this.store.select(selectCurrentUser);
    this.username$ = this.store.select(selectUserName);
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

