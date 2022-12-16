import { Component, Input, NgModule, OnInit, Provider } from '@angular/core';
import { LookupService, CrudService, MetaService, AttachmentService, PageService, DefaultMetaService, DefaultCrudService, EditService, DefaultLookupService } from '@ballware/meta-services';
import { CrudContainerOptions, PageLayoutItem } from '@ballware/meta-model';
import { combineLatest, takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';
import { CommonModule } from '@angular/common';
import { PageModule } from '../page.module';
import { EditModule } from '../../edit/edit.module';

@Component({
  selector: 'ballware-page-crudcontainer',
  templateUrl: './crudcontainer.component.html',
  styleUrls: ['./crudcontainer.component.scss'],
  providers: [
    { provide: LookupService, useClass: DefaultLookupService } as Provider,
    { provide: MetaService, useClass: DefaultMetaService } as Provider,
    { provide: AttachmentService, useClass: AttachmentService } as Provider,
    { provide: CrudService, useClass: DefaultCrudService } as Provider,
    { provide: EditService, useClass: EditService } as Provider,
  ]
})
export class PageLayoutCrudcontainerComponent extends WithDestroy() implements OnInit {

  @Input() layoutItem?: PageLayoutItem;

  constructor(private pageService: PageService, private metaService: MetaService, private crudService: CrudService) {

    super();

    this.pageService.customParam$
      .pipe(takeUntil(this.destroy$))
      .subscribe((customParam) => {
        this.metaService.setInitialCustomParam(customParam);
      });

    this.pageService.headParams$
      .pipe(takeUntil(this.destroy$))
      .subscribe((headParams) => {
        if (headParams) {
          this.metaService.setHeadParams(headParams);
        }
      });

    combineLatest([this.metaService.headParams$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([
        fetchParams
      ]) => {
        if (fetchParams) {
          this.crudService.reload();
        }
      });
  }

  ngOnInit(): void {
    this.metaService.setEntity((this.layoutItem?.options?.itemoptions as CrudContainerOptions)?.entity);
    this.crudService.setQuery((this.layoutItem?.options?.itemoptions as CrudContainerOptions)?.query ?? 'primary');

    const storageIdentifier = (this.layoutItem?.options?.itemoptions as CrudContainerOptions)?.identifier;

    if (storageIdentifier) {
      this.crudService.setStorageIdentifier(storageIdentifier);
    }

  }
}

@NgModule({
  declarations: [PageLayoutCrudcontainerComponent],
  imports: [
    CommonModule,
    EditModule,
    PageModule
  ], exports: [
    PageLayoutCrudcontainerComponent
  ]
})
export class PageLayoutCrudcontainerModule {}
