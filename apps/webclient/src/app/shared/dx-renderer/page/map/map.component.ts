import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { DxMapComponent } from 'devextreme-angular';
import { combineLatest, Observable, takeUntil } from 'rxjs';
import { CrudItem, EntityMapOptions, PageLayoutItem } from '@ballware/meta-model';
import { CrudService, selectGooglekey } from '@ballware/meta-services';
import { getByPath } from '../../utils/databinding';
import { WithDestroy } from '../../utils/withdestroy';
import { Store } from '@ngrx/store';

@Component({
  selector: 'ballware-page-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class PageLayoutMapComponent extends WithDestroy() implements AfterViewInit {

  @Input() layoutItem?: PageLayoutItem;

  @ViewChild('map', { static: false }) map?: DxMapComponent;

  public googlekey$: Observable<string|undefined>;

  private mouseTarget: Element|undefined|null;

  constructor(private store: Store, private crudService: CrudService) {
    super();

    this.onMapMouseMove = this.onMapMouseMove.bind(this);
    this.onMarkerClicked = this.onMarkerClicked.bind(this);

    this.googlekey$ = this.store.select(selectGooglekey);
  }

  ngAfterViewInit(): void {

    this.map?.instance.element().addEventListener('mousemove', this.onMapMouseMove);

    combineLatest([this.crudService.fetchedItems$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([fetchedItems]) => {
        const existingMarkers = this.map?.instance.option(
          'markers'
        ) as Array<object>;

        for (const marker of existingMarkers) {
          this.map?.instance.removeMarker(marker);
        }

        const locationMember = (this.layoutItem?.options?.itemoptions as EntityMapOptions)?.locationMember;

        if (fetchedItems && locationMember) {

          fetchedItems.forEach(item => {
            this.map?.instance.addMarker({
              location: getByPath(item, locationMember),
              onClick: () => this.onMarkerClicked(item)
            });
          });
        }
      });
  }

  public onMapMouseMove(e: MouseEvent) {
    this.mouseTarget = document.elementFromPoint(e.clientX, e.clientY);
  }

  public onMarkerClicked(item: CrudItem) {
    if (this.mouseTarget) {
      this.crudService.selectOptions(item, this.mouseTarget, 'primary');
    }
  }
}
