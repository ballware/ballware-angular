import { AfterViewInit, Component, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { EditLayoutItem } from '@ballware/meta-model';
import { EDIT_SERVICE, EditService, SETTINGS_SERVICE, SettingsService } from '@ballware/meta-services';
import { DxMapComponent, DxMapModule } from 'devextreme-angular';
import { Observable, combineLatest, takeUntil } from 'rxjs';
import { WithDestroy } from '../../utils/withdestroy';
import { WithEditItemLifecycle } from '../../utils/withedititemlivecycle';
import { WithReadonly } from '../../utils/withreadonly';
import { WithValue } from '../../utils/withvalue';
import { WithVisible } from '../../utils/withvisible';
import { CommonModule } from '@angular/common';

declare let google: any;

interface MapValue {
  lat: number;
  lng: number;
}

@Component({
  selector: 'ballware-edit-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss'],
  imports: [CommonModule, DxMapModule],
  standalone: true
})
export class EditLayoutMapComponent extends WithVisible(WithReadonly(WithValue(WithEditItemLifecycle(WithDestroy()), () => undefined as MapValue|undefined))) implements OnInit, AfterViewInit {

  @Input() initialLayoutItem?: EditLayoutItem;

  @ViewChild('map', { static: false }) map?: DxMapComponent;

  public layoutItem: EditLayoutItem|undefined;

  public googlekey$: Observable<string|undefined>;

  constructor(@Inject(SETTINGS_SERVICE) private settingsService: SettingsService, @Inject(EDIT_SERVICE) private editService: EditService) {
    super();

    this.googlekey$ = this.settingsService.googlekey$;
  }

  ngOnInit(): void {
    if (this.initialLayoutItem) {
      this.initLifecycle(this.initialLayoutItem, this.editService, this);

      this.preparedLayoutItem$
        .pipe(takeUntil(this.destroy$))
        .subscribe((layoutItem) => {
          if (layoutItem) {
            this.initValue(layoutItem, this.editService);
            this.initReadonly(layoutItem, this.editService);
            this.initVisible(layoutItem);

            this.layoutItem = layoutItem;
          }
        });
    }
  }

  ngAfterViewInit(): void {
    combineLatest([this.readonly$, this.currentValue$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([readonly, value]) => {
        const existingMarkers = this.map?.instance.option(
          'markers'
        ) as Array<object>;

        for (const marker of existingMarkers) {
          this.map?.instance.removeMarker(marker);
        }

        if (value) {
          value.lat = value.lat ?? 0.0;
          value.lng = value.lng ?? 0.0;  
          
          this.map?.instance.addMarker({
            location: value
          }).then((marker) => {
            if (!readonly) {
              marker.setDraggable(true);

              google.maps.event.addListener(
                marker,
                'dragend',
                (e: {
                  latLng: { lng: () => number; lat: () => number };
                }) => {
                  this.value = {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng()
                  };
                }
              );
            }
          });
        }
      });
  }
}
