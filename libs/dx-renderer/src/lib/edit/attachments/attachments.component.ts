import { Component, Input, OnDestroy, OnInit, Provider } from "@angular/core";
import { CrudItem, EditLayoutItem } from "@ballware/meta-model";
import { AttachmentRemoveDialog, AttachmentService, EditItemRef, EditService, MetaServiceFactory } from "@ballware/meta-services";
import { I18NextPipe } from "angular-i18next";
import DataSource from "devextreme/data/data_source";
import { ColumnButton } from "devextreme/ui/data_grid";
import { nanoid } from "nanoid";
import { Observable, map, takeUntil } from "rxjs";
import { createArrayDatasource } from "../../utils/datasource";
import { WithDestroy } from "../../utils/withdestroy";
import { WithEditItemLifecycle } from "../../utils/withedititemlivecycle";
import { WithReadonly } from "../../utils/withreadonly";

@Component({
    selector: 'ballware-edit-attachments',
    templateUrl: './attachments.component.html',
    styleUrls: ['./attachments.component.scss'],
    providers: [
        { 
            provide: AttachmentService, 
            useFactory: (serviceFactory: MetaServiceFactory) => serviceFactory.createAttachmentService(),
            deps: [MetaServiceFactory]
        } as Provider,
    ]
  })
  export class EditLayoutAttachmentsComponent extends WithReadonly(WithEditItemLifecycle(WithDestroy())) implements OnInit, OnDestroy, EditItemRef {
    @Input() initialLayoutItem?: EditLayoutItem;

    public layoutItem: EditLayoutItem|undefined;

    public removeDialog: AttachmentRemoveDialog|undefined;

    public dataSource$: Observable<DataSource|undefined>;
    public optionButtons$: Observable<Array<ColumnButton>|undefined>;

    constructor(private attachmentService: AttachmentService, private editService: EditService, private translationService: I18NextPipe) {
        super();

        this.onRemoveDialogApply = this.onRemoveDialogApply.bind(this);
        this.onRemoveDialogCancel = this.onRemoveDialogCancel.bind(this);

        this.fileUpload = this.fileUpload.bind(this);

        this.dataSource$ = this.attachmentService.items$            
            .pipe(takeUntil(this.destroy$))            
            .pipe(map((fetchedItems) => fetchedItems ? createArrayDatasource(fetchedItems, 'Name') : undefined));

        this.optionButtons$ = this.readonly$
            .pipe(takeUntil(this.destroy$))
            .pipe(map((readonly) => [
                {
                    hint: this.translationService.transform('attachment.actions.view'),
                    icon: 'bi bi-eye-fill',
                    onClick: (e: any) => this.fileOpen(e.row.data),                                          
                } as ColumnButton,
                {
                    hint: this.translationService.transform('attachment.actions.remove'),
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


        if (this.initialLayoutItem) {
            this.initLifecycle(this.initialLayoutItem, this.editService, this);
      
            this.preparedLayoutItem$
              .pipe(takeUntil(this.destroy$))
              .subscribe((layoutItem) => {
                if (layoutItem) {
                  this.initReadonly(layoutItem, this.editService);
      
                  this.layoutItem = layoutItem;            
                }
              });
        }

        this.editService.item$
            .pipe(takeUntil(this.destroy$))
            .subscribe((item) => {
                if (item) {
                    this.attachmentService.setOwner((item as CrudItem).Id);
                    this.attachmentService.fetch();
                } 
            });

        this.attachmentService.removeDialog$
            .pipe(takeUntil(this.destroy$))
            .subscribe((removeDialog) => {
                this.removeDialog = removeDialog;
            })
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

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

    setOption(option: string, value: unknown): void {
        throw new Error("Method not implemented.");
    }

    getOption(option: string) {
        throw new Error("Method not implemented.");
    }
  }

