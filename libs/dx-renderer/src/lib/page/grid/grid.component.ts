import { Component, DestroyRef, Inject, Input, OnInit } from '@angular/core';
import { EntityGridOptions, GridLayout, PageLayoutItem } from '@ballware/meta-model';
import { MasterdetailService, META_SERVICE, MetaService } from '@ballware/meta-services';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { EditDetailComponent } from '../../edit';
import { CommonModule } from '@angular/common';
import { EntitygridComponent } from '../../datacontainer';
import { Breadcrumb } from '@ballware/renderer-commons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'ballware-page-grid',
    templateUrl: './grid.component.html',
    styleUrls: ['./grid.component.scss'],
    providers: [
        {
            provide: MasterdetailService, useClass: MasterdetailService
        }
    ],
    imports: [CommonModule, EntitygridComponent, EditDetailComponent],
    hostDirectives: [Breadcrumb]
})
export class PageLayoutGridComponent implements OnInit {

  @Input() layoutItem?: PageLayoutItem;

  private _storageIdentifier$ = new BehaviorSubject<string|undefined>(undefined);
  private _layoutIdentifier$ = new BehaviorSubject<string|undefined>(undefined);
  private _height$ = new BehaviorSubject<string|undefined>('100%');

  public get storageIdentifier$(): Observable<string|undefined> {
    return this._storageIdentifier$;
  }

  public get height$(): Observable<string|undefined> {
    return this._height$;
  }

  public gridLayout$: Observable<GridLayout|undefined>;

  constructor(
    private destroy: DestroyRef,
    @Inject(META_SERVICE) private metaService: MetaService,
    private breadcrumb: Breadcrumb) {

    this.gridLayout$ = combineLatest([this._layoutIdentifier$, this.metaService.getGridLayout$]).pipe(
      takeUntilDestroyed(this.destroy),
      map(([layoutIdentifier, getGridLayout]) => (layoutIdentifier && getGridLayout) ? getGridLayout(layoutIdentifier) : undefined)
    );
  }

  ngOnInit(): void {
    this.breadcrumb.setIdentifier('grid');
    this._storageIdentifier$.next((this.layoutItem?.options?.itemoptions as EntityGridOptions)?.identifier);
    this._layoutIdentifier$.next((this.layoutItem?.options?.itemoptions as EntityGridOptions)?.layout ?? 'primary');
    this._height$.next((this.layoutItem?.options?.itemoptions as EntityGridOptions)?.height ?? '100%');
  }
}

