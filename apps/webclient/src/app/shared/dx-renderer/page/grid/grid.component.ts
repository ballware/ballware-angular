import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';
import { EntityGridOptions, GridLayout, PageLayoutItem } from '@ballware/meta-model';
import { MetaService } from '@ballware/meta-services';
import { BehaviorSubject, combineLatest, map, Observable, takeUntil } from 'rxjs';
import { EditModule } from '../../edit/edit.module';
import { WithDestroy } from '../../utils/withdestroy';

@Component({
  selector: 'ballware-page-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
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

  constructor(private metaService: MetaService) {

    super();

    this.gridLayout$ = combineLatest([this._layoutIdentifier$, this.metaService.getGridLayout$])
      .pipe(takeUntil(this.destroy$))
      .pipe(map(([layoutIdentifier, getGridLayout]) => (layoutIdentifier && getGridLayout) ? getGridLayout(layoutIdentifier) : undefined));
  }

  ngOnInit(): void {
    this._storageIdentifier$.next((this.layoutItem?.options?.itemoptions as EntityGridOptions)?.identifier);
    this._layoutIdentifier$.next((this.layoutItem?.options?.itemoptions as EntityGridOptions)?.layout ?? 'primary');
    this._height$.next(this.layoutItem?.options?.height ?? '100%');
  }
}

@NgModule({
  declarations: [PageLayoutGridComponent],
  imports: [
    CommonModule,
    EditModule
  ],
   exports: [
    PageLayoutGridComponent
   ]
})
export class PageLayoutGridModule {}
