import { Component, Input, OnDestroy, OnInit, Provider } from '@angular/core';
import { EditLayout } from '@ballware/meta-model';
import { EditModes, EditService, META_SERVICE, MetaService, ServiceFactory } from '@ballware/meta-services';
import { I18NextPipe } from 'angular-i18next';
import { nanoid } from 'nanoid';
import { Subject, takeUntil, withLatestFrom } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';

@Component({
  selector: 'ballware-crud-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  providers: [
    { 
      provide: EditService, 
      useFactory: (serviceFactory: ServiceFactory, metaService: MetaService) => serviceFactory.createEditService(metaService),
      deps: [ServiceFactory, META_SERVICE]  
    } as Provider
  ]
})
export class CrudDialogComponent extends WithDestroy() implements OnInit, OnDestroy {

  @Input() mode?: EditModes;
  @Input() title?: string;
  @Input() item?: unknown;
  @Input() editLayout!: EditLayout;
  @Input() fullscreen!: boolean;
  @Input() apply?: (item: Record<string, unknown>) => void;
  @Input() cancel?: () => void;

  public EditModes = EditModes;

  private apply$ = new Subject<void>();

  constructor(
    private translationService: I18NextPipe,
    private editService: EditService) {

    super();

    this.onHidden = this.onHidden.bind(this);
    this.onApply = this.onApply.bind(this);

    this.apply$
      .pipe(takeUntil(this.destroy$))
      .pipe(withLatestFrom(this.editService.validator$, this.editService.item$))
      .subscribe(([, validator, item]) => {
        if (item && (!validator || validator())) {
          this.apply && this.apply(item as Record<string, unknown>);
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
    this.apply$.next();
  }

}
