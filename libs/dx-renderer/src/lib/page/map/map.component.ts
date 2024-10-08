import { AfterViewInit, Component, Inject, Input, ViewChild } from '@angular/core';
import { CrudItem, EntityMapOptions, PageLayoutItem } from '@ballware/meta-model';
import { CRUD_SERVICE, CrudService, SETTINGS_SERVICE, SettingsService } from '@ballware/meta-services';
import { DxMapComponent, DxMapModule } from 'devextreme-angular';
import { BehaviorSubject, Observable, combineLatest, takeUntil } from 'rxjs';
import { get } from 'lodash';
import { DataSourceService } from '../../utils/datasource.service';
import { WithDestroy } from '../../utils/withdestroy';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ballware-page-map',
  templateUrl: './map.component.html',
  styleUrls: [],
  imports: [CommonModule, DxMapModule],
  standalone: true
})
export class PageLayoutMapComponent extends WithDestroy() implements AfterViewInit {

  @Input() layoutItem?: PageLayoutItem;

  @ViewChild('map', { static: false }) map?: DxMapComponent;

  public googlekey$: Observable<string|undefined>;

  public markers$ = new BehaviorSubject<any[]>([]);

  private mouseTarget: Element|undefined|null;

  constructor(
    @Inject(SETTINGS_SERVICE) private settingsService: SettingsService, 
    @Inject(CRUD_SERVICE) private crudService: CrudService, 
    private dataSourceService: DataSourceService) {
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
              location: get(item, locationMember),
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
