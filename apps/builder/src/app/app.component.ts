import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppbarComponent, NavigationComponent } from '@ballware/dx-builder';
import { BallwareNotificationComponent, BallwareResponsiveDetectorComponent } from '@ballware/dx-commons';
import { NxWelcomeComponent } from './nx-welcome.component';

@Component({
  standalone: true,
  imports: [NxWelcomeComponent, RouterModule, AppbarComponent, NavigationComponent, BallwareResponsiveDetectorComponent, BallwareNotificationComponent ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'builder';

  public menuOpened = false;

  onMenuToggled() {
    this.menuOpened = !this.menuOpened;
  }
}
