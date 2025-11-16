import {
  AfterViewInit,
  Component,
  Inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CrudItem, EntityMapOptions, PageLayoutItem } from '@ballware/meta-model';
import { CRUD_SERVICE, CrudService, SETTINGS_SERVICE, SettingsService } from '@ballware/meta-services';
import { DxMapComponent, DxMapModule } from 'devextreme-angular';
import { BehaviorSubject, Observable, combineLatest, takeUntil } from 'rxjs';
import { get } from 'lodash';
import { DataSourceService } from '../../utils';
import { WithDestroy } from '../../utils/withdestroy';
import { CommonModule } from '@angular/common';
import { Breadcrumb } from '@ballware/renderer-commons';

@Component({
  selector: 'ballware-page-map',
  templateUrl: './map.component.html',
  styleUrls: [],
  imports: [CommonModule, DxMapModule],
  hostDirectives: [Breadcrumb],
  standalone: true,
})
export class PageLayoutMapComponent
  extends WithDestroy()
  implements OnInit, AfterViewInit
{
  @Input() layoutItem?: PageLayoutItem;

  @ViewChild('map', { static: false }) map?: DxMapComponent;

  public googlekey$: Observable<string | undefined>;

  public markers$ = new BehaviorSubject<any[]>([]);

  private mouseTarget: Element | undefined | null;

  constructor(
    @Inject(SETTINGS_SERVICE) private settingsService: SettingsService,
    @Inject(CRUD_SERVICE) private crudService: CrudService,
    private breadcrumb: Breadcrumb,
    private dataSourceService: DataSourceService
  ) {
    super();

    this.onMapMouseMove = this.onMapMouseMove.bind(this);
    this.onMarkerClicked = this.onMarkerClicked.bind(this);

    this.googlekey$ = this.settingsService.googlekey$;
  }

  ngOnInit() {
    this.breadcrumb.setIdentifier('map');
  }

  ngAfterViewInit(): void {
    this.map?.instance
      .element()
      .addEventListener('mousemove', this.onMapMouseMove);

    combineLatest([this.dataSourceService.dataSource$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([dataSource]) => {
        const locationMember = (
          this.layoutItem?.options?.itemoptions as EntityMapOptions
        )?.locationMember;

        if (dataSource && locationMember) {
          dataSource.on('changed', () => {
            this.markers$.next(
              dataSource.items()?.map((item) => ({
                location: get(item, locationMember),
                onClick: () => this.onMarkerClicked(item),
              }))
            );
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
      this.crudService.selectOptions({
        item,
        target: this.mouseTarget,
        defaultEditLayout: 'primary',
      });
    }
  }
}
