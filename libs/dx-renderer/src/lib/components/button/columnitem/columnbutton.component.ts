import { CommonModule } from "@angular/common";
import {
  Component,
  inject,
  ViewChild,
} from '@angular/core';
import {
    DxButtonComponent, DxButtonModule, DxValidatorModule
} from 'devextreme-angular';
import {
  COLUMN_EDITOR_DELEGATE,
} from '../../../directives';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'ballware-column-button',
  templateUrl: './columnbutton.component.html',
  styleUrls: ['./columnbutton.component.scss'],
  imports: [CommonModule, DxButtonModule, DxValidatorModule],
})
export class ColumnButtonComponent {
  @ViewChild('element', { static: false }) element?: DxButtonComponent;

  readonly editing = inject(COLUMN_EDITOR_DELEGATE);

  readonly text$: Observable<string> = this.editing.preparedColumn$.pipe(
    map((column) => column?.hint ?? '')
  );

  readonly clicked = () =>
    this.editing.raiseEvent(this, 'click');

  readonly getOption = (option: string) =>
    this.element?.instance.option(option);
  readonly setOption = (option: string, value: unknown) =>
    this.element?.instance.option(option, value);
}
