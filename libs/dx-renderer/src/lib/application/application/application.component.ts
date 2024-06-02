import { Component, HostBinding } from '@angular/core';
import { ResponsiveService } from '@ballware/common-services';
import { takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';

@Component({
  selector: 'ballware-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss'],
  providers: []
})
export class ApplicationComponent extends WithDestroy() {
  @HostBinding('class') classes = 'dx-viewport application container-fluid vh-100 vw-100 px-0 d-flex flex-column overflow-hidden';

  menuOpened = true;

  constructor(private responsiveService: ResponsiveService) {
    super();
    
    this.responsiveService.small$
      .pipe(takeUntil(this.destroy$))      
      .subscribe(small => this.menuOpened = !small);    
  }
}
