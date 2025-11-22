import {
  Component,
  DestroyRef,
  Inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { EditUtil, GridLayoutColumn } from "@ballware/meta-model";
import { EditModes, LOOKUP_SERVICE, LookupService, META_SERVICE, MetaService } from "@ballware/meta-services";
import { ValueChangedEvent as BoolValueChangedEvent } from "devextreme/ui/check_box";
import { ValueChangedEvent as DateValueChangedEvent } from "devextreme/ui/date_box";
import { ValueChangedEvent as NumberValueChangedEvent } from "devextreme/ui/number_box";
import { ValueChangedEvent as MultiLookupValueChangedEvent } from "devextreme/ui/tag_box";
import { cloneDeep, get, set } from "lodash";
import { combineLatest } from "rxjs";
import { createLookupDelegateBuilder, LookupDelegate } from '../../utils';
import { CommonModule } from "@angular/common";
import { DxCheckBoxComponent, DxCheckBoxModule, DxDateBoxComponent, DxDateBoxModule, DxNumberBoxComponent, DxNumberBoxModule, DxTagBoxComponent, DxTagBoxModule } from "devextreme-angular";
import { DetailEditPopupComponent } from "../detaileditpopup/detaileditpopup.component";
import { I18NextPipe } from "angular-i18next";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'ballware-entity-dynamic-column',
    templateUrl: './entitydynamiccolumn.component.html',
    styleUrls: [],
    imports: [CommonModule, I18NextPipe, DetailEditPopupComponent, DxCheckBoxModule, DxNumberBoxModule, DxDateBoxModule, DxTagBoxModule]
})
export class EntityDynamicColumnComponent implements OnInit {
    @ViewChild('checkbox', { static: false }) checkbox?: DxCheckBoxComponent;
    @ViewChild('numberbox', { static: false }) numberbox?: DxNumberBoxComponent;
    @ViewChild('datebox', { static: false }) datebox?: DxDateBoxComponent;
    @ViewChild('datetimebox', { static: false }) datetimebox?: DxDateBoxComponent;
    @ViewChild('statictagbox', { static: false }) statictagbox?: DxTagBoxComponent;
    @ViewChild('tagbox', { static: false }) tagbox?: DxTagBoxComponent;

    @Input() dataMember!: string;
    @Input() column!: GridLayoutColumn;
    @Input() lookupParams!: Record<string, unknown>;
    @Input() item!: Record<string, unknown>;
    @Input() readonly!: boolean;

    prepared = false;
    preparedColumn: GridLayoutColumn|undefined;
    value: unknown|undefined = undefined;

    lookup: LookupDelegate|undefined;

    onValueChanged: ((e: BoolValueChangedEvent|NumberValueChangedEvent|DateValueChangedEvent|MultiLookupValueChangedEvent) => void)|undefined;

    constructor(
        private readonly destroy: DestroyRef,
        @Inject(LOOKUP_SERVICE) private readonly lookupService: LookupService,
        @Inject(META_SERVICE) private readonly metaService: MetaService) {
    }

    boolValue() {
        return this.value as boolean;
    }

    numberValue() {
        return this.value as number;
    }

    dateValue() {
        return this.value as Date;
    }

    multiLookupValue() {
        return this.value as Array<any>;
    }

    getEditorOption(option: string): unknown {
        switch (this.preparedColumn?.type) {
            case 'bool':
                return this.checkbox?.instance.option(option);
            case 'number':
                return this.numberbox?.instance.option(option);
            case 'date':
                return this.datebox?.instance.option(option);
            case 'datetime':
                return this.datetimebox?.instance.option(option);
            case 'staticmultilookup':
                return this.statictagbox?.instance.option(option);
            case 'multilookup':
                return this.tagbox?.instance.option(option);
        }

        return undefined;
    }

    setEditorOption(option: string, value: unknown) {
        switch (this.preparedColumn?.type) {
            case 'bool':
                return this.checkbox?.instance.option(option, value);
            case 'number':
                return this.numberbox?.instance.option(option, value);
            case 'date':
                return this.datebox?.instance.option(option, value);
            case 'datetime':
                return this.datetimebox?.instance.option(option, value);
            case 'staticmultilookup':
                return this.statictagbox?.instance.option(option, value);
            case 'multilookup':
                return this.tagbox?.instance.option(option, value);
        }
    }

    ngOnInit(): void {

        if (this.item && this.dataMember) {
            this.value = get(this.item, this.dataMember);
        }

        combineLatest([
            this.lookupService.lookups$,
            this.lookupService.getGenericLookupByIdentifier$,
            this.metaService.editorValueChanged$]).pipe(
              takeUntilDestroyed(this.destroy)
        ).subscribe(([lookups, getGenericLookupByIdentifier, editorValueChanged]) => {
          if (lookups && getGenericLookupByIdentifier && editorValueChanged) {
              const preparedColumn = cloneDeep(this.column);

              this.onValueChanged = (e: BoolValueChangedEvent|NumberValueChangedEvent|DateValueChangedEvent|MultiLookupValueChangedEvent) => {

                  const editUtil = {
                      getEditorOption: (dataMember, option) => dataMember === this.dataMember ? this.getEditorOption(option) : undefined,
                      setEditorOption: (dataMember, option, value) => dataMember === this.dataMember && this.setEditorOption(option, value),
                      apply: () => console.warn('Apply in DynamicColumnComponent not implemented'),
                      cancel: () => console.warn('Cancel in DynamicColumnComponent not implemented')
                  } as EditUtil;

                  set(this.item, this.dataMember, e.value);
                  this.value = get(this.item, this.dataMember);

                  editorValueChanged(!this.readonly ? EditModes.EDIT : EditModes.VIEW, this.item, editUtil, this.dataMember, e.value);
              };

              this.preparedColumn = preparedColumn;
              this.prepared = true;

              let lookupBuilder = createLookupDelegateBuilder(lookups);

              if (this.preparedColumn.items) {
                lookupBuilder.forStaticItems(this.preparedColumn.items);
              } else if (this.preparedColumn.itemsMember) {
                lookupBuilder.forItemsFromMember(this.preparedColumn.itemsMember, (member) => get(this.item, member) as Array<Record<string, unknown>>);
              } else if (this.preparedColumn.lookupMember) {
                lookupBuilder.forItemsFromMember(this.preparedColumn.lookupMember, (member) => get(this.lookupParams, member) as Array<Record<string, unknown>>);
              } else if (this.preparedColumn.lookup) {
                lookupBuilder.forIdentifier(this.preparedColumn.lookup);

                if (this.preparedColumn.lookupParam) {
                  lookupBuilder.withParamFromMember(this.preparedColumn.lookupParam, (member) => get(this.lookupParams, member) as string);
                } else if (this.preparedColumn.pickvalueEntity && this.preparedColumn.pickvalueField) {
                  lookupBuilder.withPickvaluesForEntityAndField(this.preparedColumn.pickvalueEntity, this.preparedColumn.pickvalueField);
                }
              }

              lookupBuilder.withUnknownLookupFallback(getGenericLookupByIdentifier);

              if (this.preparedColumn.type === 'staticmultilookup') {
                lookupBuilder.withValueExpr(this.preparedColumn.valueExpr ?? 'Value');
                lookupBuilder.withDisplayExpr(this.preparedColumn.displayExpr ?? 'Text');
              } else {
                if (this.preparedColumn.valueExpr) {
                  lookupBuilder.withValueExpr(this.preparedColumn.valueExpr);
                }

                if (this.preparedColumn.displayExpr) {
                  lookupBuilder.withDisplayExpr(this.preparedColumn.displayExpr);
                }
              }

              this.lookup = lookupBuilder.build();
          }
      });
    }
}
