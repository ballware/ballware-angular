import { Component, Input, OnInit, Provider } from '@angular/core';
import { I18NextPipe } from 'angular-i18next';
import { EditLayout } from '@ballware/meta-model';
import { EditService, EditModes } from '@ballware/meta-services';
import { WithDestroy } from '../../utils/withdestroy';

@Component({
  selector: 'ballware-crud-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  providers: [
    { provide: EditService, useClass: EditService } as Provider
  ]
})
export class CrudDialogComponent extends WithDestroy() implements OnInit {

  @Input() mode?: EditModes;
  @Input() title?: string;
  @Input() item?: Record<string, unknown>;
  @Input() editLayout?: EditLayout;
  @Input() apply?: (item: Record<string, unknown>) => void;
  @Input() cancel?: () => void;

  public EditModes = EditModes;

  constructor(
    private translationService: I18NextPipe,
    private editService: EditService) {

    super();

    this.onHidden = this.onHidden.bind(this);
    this.onApply = this.onApply.bind(this);
  }

  ngOnInit(): void {
      if (this.mode && this.item && this.editLayout) {
        this.editService.setMode(this.mode);
        this.editService.setItem(this.item);
        this.editService.setEditLayout(this.editLayout);
      }
  }

  public get applyText(): string {
    return this.translationService.transform('editing.actions.apply');
  }

  public get cancelText(): string {
    return this.translationService.transform('editing.actions.cancel');
  }

  public get closeText(): string {
    return this.translationService.transform('editing.actions.close');
  }

  public onHidden(e: {}) {
    this.cancel && this.cancel();
  }

  public onApply(e: {}) {
    if (this.editService.validate()) {
      this.item && this.apply && this.apply(this.item);
    }
  }

}
