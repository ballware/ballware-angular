import {
  Component,
  DestroyRef,
  Inject,
  OnDestroy,
  OnInit,
  Provider,
} from '@angular/core';
import { CrudItem, } from "@ballware/meta-model";
import { ATTACHMENT_SERVICE, ATTACHMENT_SERVICE_FACTORY, AttachmentRemoveDialog, AttachmentService, AttachmentServiceFactory, EDIT_SERVICE, EditService, Translator, TRANSLATOR } from "@ballware/meta-services";
import DataSource from "devextreme/data/data_source";
import { ColumnButton } from "devextreme/ui/data_grid";
import { Observable, from, map, of, switchMap, withLatestFrom } from "rxjs";
import { createArrayDatasource } from '../../utils';
import { DxDataGridModule, DxFileUploaderModule, DxPopupModule } from "devextreme-angular";
import { CommonModule } from "@angular/common";
import { I18NextModule } from "angular-i18next";
import {
  Breadcrumb,
  EditItemLivecycle,
  Readonly,
  Visible,
} from '@ballware/renderer-commons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'ballware-edit-attachments',
    templateUrl: './attachments.component.html',
    styleUrls: [],
    providers: [
        {
            provide: ATTACHMENT_SERVICE,
            useFactory: (serviceFactory: AttachmentServiceFactory) => serviceFactory(),
            deps: [ATTACHMENT_SERVICE_FACTORY]
        } as Provider,
    ],
    imports: [CommonModule, I18NextModule, DxFileUploaderModule, DxDataGridModule, DxPopupModule, Breadcrumb],
    hostDirectives: [{ directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, Readonly, Visible],
    standalone: true
  })
  export class EditLayoutAttachmentsComponent implements OnInit, OnDestroy {

    public removeDialog: AttachmentRemoveDialog|undefined;

    public dataSource$: Observable<DataSource|undefined>;
    public optionButtons$: Observable<Array<ColumnButton>|undefined>;

    constructor(
        @Inject(ATTACHMENT_SERVICE) private attachmentService: AttachmentService,
        @Inject(EDIT_SERVICE) private editService: EditService,
        @Inject(TRANSLATOR) private translator: Translator,
        private breadcrumb: Breadcrumb,
        public destroy: DestroyRef,
        public livecycle: EditItemLivecycle,
        public readonly: Readonly,
        public visible: Visible,
    ) {
        this.onRemoveDialogApply = this.onRemoveDialogApply.bind(this);
        this.onRemoveDialogCancel = this.onRemoveDialogCancel.bind(this);

        this.fileUpload = this.fileUpload.bind(this);

        this.dataSource$ = this.attachmentService.items$.pipe(
            takeUntilDestroyed(this.destroy),
            switchMap((fetchedItems) => fetchedItems ? from(createArrayDatasource(fetchedItems)) : of(undefined))
        );

        this.optionButtons$ = this.readonly.readonly$.pipe(
            takeUntilDestroyed(this.destroy),
            map((readonly) => [
                {
                    hint: this.translator('attachment.actions.view'),
                    icon: 'bi bi-eye-fill',
                    onClick: (e: any) => this.fileOpen(e.row.data),
                } as ColumnButton,
                {
                    hint: this.translator('attachment.actions.remove'),
                    icon: 'bi bi-trash-fill',
                    onClick: (e: any) => this.fileDelete(e.row.data),
                    visible: !readonly
                }
            ])
        )
    }

    ngOnInit(): void {

        this.breadcrumb.setIdentifier("attachments");

        this.attachmentService.setIdentifier(this.breadcrumb.pathString);

        this.editService.item$.pipe(
            takeUntilDestroyed(this.destroy),
            withLatestFrom(this.editService.entity$)
        ).subscribe(([item, entity]) => {
            if (item && entity) {
                this.attachmentService.setEntity(entity);
                this.attachmentService.setOwner((item as CrudItem).Id);
                this.attachmentService.fetch();
            }
        });

        this.attachmentService.removeDialog$.pipe(
            takeUntilDestroyed(this.destroy)
        ).subscribe((removeDialog) => {
            this.removeDialog = removeDialog;
        })
    }

    ngOnDestroy(): void {
        this.attachmentService.ngOnDestroy();
    }

    fileOpen(file: Record<string, unknown>) {
        this.attachmentService.open(file['Id'] as string);
    }

    fileDelete(file: Record<string, unknown>) {
        this.attachmentService.remove({ id: file['Id'] as string, filename: file['Name'] as string });
    }

    fileUpload(file: File) {
        this.attachmentService.upload(file);
    }

    public onRemoveDialogApply() {
        this.removeDialog?.apply(this.removeDialog.fileName);
    }

    public onRemoveDialogCancel() {
        this.removeDialog?.cancel();
    }
}

