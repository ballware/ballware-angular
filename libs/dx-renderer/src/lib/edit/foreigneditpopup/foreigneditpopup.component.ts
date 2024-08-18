import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, Provider } from "@angular/core";
import { CrudItem } from "@ballware/meta-model";
import { CRUD_SERVICE, CRUD_SERVICE_FACTORY, CrudService, CrudServiceFactory, ItemEditDialog, LOOKUP_SERVICE, LOOKUP_SERVICE_FACTORY, LookupService, LookupServiceFactory, META_SERVICE, META_SERVICE_FACTORY, MetaService, MetaServiceFactory } from "@ballware/meta-services";
import { combineLatest, takeUntil } from "rxjs";
import { WithDestroy } from "../../utils/withdestroy";
import { Router } from "@angular/router";
import { EditLayoutComponent } from "../layout/layout.component";
import { CommonModule } from "@angular/common";
import { CrudDialogComponent } from "../dialog/dialog.component";

@Component({
    selector: 'ballware-crud-foreigneditpopup',
    templateUrl: './foreigneditpopup.component.html',
    styleUrls: ['./foreigneditpopup.component.scss'],
    providers: [    
        { 
          provide: LOOKUP_SERVICE, 
          useFactory: (serviceFactory: LookupServiceFactory) => serviceFactory(),
          deps: [LOOKUP_SERVICE_FACTORY]  
        } as Provider,
        { 
          provide: META_SERVICE, 
          useFactory: (serviceFactory: MetaServiceFactory, lookupService: LookupService) => serviceFactory(lookupService),
          deps: [META_SERVICE_FACTORY, LOOKUP_SERVICE]  
        } as Provider,
        { 
          provide: CRUD_SERVICE, 
          useFactory: (serviceFactory: CrudServiceFactory, router: Router, metaService: MetaService) => serviceFactory(router, metaService),
          deps: [CRUD_SERVICE_FACTORY, Router, META_SERVICE]  
        } as Provider,       
      ],
      imports: [CommonModule, CrudDialogComponent, EditLayoutComponent],
      standalone: true
})
export class ForeignEditPopupComponent extends WithDestroy() implements OnInit, OnDestroy {

    @Input() fullscreen!: boolean;
    @Input() customFunctionEntity!: string;
    @Input() customFunctionId!: string;
    @Input() customFunctionParam!: unknown;
    
    @Output() editFinished = new EventEmitter<void>();

    public itemDialog: ItemEditDialog|undefined;

    constructor(
        @Inject(LOOKUP_SERVICE) private lookupService: LookupService, 
        @Inject(META_SERVICE) private metaService: MetaService, 
        @Inject(CRUD_SERVICE) private crudService: CrudService) {
        super();
        
        this.crudService.itemDialog$
            .pipe(takeUntil(this.destroy$))
            .subscribe((itemDialog) => {
                this.itemDialog = itemDialog;              

                if (!itemDialog) {
                    this.editFinished.emit();
                }
            });            
    }

    ngOnInit(): void {
        if (this.customFunctionEntity && this.customFunctionId && this.customFunctionParam) {
            this.metaService.setEntity(this.customFunctionEntity);
            this.metaService.setReadOnly(false);
            this.metaService.setHeadParams({});
            this.metaService.setInitialCustomParam({});

            combineLatest([this.metaService.customFunctions$, this.metaService.customFunctionAllowed$])
                .pipe(takeUntil(this.destroy$))
                .subscribe(([customFunctions, customFunctionAllowed]) => {
                    if (customFunctions && customFunctionAllowed) {
                        const currentFunction = customFunctions.find(f => f.id === this.customFunctionId);

                        if (currentFunction) {
                            this.crudService.customEdit({ customFunction: currentFunction, items: this.customFunctionParam as CrudItem[] });
                        }
                    }
                });
        }        
    }

    override ngOnDestroy(): void {
        super.ngOnDestroy();

        this.crudService.ngOnDestroy();
        this.metaService.ngOnDestroy();
        this.lookupService.ngOnDestroy();
    }
}