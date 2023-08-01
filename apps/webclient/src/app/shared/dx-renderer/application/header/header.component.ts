import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { selectAccessTokenExpiration, selectTitle } from '@ballware/meta-services';
import { interval, map, Observable, takeUntil, takeWhile, withLatestFrom } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';
import { ApplicationAccountMenuComponent } from '../account/menu.component';
import { Store } from '@ngrx/store';

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

  constructor(private store: Store) {
    super();

    this.title$ = this.store.select(selectTitle);
    this.sessionExpiration$ = interval(1000).pipe(withLatestFrom(this.store.select(selectAccessTokenExpiration)))
      .pipe(takeWhile(([, accessTokenExpiration ]) => accessTokenExpiration ? (new Date() < accessTokenExpiration) : true))
      .pipe(map(([, accessTokenExpiration]) => accessTokenExpiration ? accessTokenExpiration.valueOf() - new Date().valueOf() : 0), map((milliseconds) => Math.ceil(milliseconds / 1000)))
      .pipe(map((expiration) => expiration ? `${Math.ceil(expiration / 60).toString().padStart(2, '0')}:${Math.ceil(expiration % 60).toString().padStart(2, '0')}` : ''));
  }

  toggleMenu = () => {
    this.menuToggle.emit();
  }

  toggleAccountMenu = (e: { element: Element }) => {
    this.accountMenu?.toggleShow(e.element);
  }
}

