import {
  Component,
  HostBinding,
  Inject,
  Input,
  OnChanges,
  OnDestroy, OnInit,
  Optional,
  Provider,
  SimpleChanges, SkipSelf
} from '@angular/core';
import {
  CRUD_OPERATOR, CRUD_OPERATOR_FACTORY,
  CRUD_SERVICE, CRUD_SERVICE_FACTORY, CrudOperator, CrudOperatorFactory, CrudService, CrudServiceFactory,
  EditModes,
  LOOKUP_SERVICE,
  LOOKUP_SERVICE_FACTORY,
  LookupService,
  LookupServiceFactory, META_SERVICE, META_SERVICE_FACTORY, MetaService, MetaServiceFactory,
  PAGE_SERVICE,
  PAGE_SERVICE_FACTORY,
  PageService,
  PageServiceFactory,
  RESPONSIVE_SERVICE,
  ResponsiveService,
  SCREEN_SIZE
} from '@ballware/meta-services';
import { Observable, map, takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CRUD_OVERLAY_OPERATOR } from '../../edit/operators';
import { nanoid } from 'nanoid';

@Component({
  selector: 'ballware-entity',
  templateUrl: './entity.component.html',
  styleUrls: ['./entity.component.scss'],
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
    {
      provide: CRUD_OPERATOR,
      useFactory: (crudOperatorFactory: CrudOperatorFactory, router: Router, crudService: CrudService, parentOperator?: CrudOperator) => crudOperatorFactory(router, crudService, parentOperator),
      deps: [CRUD_OPERATOR_FACTORY, Router, CRUD_SERVICE, [new Optional(), new SkipSelf(), CRUD_OPERATOR]]
    },
    {
      provide: CRUD_OVERLAY_OPERATOR,
      useFactory: (operator: CrudOperator) => operator.kind === 'overlay' ? operator : undefined,
      deps: [CRUD_OPERATOR]
    },
  ],
  imports: [CommonModule],
  standalone: true
})
export class EntityComponent extends WithDestroy() implements OnInit, OnDestroy, OnChanges {
  @HostBinding('class') classes = 'h-100 p-2 mw-100 container-fluid shadow bg-white rounded d-flex flex-column overflow-hidden';

  @Input() entity!: string;
  @Input() query!: string;
  @Input() mode!: EditModes;
  @Input() editLayout!: string;
  @Input() id!: string;

  constructor(
    @Inject(LOOKUP_SERVICE) private lookupService: LookupService,
    @Inject(META_SERVICE) private metaService: MetaService,
    @Inject(CRUD_SERVICE) private crudService: CrudService,
    @Inject(CRUD_OPERATOR) private crudOperator: CrudOperator,
  ) {
    super();

    this.metaService.entityMetadata$
      .pipe(takeUntil(this.destroy$))
      .subscribe(em => {
        if (em) {
          switch (this.mode) {
            case EditModes.CREATE:
              this.crudService.create({ editLayout: this.editLayout });
              break;
            case EditModes.VIEW:
              this.crudService.view({ item: { Id: this.id }, editLayout: this.editLayout });
              break;
            case EditModes.EDIT:
              this.crudService.edit({ item: { Id: this.id }, editLayout: this.editLayout });
              break;
          }
        }
      });
  }

  ngOnInit(): void {
    const identifier = nanoid(11);

    this.lookupService.setIdentifier(identifier);
    this.metaService.setIdentifier(identifier);
    this.crudService.setIdentifier(identifier);

    this.metaService.setInitialCustomParam({});

    this.metaService.setEntity(this.entity);
    this.crudService.setQuery(this.query);

    this.metaService.setHeadParams({});
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['entity']) {
    }

    if (changes['query']) {
    }

    if (changes['mode']) {
    }

    if (changes['id']) {
    }
  }

}
