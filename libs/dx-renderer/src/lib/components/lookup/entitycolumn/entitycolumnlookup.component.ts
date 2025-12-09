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
import { ValueChangedEvent as LookupValueChangedEvent } from "devextreme/ui/select_box";
import { cloneDeep, get, set } from "lodash";
import { combineLatest } from "rxjs";
import { LOOKUP_DELEGATE_BUILDER_FACTORY, LookupDelegate, LookupDelegateBuilderFactory } from '../../../utils';
import { CommonModule } from "@angular/common";
import {
  DxSelectBoxComponent, DxSelectBoxModule
} from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'ballware-entity-column-lookup',
    templateUrl: './entitycolumnlookup.component.html',
    styleUrls: [],
    imports: [CommonModule, DxSelectBoxModule]
})
export class EntityColumnLookupComponent implements OnInit {
    @ViewChild('selectbox', { static: false }) selectbox?: DxSelectBoxComponent;

    @Input() dataMember!: string;
    @Input() column!: GridLayoutColumn;
    @Input() lookupParams!: Record<string, unknown>;
    @Input() item!: Record<string, unknown>;
    @Input() readonly!: boolean;

    prepared = false;
    preparedColumn: GridLayoutColumn|undefined;
    value: unknown = undefined;

    lookup: LookupDelegate|undefined;

    onValueChanged: ((e: LookupValueChangedEvent) => void)|undefined;

    constructor(
        private readonly destroy: DestroyRef,
        @Inject(LOOKUP_SERVICE) private readonly lookupService: LookupService,
        @Inject(META_SERVICE) private readonly metaService: MetaService,
        @Inject(LOOKUP_DELEGATE_BUILDER_FACTORY) private readonly createLookupDelegateBuilder: LookupDelegateBuilderFactory
        ) {
    }

    lookupValue() {
        return this.value as string;
    }

    getEditorOption(option: string): unknown {
      return this.selectbox?.instance.option(option);
    }

    setEditorOption(option: string, value: unknown) {
      this.selectbox?.instance.option(option, value);
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

              this.onValueChanged = (e: LookupValueChangedEvent) => {

                  const editUtil = {
                      getEditorOption: (dataMember, option) => dataMember === this.dataMember ? this.getEditorOption(option) : undefined,
                      setEditorOption: (dataMember, option, value) => dataMember === this.dataMember && this.setEditorOption(option, value),
                      apply: () => console.warn('Apply in DynamicColumnComponent not implemented'),
                      cancel: () => console.warn('Cancel in DynamicColumnComponent not implemented')
                  } as EditUtil;

                  set(this.item, this.dataMember, e.value);
                  this.value = get(this.item, this.dataMember);

                  editorValueChanged(this.readonly ? EditModes.VIEW : EditModes.EDIT, this.item, editUtil, this.dataMember, e.value);
              };

              this.preparedColumn = preparedColumn;
              this.prepared = true;

              let lookupBuilder = this.createLookupDelegateBuilder(lookups);

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
              lookupBuilder.withValueExpr(this.preparedColumn.valueExpr);
              lookupBuilder.withDisplayExpr(this.preparedColumn.displayExpr);

              this.lookup = lookupBuilder.build();
          }
      });
    }
}
