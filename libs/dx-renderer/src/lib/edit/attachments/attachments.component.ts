import { Component, Inject, OnDestroy, OnInit, Provider } from "@angular/core";
import { CrudItem, } from "@ballware/meta-model";
import { ATTACHMENT_SERVICE, ATTACHMENT_SERVICE_FACTORY, AttachmentRemoveDialog, AttachmentService, AttachmentServiceFactory, EDIT_SERVICE, EditService, Translator, TRANSLATOR } from "@ballware/meta-services";
import DataSource from "devextreme/data/data_source";
import { ColumnButton } from "devextreme/ui/data_grid";
import { nanoid } from "nanoid";
import { Observable, from, map, of, switchMap, takeUntil } from "rxjs";
import { createArrayDatasource } from "../../utils/datasource";
import { DxDataGridModule, DxFileUploaderModule, DxPopupModule } from "devextreme-angular";
import { CommonModule } from "@angular/common";
import { I18NextModule } from "angular-i18next";
import { Destroy, EditItemLivecycle, Readonly, Visible } from "@ballware/renderer-commons";

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
    imports: [CommonModule, I18NextModule, DxFileUploaderModule, DxDataGridModule, DxPopupModule],
    hostDirectives: [Destroy, { directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, Readonly, Visible],
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
        public destroy: Destroy,
        public livecycle: EditItemLivecycle,
        public readonly: Readonly,
        public visible: Visible,
    ) {
        this.onRemoveDialogApply = this.onRemoveDialogApply.bind(this);
        this.onRemoveDialogCancel = this.onRemoveDialogCancel.bind(this);

        this.fileUpload = this.fileUpload.bind(this);

        this.dataSource$ = this.attachmentService.items$            
            .pipe(takeUntil(this.destroy.destroy$))            
            .pipe(switchMap((fetchedItems) => fetchedItems ? from(createArrayDatasource(fetchedItems, 'Name')) : of(undefined)));

        this.optionButtons$ = this.readonly.readonly$
            .pipe(takeUntil(this.destroy.destroy$))
            .pipe(map((readonly) => [
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
            ]))
    }

    ngOnInit(): void {
        
        const identifier = nanoid(11);
              
        if (identifier) {
            this.attachmentService.setIdentifier(identifier);
        }
    
        this.editService.item$
            .pipe(takeUntil(this.destroy.destroy$))
            .subscribe((item) => {
                if (item) {
                    this.attachmentService.setOwner((item as CrudItem).Id);
                    this.attachmentService.fetch();
                } 
            });

        this.attachmentService.removeDialog$
            .pipe(takeUntil(this.destroy.destroy$))
            .subscribe((removeDialog) => {
                this.removeDialog = removeDialog;
            })
    }

    ngOnDestroy(): void {    
        this.attachmentService.ngOnDestroy();
    }

    fileOpen(file: Record<string, unknown>) {
        this.attachmentService.open(file['Name'] as string);
    }

    fileDelete(file: Record<string, unknown>) {
        this.attachmentService.remove(file['Name'] as string);
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

