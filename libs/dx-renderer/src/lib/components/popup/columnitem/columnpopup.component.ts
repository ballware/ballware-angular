import { CommonModule } from "@angular/common";
import { Component, inject } from '@angular/core';
import {
  COLUMN_EDITOR_DELEGATE,
} from '../../../directives';
import { DxButtonModule } from 'devextreme-angular';
import { I18NextPipe } from 'angular-i18next';

@Component({
  selector: 'ballware-column-popup',
  templateUrl: './columnpopup.component.html',
  styleUrls: ['./columnpopup.component.scss'],
  imports: [
    CommonModule,
    DxButtonModule,
    I18NextPipe,
  ],
})
export class ColumnPopupComponent {

  readonly editing = inject(COLUMN_EDITOR_DELEGATE);

  openColumnPopup: () => void = () => this.editing.openColumnPopup()
}
