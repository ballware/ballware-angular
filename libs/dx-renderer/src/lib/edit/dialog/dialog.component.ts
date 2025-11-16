import {
  Component,
  DestroyRef,
  Inject,
  Input,
  OnInit,
  Provider,
} from '@angular/core';
import { EditLayout, EditUtil } from '@ballware/meta-model';
import { EDIT_SERVICE, EDIT_SERVICE_FACTORY, EditModes, EditService, EditServiceFactory, META_SERVICE, MetaService, Translator, TRANSLATOR } from '@ballware/meta-services';
import { Subject, withLatestFrom } from 'rxjs';
import { DxPopupModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';
import { Breadcrumb } from '@ballware/renderer-commons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ballware-crud-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  providers: [
    {
      provide: EDIT_SERVICE,
      useFactory: (serviceFactory: EditServiceFactory, metaService: MetaService) => serviceFactory(metaService),
      deps: [EDIT_SERVICE_FACTORY, META_SERVICE]
    } as Provider
  ],
  imports: [CommonModule, DxPopupModule],
  hostDirectives: [Breadcrumb],
  standalone: true
})
export class CrudDialogComponent implements OnInit {

  @Input() mode?: EditModes;
  @Input() title?: string;
  @Input() entity?: string;
  @Input() item?: unknown;
  @Input() editLayout!: EditLayout;
  @Input() fullscreen!: boolean;
  @Input() supportContinueAfterSave!: boolean;
  @Input() apply?: (editUtil: EditUtil, item: Record<string, unknown>, continueAfterSave: boolean) => void;
  @Input() cancel?: () => void;

  public EditModes = EditModes;

  private readonly applyAndContinue$ = new Subject<void>();
  private readonly applyAndClose$ = new Subject<void>();

  constructor(
    private destroy: DestroyRef,
    @Inject(TRANSLATOR) private translator: Translator,
    @Inject(EDIT_SERVICE) private editService: EditService,
    private breadcrumb: Breadcrumb) {

    this.onHidden = this.onHidden.bind(this);
    this.onApplyAndContinue = this.onApplyAndContinue.bind(this);
    this.onApplyAndClose = this.onApplyAndClose.bind(this);

    this.applyAndContinue$.pipe(
      takeUntilDestroyed(this.destroy),
      withLatestFrom(this.editService.validator$, this.editService.item$)
    ).subscribe(([, validator, item]) => {
      if (item && (!validator || validator())) {
        this.apply && this.apply(this.editService.editUtil(), item as Record<string, unknown>, true);
      }
    });

    this.applyAndClose$.pipe(
      takeUntilDestroyed(this.destroy),
      withLatestFrom(this.editService.validator$, this.editService.item$)
    ).subscribe(([, validator, item]) => {
      if (item) {
        if (!validator) {
          this.apply && this.apply(this.editService.editUtil(), item, false);
        } else {
          validator().subscribe((isValid) => {
            if (isValid) {
              this.apply && this.apply(this.editService.editUtil(), item, false);
            }
          });
        }
      }
    });
  }

  ngOnInit(): void {
      if (this.mode && this.entity && this.item && this.editLayout) {
        this.breadcrumb.setIdentifier("dialog")
        this.editService.setIdentifier(this.breadcrumb.pathString);
        this.editService.setMode(this.mode);
        this.editService.setEntity(this.entity);
        this.editService.setItem(this.item as Record<string, unknown>);
        this.editService.setEditLayout(this.editLayout);

        if (this.apply) {
          this.editService.setApply(this.apply)
        }

        if (this.cancel) {
          this.editService.setCancel(this.cancel);
        }
      }
  }

  public get applyAndCloseText(): string {
    return this.translator('editing.actions.applyclose');
  }

  public get applyAndContinueText(): string {
    return this.translator('editing.actions.applycontinue');
  }

  public get cancelText(): string {
    return this.translator('editing.actions.cancel');
  }

  public get closeText(): string {
    return this.translator('editing.actions.close');
  }

  public onHidden() {
    this.cancel && this.cancel();
  }

  public onApplyAndClose() {
    this.applyAndClose$.next();
  }

  public onApplyAndContinue() {
    this.applyAndContinue$.next();
  }

}
