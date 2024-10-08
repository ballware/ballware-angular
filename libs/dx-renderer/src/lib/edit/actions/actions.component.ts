import { Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CRUD_SERVICE, CrudService, DetailColumnEditDialog, EditModes, ImportDialog, ItemEditDialog, ItemRemoveDialog, META_SERVICE, MetaService, RESPONSIVE_SERVICE, ResponsiveService, SCREEN_SIZE } from '@ballware/meta-services';
import { DxActionSheetComponent, DxActionSheetModule, DxFileUploaderModule, DxPopupModule } from 'devextreme-angular';
import { ItemClickEvent } from 'devextreme/ui/action_sheet';
import { BehaviorSubject, Observable, map, takeUntil, withLatestFrom } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';
import { CommonModule } from '@angular/common';
import { I18NextModule } from 'angular-i18next';
import { ForeignEditPopupComponent } from '../foreigneditpopup/foreigneditpopup.component';
import { CrudDialogComponent } from '../dialog/dialog.component';
import { EditLayoutComponent } from '../layout/layout.component';

@Component({
  selector: 'ballware-crud-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss'],
  imports: [CommonModule, I18NextModule, DxPopupModule, DxFileUploaderModule, DxActionSheetModule, ForeignEditPopupComponent, CrudDialogComponent, EditLayoutComponent],
  standalone: true
})
export class CrudActionsComponent extends WithDestroy() implements OnInit {

  @Input() defaultEditLayoutIdentifier!: string;

  @ViewChild('actionMenu', { static: false }) actionMenu?: DxActionSheetComponent;
  @ViewChild('printMenu', { static: false }) printMenu?: DxActionSheetComponent;
  @ViewChild('addMenu', { static: false }) addMenu?: DxActionSheetComponent;
  @ViewChild('exportMenu', { static: false }) exportMenu?: DxActionSheetComponent;
  @ViewChild('importMenu', { static: false }) importMenu?: DxActionSheetComponent;

  public actionMenuVisible$ = new BehaviorSubject<boolean>(false);

  public EditModes = EditModes;

  public itemDialog: ItemEditDialog|undefined;
  public removeDialog: ItemRemoveDialog|undefined;
  public importDialog: ImportDialog|undefined;

  public detailColumnEditDialog: DetailColumnEditDialog|undefined;

  public sanitizedExternalEditorUrl: SafeUrl|undefined;

  public displayName$: Observable<string|undefined>;

  public fullscreenDialogs$: Observable<boolean>;

  constructor(
      private domSanitizer: DomSanitizer, 
      @Inject(META_SERVICE) private metaService: MetaService, 
      @Inject(CRUD_SERVICE) private crudService: CrudService, 
      @Inject(RESPONSIVE_SERVICE) private responsiveService: ResponsiveService) {
    super();

    this.onRemoveDialogApply = this.onRemoveDialogApply.bind(this);
    this.onRemoveDialogCancel = this.onRemoveDialogCancel.bind(this);

    this.onImportDialogApply = this.onImportDialogApply.bind(this);
    this.onImportDialogCancel = this.onImportDialogCancel.bind(this);

    this.fullscreenDialogs$ = this.responsiveService.onResize$
      .pipe(takeUntil(this.destroy$))
      .pipe(map((screenSize) => screenSize <= SCREEN_SIZE.SM));

    this.displayName$ = this.metaService.displayName$.pipe(takeUntil(this.destroy$));

    this.crudService.itemDialog$
      .pipe(takeUntil(this.destroy$))
      .subscribe((itemDialog) => {
        this.itemDialog = itemDialog;
        this.sanitizedExternalEditorUrl = this.itemDialog?.externalEditor ? this.domSanitizer.bypassSecurityTrustResourceUrl((this.itemDialog.item as unknown) as string) : undefined;
      });

    this.crudService.removeDialog$
      .pipe(takeUntil(this.destroy$))
      .subscribe((removeDialog) => {
        this.removeDialog = removeDialog;
      });

    this.crudService.importDialog$
      .pipe(takeUntil(this.destroy$))
      .subscribe((importDialog) => {
        this.importDialog = importDialog;
      });

    this.crudService.detailColumnEditDialog$
      .pipe(takeUntil(this.destroy$))
      .subscribe((detailColumnEditDialog) => {
        this.detailColumnEditDialog = detailColumnEditDialog;
      });      
  }

  ngOnInit(): void {
    this.crudService.selectAddSheet$
      .pipe(takeUntil(this.destroy$))
      .pipe(withLatestFrom(this.crudService.currentInteractionTarget$))
      .subscribe(([addSheet, target]) => {
        if (addSheet) {
          this.addMenu?.instance.option('target', target);
          this.addMenu?.instance.option('dataSource', addSheet.actions);
          this.addMenu?.instance.option('visible', true);

          this.crudService.selectAddDone();
        }
      });

    this.crudService.selectPrintSheet$
      .pipe(takeUntil(this.destroy$))
      .pipe(withLatestFrom(this.crudService.currentInteractionTarget$))
      .subscribe(([printSheet, target]) => {
        if (printSheet) {
          this.printMenu?.instance.option('target', target);
          this.printMenu?.instance.option('dataSource', printSheet.actions);
          this.printMenu?.instance.option('visible', true);

          this.crudService.selectPrintDone();
        }
      });

    this.crudService.selectActionSheet$
      .pipe(takeUntil(this.destroy$))
      .pipe(withLatestFrom(this.crudService.currentInteractionTarget$))
      .subscribe(([actionSheet, target]) => {
        if (actionSheet) {
          this.actionMenu?.instance.option('target', target);
          this.actionMenu?.instance.option('dataSource', actionSheet.actions);
          this.actionMenu?.instance.option('visible', true);

          this.crudService.selectOptionsDone();
        }
      });

    this.crudService.selectExportSheet$
      .pipe(takeUntil(this.destroy$))
      .pipe(withLatestFrom(this.crudService.currentInteractionTarget$))
      .subscribe(([exportSheet, target]) => {
        if (exportSheet) {
          this.exportMenu?.instance.option('target', target);
          this.exportMenu?.instance.option('dataSource', exportSheet.actions);
          this.exportMenu?.instance.option('visible', true);

          this.crudService.selectExportDone();
        }
      });      

    this.crudService.selectImportSheet$
      .pipe(takeUntil(this.destroy$))
      .pipe(withLatestFrom(this.crudService.currentInteractionTarget$))
      .subscribe(([importSheet, target]) => {
        if (importSheet) {
          this.importMenu?.instance.option('target', target);
          this.importMenu?.instance.option('dataSource', importSheet.actions);
          this.importMenu?.instance.option('visible', true);

          this.crudService.selectImportDone();
        }
      });            
  }

  public actionItemClicked(e: ItemClickEvent) {
    e.itemData.execute(e.itemData.target);
  }

  public printMenuItemClicked(e: ItemClickEvent) {
    e.itemData.execute(e.itemData.target);
  }

  public addMenuItemClicked(e: ItemClickEvent) {
    e.itemData.execute(e.itemData.target);
  }

  public exportMenuItemClicked(e: ItemClickEvent) {
    e.itemData.execute(e.itemData.target);
  }

  public importMenuItemClicked(e: ItemClickEvent) {
    e.itemData.execute(e.itemData.target);
  }

  public onRemoveDialogApply() {
    this.removeDialog?.apply(this.removeDialog.item);
  }

  public onRemoveDialogCancel() {
    this.removeDialog?.cancel();
  }

  public onImportDialogApply(file: File) {
    this.importDialog?.apply(file);
  }

  public onImportDialogCancel() {
    this.importDialog?.cancel();
  }

  public onExternalEditorDialogClose() {
    this.itemDialog?.cancel();
  }

}
