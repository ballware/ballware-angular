import {
  Component,
  DestroyRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  Provider,
} from '@angular/core';
import { CrudItem } from "@ballware/meta-model";
import { CRUD_SERVICE, CRUD_SERVICE_FACTORY, CrudService, CrudServiceFactory, ItemEditDialog, LOOKUP_SERVICE, LOOKUP_SERVICE_FACTORY, LookupService, LookupServiceFactory, META_SERVICE, META_SERVICE_FACTORY, MetaService, MetaServiceFactory } from "@ballware/meta-services";
import { combineLatest } from "rxjs";
import { Router } from "@angular/router";
import { EditLayoutComponent } from "../../layout";
import { CommonModule } from "@angular/common";
import { CrudEditPopupComponent } from "../editpopup/editpopup.component";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
    imports: [CommonModule, CrudEditPopupComponent, EditLayoutComponent]
})
export class CrudForeignEditPopupComponent implements OnInit {

    @Input() fullscreen!: boolean;
    @Input() customFunctionEntity!: string;
    @Input() customFunctionId!: string;
    @Input() customFunctionParam!: unknown;

    @Output() editFinished = new EventEmitter<void>();

    public itemDialog: ItemEditDialog|undefined;

    constructor(
        private readonly destroy: DestroyRef,
        @Inject(META_SERVICE) private readonly metaService: MetaService,
        @Inject(CRUD_SERVICE) private readonly crudService: CrudService) {

        this.crudService.itemDialog$.pipe(
          takeUntilDestroyed(this.destroy)
        ).subscribe((itemDialog) => {
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

            combineLatest([this.metaService.customFunctions$, this.metaService.customFunctionAllowed$]).pipe(
              takeUntilDestroyed(this.destroy)
            ).subscribe(([customFunctions, customFunctionAllowed]) => {
                if (customFunctions && customFunctionAllowed) {
                    const currentFunction = customFunctions.find(f => f.id === this.customFunctionId);

                    if (currentFunction) {
                        this.crudService.customEdit({ customFunction: currentFunction, items: this.customFunctionParam as CrudItem[] });
                    }
                }
            });
        }
    }
}
