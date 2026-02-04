import {
  AfterViewInit,
  Component, DestroyRef,
  Inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CrudItem, EntityMapOptions, PageLayoutItem } from '@ballware/meta-model';
import { CRUD_SERVICE, CrudService, SETTINGS_SERVICE, SettingsService } from '@ballware/meta-services';
import { DxMapComponent, DxMapModule } from 'devextreme-angular';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { get } from 'lodash';
import { DataSourceService } from '../../../utils';
import { CommonModule } from '@angular/common';
import { Breadcrumb } from '@ballware/renderer-commons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'ballware-page-map',
    templateUrl: './pagemap.component.html',
    styleUrls: [],
    imports: [CommonModule, DxMapModule],
    hostDirectives: [Breadcrumb]
})
export class PageLayoutMapComponent implements OnInit, AfterViewInit {
  @Input() layoutItem?: PageLayoutItem;

  @ViewChild('map', { static: false }) map?: DxMapComponent;

  public googlekey$: Observable<string | undefined>;

  public markers$ = new BehaviorSubject<any[]>([]);

  private mouseTarget: Element | undefined | null;

  constructor(
    private readonly destroy: DestroyRef,
    @Inject(SETTINGS_SERVICE) private readonly settingsService: SettingsService,
    @Inject(CRUD_SERVICE) private readonly crudService: CrudService,
    private readonly breadcrumb: Breadcrumb,
    private readonly dataSourceService: DataSourceService
  ) {
    this.googlekey$ = this.settingsService.googlekey$;
  }

  ngOnInit() {
    this.breadcrumb.setIdentifier('map');
  }

  ngAfterViewInit(): void {
    this.map?.instance
      .element()
      .addEventListener('mousemove', this.onMapMouseMove);

    combineLatest([this.dataSourceService.dataSource$]).pipe(
      takeUntilDestroyed(this.destroy)
    ).subscribe(([dataSource]) => {
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

  readonly onMapMouseMove = (e: MouseEvent) => {
    this.mouseTarget = document.elementFromPoint(e.clientX, e.clientY);
  }

  readonly onMarkerClicked = (item: CrudItem) => {
    if (this.mouseTarget) {
      this.crudService.selectOptions({
        item,
        target: this.mouseTarget,
        defaultEditLayout: 'primary',
      });
    }
  }
}
