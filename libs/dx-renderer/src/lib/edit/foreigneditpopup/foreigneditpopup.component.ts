import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Optional, Output, Provider, SkipSelf } from "@angular/core";
import { CrudItem, EditUtil } from '@ballware/meta-model';
import {
  CRUD_OPERATOR, CRUD_OPERATOR_FACTORY,
  CRUD_SERVICE,
  CRUD_SERVICE_FACTORY, CrudOperator, CrudOperatorFactory,
  CrudService,
  CrudServiceFactory,
  ItemEditDialog,
  LOOKUP_SERVICE,
  LOOKUP_SERVICE_FACTORY,
  LookupService,
  LookupServiceFactory,
  META_SERVICE,
  META_SERVICE_FACTORY,
  MetaService,
  MetaServiceFactory
} from '@ballware/meta-services';
import { combineLatest, takeUntil } from "rxjs";
import { WithDestroy } from "../../utils/withdestroy";
import { Router } from "@angular/router";
import { EditLayoutComponent } from "../layout/layout.component";
import { CommonModule } from "@angular/common";
import { CrudDialogComponent } from "../dialog/dialog.component";
import { CRUD_OVERLAY_OPERATOR } from '../operators';

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
          provide: CRUD_OPERATOR,
          useFactory: (crudOperatorFactory: CrudOperatorFactory, router: Router, parentOperator?: CrudOperator) => crudOperatorFactory(router, parentOperator),
          deps: [CRUD_OPERATOR_FACTORY, Router, [new Optional(), new SkipSelf(), CRUD_OPERATOR]]
        },
        {
          provide: CRUD_OVERLAY_OPERATOR,
          useFactory: (operator: CrudOperator) => operator.kind === 'overlay' ? operator : undefined,
          deps: [CRUD_OPERATOR]
        },
        {
          provide: CRUD_SERVICE,
          useFactory: (serviceFactory: CrudServiceFactory, router: Router, metaService: MetaService, crudOperator: CrudOperator) => serviceFactory(router, metaService, crudOperator),
          deps: [CRUD_SERVICE_FACTORY, Router, META_SERVICE, CRUD_OPERATOR]
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

    readonly cancelEdit = () => this.crudService.cancelEdit();
    readonly applyEdit = (editUtil: EditUtil, item: Record<string, unknown>, continueAfterSave: boolean) => this.crudService.applyEdit({
      editUtil,
      item,
      continueAfterSave,
      customFunction: this.itemDialog?.customFunction
    });

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
