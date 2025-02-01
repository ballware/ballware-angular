import { Component, Inject, Input, OnDestroy, OnInit, Provider } from '@angular/core';
import { EditLayout, EditUtil } from '@ballware/meta-model';
import { EDIT_SERVICE, EDIT_SERVICE_FACTORY, EditModes, EditService, EditServiceFactory, META_SERVICE, MetaService, Translator, TRANSLATOR } from '@ballware/meta-services';
import { nanoid } from 'nanoid';
import { Subject, takeUntil, withLatestFrom } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';
import { DxPopupModule } from 'devextreme-angular';
import { CommonModule } from '@angular/common';

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
  standalone: true
})
export class CrudDialogComponent extends WithDestroy() implements OnInit, OnDestroy {

  @Input() mode?: EditModes;
  @Input() title?: string;
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
    @Inject(TRANSLATOR) private translator: Translator,
    @Inject(EDIT_SERVICE) private editService: EditService) {

    super();

    this.onHidden = this.onHidden.bind(this);
    this.onApplyAndContinue = this.onApplyAndContinue.bind(this);
    this.onApplyAndClose = this.onApplyAndClose.bind(this);

    this.applyAndContinue$
      .pipe(takeUntil(this.destroy$))
      .pipe(withLatestFrom(this.editService.validator$, this.editService.item$))
      .subscribe(([, validator, item]) => {
        if (item && (!validator || validator())) {
          this.apply && this.apply(this.editService.editUtil(), item as Record<string, unknown>, true);
        }
      });

    this.applyAndClose$
      .pipe(takeUntil(this.destroy$))
      .pipe(withLatestFrom(this.editService.validator$, this.editService.item$))
      .subscribe(([, validator, item]) => {
        if (item && (!validator || validator())) {
          this.apply && this.apply(this.editService.editUtil(), item, false);
        }
      });      
  }

  ngOnInit(): void {
      if (this.mode && this.item && this.editLayout) {
        this.editService.setIdentifier(nanoid(11));
        this.editService.setMode(this.mode);
        this.editService.setItem(this.item as Record<string, unknown>);
        this.editService.setEditLayout(this.editLayout);
      }
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    
    this.editService.ngOnDestroy();
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
