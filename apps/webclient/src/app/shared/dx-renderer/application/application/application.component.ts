import { Component } from '@angular/core';
import { WithDestroy } from '../../utils/withdestroy';

@Component({
  selector: 'ballware-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.scss'],
  providers: []
})
export class ApplicationComponent extends WithDestroy() {
  menuOpened!: boolean;
}
