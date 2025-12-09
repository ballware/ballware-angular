import {
  AfterViewInit,
  Component,
  DestroyRef,
  Inject,
  ViewChild,
} from '@angular/core';
import { SETTINGS_SERVICE, SettingsService } from '@ballware/meta-services';
import { DxMapComponent, DxMapModule } from 'devextreme-angular';
import { Observable, combineLatest } from 'rxjs';
import { CommonModule } from '@angular/common';
import { EditItemLivecycle, NullableLatLngValue, Readonly, Visible } from '@ballware/renderer-commons';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

declare let google: any;

@Component({
    selector: 'ballware-edit-map',
    templateUrl: './editmap.component.html',
    styleUrls: [],
    imports: [CommonModule, DxMapModule],
    hostDirectives: [{ directive: EditItemLivecycle, inputs: ['initialLayoutItem'] }, NullableLatLngValue, Readonly, Visible]
})
export class EditLayoutMapComponent implements AfterViewInit {

  @ViewChild('map', { static: false }) map?: DxMapComponent;

  public googlekey$: Observable<string|undefined>;

  constructor(
    @Inject(SETTINGS_SERVICE) private readonly settingsService: SettingsService,
    private readonly destroy: DestroyRef,
    public readonly livecycle: EditItemLivecycle,
    public readonly visible: Visible,
    public readonly readonly: Readonly,
    public readonly value: NullableLatLngValue
  ) {
    this.googlekey$ = this.settingsService.googlekey$;
  }

  ngAfterViewInit(): void {
    combineLatest([this.readonly.readonly$, this.value.currentValue$]).pipe(
      takeUntilDestroyed(this.destroy)
    ).subscribe(([readonly, value]) => {
      const existingMarkers = this.map?.instance.option(
        'markers'
      ) as Array<object>;

      for (const marker of existingMarkers) {
        this.map?.instance.removeMarker(marker);
      }

      if (value) {
        value.lat = value.lat ?? 0;
        value.lng = value.lng ?? 0;

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
                this.value.value = {
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
