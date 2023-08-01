import { AfterViewInit, Component, Input, OnInit, ViewChild } from '@angular/core';
import { I18NextPipe } from 'angular-i18next';
import { DxMapComponent } from 'devextreme-angular';
import { combineLatest, Observable, takeUntil } from 'rxjs';
import { EditLayoutItem } from '@ballware/meta-model';
import { EditService, EditItemRef, selectGooglekey } from '@ballware/meta-services';
import { WithDestroy } from '../../utils/withdestroy';
import { WithEditItemLifecycle } from '../../utils/withedititemlivecycle';
import { WithReadonly } from '../../utils/withreadonly';
import { WithValue } from '../../utils/withvalue';
import { Store } from '@ngrx/store';

declare let google: any;

interface MapValue {
  lat: number;
  lng: number;
}

@Component({
  selector: 'ballware-edit-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class EditLayoutMapComponent extends WithReadonly(WithValue(WithEditItemLifecycle(WithDestroy()), () => undefined as MapValue|undefined)) implements OnInit, AfterViewInit, EditItemRef {

  @Input() initialLayoutItem?: EditLayoutItem;

  @ViewChild('map', { static: false }) map?: DxMapComponent;

  public layoutItem: EditLayoutItem|undefined;

  public googlekey$: Observable<string|undefined>;

  constructor(private store: Store, private translationService: I18NextPipe, private editService: EditService) {
    super();

    this.googlekey$ = this.store.select(selectGooglekey);
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

  public getOption(option: string): any {
    switch (option) {
      case 'value':
        return this.value;
      case 'readonly':
        return this.readonly$.getValue();
    }

    return undefined;
  }

  public setOption(option: string, value: unknown) {
    switch (option) {
      case 'value':
        this.setValueWithoutNotification(value as MapValue);
        break;
      case 'readonly':
        this.setReadonly(value as boolean)
        break;
    }
  }
}
