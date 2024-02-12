import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { ResponsiveService, SCREEN_SIZE } from '@ballware/meta-services';
import { OpenedStateMode } from 'devextreme/ui/drawer';
import { Observable, map, takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';

@Component({
  selector: 'ballware-application-navigation-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss'],
  providers: []
})
export class ApplicationNavigationDrawerComponent extends WithDestroy() {
  @HostBinding('class') classes = 'flex-fill overflow-hidden pt-2';

  @Input() opened!: boolean;

  @Output() openedChange = new EventEmitter<boolean>();

  openStateMode$: Observable<OpenedStateMode>;

  constructor(private responsiveService: ResponsiveService) {
    super();

    this.openStateMode$ = this.responsiveService.onResize$
      .pipe(takeUntil(this.destroy$))
      .pipe(map((screenSize) => screenSize > SCREEN_SIZE.SM ? 'shrink' : 'overlap'));
  }

  hideNavigation() {
    this.openedChange.emit(false); 
  }
}

