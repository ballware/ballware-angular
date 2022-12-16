import { Component, EventEmitter, Input, Output } from '@angular/core';
import { WithDestroy } from '../../utils/withdestroy';

@Component({
  selector: 'ballware-application-navigation-drawer',
  templateUrl: './drawer.component.html',
  styleUrls: ['./drawer.component.scss'],
  providers: []
})
export class ApplicationNavigationDrawerComponent extends WithDestroy() {
  @Input() opened!: boolean;

  @Output() openedChange = new EventEmitter<boolean>();
}

