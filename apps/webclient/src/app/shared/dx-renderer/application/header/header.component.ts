import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AuthService, TenantService } from '@ballware/meta-services';
import { map, Observable, takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';
import { ApplicationAccountMenuComponent } from '../account/menu.component';

@Component({
  selector: 'ballware-application-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  providers: []
})
export class ApplicationHeaderComponent extends WithDestroy() {
  @ViewChild('accountMenu', { static: false }) accountMenu?: ApplicationAccountMenuComponent;

  @Output() menuToggle = new EventEmitter<boolean>();

  @Input() menuToggleEnabled = false;

  public title$: Observable<string|undefined>;
  public accountMenuVisible = false;
  public accountMenuTarget: Element|undefined = undefined;

  public sessionExpiration$: Observable<string|undefined>;

  constructor(private authService: AuthService, private tenantService: TenantService) {
    super();

    this.title$ = this.tenantService.title$;
    this.sessionExpiration$ = this.authService.accessTokenExpiresIn$
      .pipe(takeUntil(this.destroy$))
      .pipe(map((expiration) => expiration ? `${Math.ceil(expiration / 60).toString().padStart(2, '0')}:${Math.ceil(expiration % 60).toString().padStart(2, '0')}` : ''));
  }

  toggleMenu = () => {
    this.menuToggle.emit();
  }

  toggleAccountMenu = (e: { element: Element }) => {
    this.accountMenu?.toggleShow(e.element);
  }
}

