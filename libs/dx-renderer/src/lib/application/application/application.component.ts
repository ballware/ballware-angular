import { Component, HostBinding, Inject } from '@angular/core';
import { RESPONSIVE_SERVICE, ResponsiveService, SCREEN_SIZE } from '@ballware/meta-services';
import { map, takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';
import { ApplicationHeaderComponent } from '../header/header.component';
import { ApplicationNotificationComponent } from '../notification/notification.component';
import { ApplicationNavigationDrawerComponent } from '../navigation/drawer.component';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ballware-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss'],
  imports: [CommonModule, RouterOutlet, ApplicationHeaderComponent, ApplicationNotificationComponent, ApplicationNavigationDrawerComponent],
  standalone: true
})
export class ApplicationComponent extends WithDestroy() {
  @HostBinding('class') classes = 'dx-viewport application container-fluid vh-100 vw-100 px-0 d-flex flex-column overflow-hidden';

  menuOpened = true;

  constructor(@Inject(RESPONSIVE_SERVICE) private responsiveService: ResponsiveService) {
    super();
    
    this.responsiveService.onResize$
      .pipe(takeUntil(this.destroy$))
      .pipe(map((screenSize) => screenSize > SCREEN_SIZE.SM ? true : false))
      .subscribe(opened => this.menuOpened = opened);    
  }
}
