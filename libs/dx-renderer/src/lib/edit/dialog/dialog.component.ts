import { Component, Input, OnInit, Provider } from '@angular/core';
import { EditLayout } from '@ballware/meta-model';
import { EditModes, EditService, MetaService, MetaServiceFactory } from '@ballware/meta-services';
import { I18NextPipe } from 'angular-i18next';
import { WithDestroy } from '../../utils/withdestroy';

@Component({
  selector: 'ballware-crud-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  providers: [
    { 
      provide: EditService, 
      useFactory: (serviceFactory: MetaServiceFactory, metaService: MetaService) => serviceFactory.createEditService(metaService),
      deps: [MetaServiceFactory, MetaService]  
    } as Provider
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

  public onHidden() {
    this.cancel && this.cancel();
  }

  public onApply() {
    if (this.editService.validate()) {
      this.item && this.apply && this.apply(this.item);
    }
  }

}
