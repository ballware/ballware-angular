import { Component, Inject, Input, OnInit } from '@angular/core';
import { EntityGridOptions, GridLayout, PageLayoutItem } from '@ballware/meta-model';
import { MasterdetailService, META_SERVICE, MetaService } from '@ballware/meta-services';
import { BehaviorSubject, Observable, combineLatest, map, takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';
import { EditDetailComponent } from '../../edit';
import { CommonModule } from '@angular/common';
import { EntitygridComponent } from '../../datacontainer';

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
  standalone: true
})
export class PageLayoutGridComponent extends WithDestroy() implements OnInit {

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

  constructor(@Inject(META_SERVICE) private metaService: MetaService) {

    super();

    this.gridLayout$ = combineLatest([this._layoutIdentifier$, this.metaService.getGridLayout$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([layoutIdentifier, getGridLayout]) => (layoutIdentifier && getGridLayout) ? getGridLayout(layoutIdentifier) : undefined));
  }

  ngOnInit(): void {
    this._storageIdentifier$.next((this.layoutItem?.options?.itemoptions as EntityGridOptions)?.identifier);
    this._layoutIdentifier$.next((this.layoutItem?.options?.itemoptions as EntityGridOptions)?.layout ?? 'primary');
    this._height$.next((this.layoutItem?.options?.itemoptions as EntityGridOptions)?.height ?? '100%');
  }
}

