import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { CrudService, EditModes, ItemEditDialog, ItemRemoveDialog, MetaService, ResponsiveService, SCREEN_SIZE } from '@ballware/meta-services';
import { DxActionSheetComponent } from 'devextreme-angular';
import { ItemClickEvent } from 'devextreme/ui/action_sheet';
import { Observable, map, takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';

@Component({
  selector: 'ballware-crud-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.scss']
})
export class CrudActionsComponent extends WithDestroy() implements OnInit {

  @Input() defaultEditLayoutIdentifier!: string;

  @ViewChild('actionMenu', { static: false }) actionMenu?: DxActionSheetComponent;
  @ViewChild('printMenu', { static: false }) printMenu?: DxActionSheetComponent;
  @ViewChild('addMenu', { static: false }) addMenu?: DxActionSheetComponent;
  @ViewChild('exportMenu', { static: false }) exportMenu?: DxActionSheetComponent;
  @ViewChild('importMenu', { static: false }) importMenu?: DxActionSheetComponent;

  public EditModes = EditModes;

  public itemDialog: ItemEditDialog|undefined;
  public removeDialog: ItemRemoveDialog|undefined;

  public displayName$: Observable<string|undefined>;

  public usePopover$: Observable<boolean>;

  constructor(private metaService: MetaService, private crudService: CrudService, private responsiveService: ResponsiveService) {
    super();

    this.onRemoveDialogApply = this.onRemoveDialogApply.bind(this);
    this.onRemoveDialogCancel = this.onRemoveDialogCancel.bind(this);

    this.usePopover$ = this.responsiveService.onResize$
      .pipe(takeUntil(this.destroy$))
      .pipe(map((screenSize) => screenSize >= SCREEN_SIZE.SM));

    this.displayName$ = this.metaService.displayName$.pipe(takeUntil(this.destroy$));

    this.crudService.itemDialog$
      .pipe(takeUntil(this.destroy$))
      .subscribe((itemDialog) => {
        this.itemDialog = itemDialog;
      });

    this.crudService.removeDialog$
      .pipe(takeUntil(this.destroy$))
      .subscribe((removeDialog) => {
        this.removeDialog = removeDialog;
      });
  }

  ngOnInit(): void {
    this.crudService.selectAddSheet$
      .pipe(takeUntil(this.destroy$))
      .subscribe((addSheet) => {
        if (addSheet) {
          console.log('Activating add sheet');
          console.log(addSheet);
          this.addMenu?.instance.option('target', addSheet.target);
          this.addMenu?.instance.option('dataSource', addSheet.actions);
          this.addMenu?.instance.option('visible', true);
        }
      });

    this.crudService.selectPrintSheet$
      .pipe(takeUntil(this.destroy$))
      .subscribe((printSheet) => {
        if (printSheet) {
          console.log('Activating print sheet');
          console.log(printSheet);
          this.printMenu?.instance.option('target', printSheet.target);
          this.printMenu?.instance.option('dataSource', printSheet.actions);
          this.printMenu?.instance.option('visible', true);
        }
      });

    this.crudService.selectActionSheet$
      .pipe(takeUntil(this.destroy$))
      .subscribe((actionSheet) => {
        if (actionSheet) {
          console.log('Activating action sheet');
          console.log(actionSheet);
          this.actionMenu?.instance.option('target', actionSheet.target);
          this.actionMenu?.instance.option('dataSource', actionSheet.actions);
          this.actionMenu?.instance.option('visible', true);
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

}
