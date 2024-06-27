import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { CrudItem, EntityMapOptions, PageLayoutItem } from '@ballware/meta-model';
import { CrudService, SettingsService } from '@ballware/meta-services';
import { DxMapComponent } from 'devextreme-angular';
import { BehaviorSubject, Observable, combineLatest, takeUntil } from 'rxjs';
import { getByPath } from '../../utils/databinding';
import { DataSourceService } from '../../utils/datasource.service';
import { WithDestroy } from '../../utils/withdestroy';

@Component({
  selector: 'ballware-page-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class PageLayoutMapComponent extends WithDestroy() implements AfterViewInit {

  @Input() layoutItem?: PageLayoutItem;

  @ViewChild('map', { static: false }) map?: DxMapComponent;

  public googlekey$: Observable<string|undefined>;

  public markers$ = new BehaviorSubject<any[]>([]);

  private mouseTarget: Element|undefined|null;

  constructor(private settingsService: SettingsService, private crudService: CrudService, private dataSourceService: DataSourceService) {
    super();

    this.onMapMouseMove = this.onMapMouseMove.bind(this);
    this.onMarkerClicked = this.onMarkerClicked.bind(this);

    this.googlekey$ = this.settingsService.googlekey$;
  }

  ngAfterViewInit(): void {

    this.map?.instance.element().addEventListener('mousemove', this.onMapMouseMove);

    combineLatest([this.dataSourceService.dataSource$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([dataSource]) => {
        const locationMember = (this.layoutItem?.options?.itemoptions as EntityMapOptions)?.locationMember;

        if (dataSource && locationMember) {

          dataSource.on('changed', () => {

            this.markers$.next(dataSource.items()?.map(item => ({
              location: getByPath(item, locationMember),
              onClick: () => this.onMarkerClicked(item)
            })));            
          });

          dataSource.load();
        }
      });
  }

  public onMapMouseMove(e: MouseEvent) {
    this.mouseTarget = document.elementFromPoint(e.clientX, e.clientY);
  }

  public onMarkerClicked(item: CrudItem) {
    if (this.mouseTarget) {
      

      this.crudService.selectOptions({ item, target: this.mouseTarget, defaultEditLayout: 'primary' });
    }
  }
}
