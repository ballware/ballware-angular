import { Component, DestroyRef, Inject } from '@angular/core';
import { LOOKUP_SERVICE, LookupService, PAGE_SERVICE, PageService, ToolbarItemRef, Translator, TRANSLATOR } from '@ballware/meta-services';
import { Item } from 'devextreme/ui/toolbar';
import { ClickEvent as ButtonClickEvent, InitializedEvent as ButtonInitializedEvent, Properties as ButtonProperties } from 'devextreme/ui/button';
import { InitializedEvent as DateBoxInitializedEvent, ValueChangedEvent as DateBoxValueChangedEvent, Properties as DateBoxProperties } from 'devextreme/ui/date_box';
import { ButtonClickEvent as DropDownButtonClickEvent, InitializedEvent as DropDownButtonInitializedEvent, ItemClickEvent as DropDownButtonItemClickEvent, Properties as DropDownButtonProperties } from 'devextreme/ui/drop_down_button';
import { InitializedEvent as SelectBoxInitializedEvent, ValueChangedEvent as SelectBoxValueChangedEvent, Properties as SelectBoxProperties } from 'devextreme/ui/select_box';
import { InitializedEvent as TagBoxInitializedEvent, ValueChangedEvent as TagBoxValueChangedEvent, Properties as TagBoxProperties } from 'devextreme/ui/tag_box';
import { combineLatest } from 'rxjs';
import { LOOKUP_DELEGATE_BUILDER_FACTORY, LookupDelegate, LookupDelegateBuilderFactory } from '../../utils';
import { CommonModule } from '@angular/common';
import { DxToolbarModule } from 'devextreme-angular';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToolbarItemComponent } from 'devextreme/common';

@Component({
    selector: 'ballware-toolbar',
    templateUrl: './toolbar.component.html',
    styleUrls: ['./toolbar.component.scss'],
    imports: [CommonModule, DxToolbarModule]
})
export class ToolbarComponent {

  public toolbarItems: Array<Item> = [];

  constructor(
    private readonly destroy: DestroyRef,
    @Inject(LOOKUP_SERVICE) private readonly lookupService: LookupService,
    @Inject(PAGE_SERVICE) private readonly pageService: PageService,
    @Inject(TRANSLATOR) private readonly translator: Translator,
    @Inject(LOOKUP_DELEGATE_BUILDER_FACTORY) private readonly createLookupDelegateBuilder: LookupDelegateBuilderFactory) {

    combineLatest([this.pageService.layout$, this.lookupService.lookups$]).pipe(
      takeUntilDestroyed(this.destroy)
    ).subscribe(([layout, lookups]) => {
      if (layout && lookups) {
        this.toolbarItems = layout.toolbaritems?.map((item) => {

          const toolbarItem = {
            location: 'before',
            locateInMenu: 'auto'
          } as Item;

          let lookup: LookupDelegate | undefined;

          if (item.lookup || item.options?.['items']) {
            const lookupBuilder = this.createLookupDelegateBuilder(lookups);

            if (item.lookup) {
              lookupBuilder.forIdentifier(item.lookup);
            } else if (item.options['items']) {
              lookupBuilder.forStaticItems(item.options['items'] as Array<any>);

              lookupBuilder.withDisplayExpr(item.options['displayExpr'] as string ?? 'text');
              lookupBuilder.withValueExpr(item.options['valueExpr'] as string ?? 'value');
            }

            lookup = lookupBuilder.build();
          }

          switch (item.type) {
            case 'lookup':
            case 'staticklookup':
              toolbarItem.widget = 'dxSelectBox';
              toolbarItem.options = {
                label: item.caption ?? '',
                width: item.width ?? '400px',
                searchEnabled: true,
                showClearButton: true,
                showDropDownButton: true,
                displayExpr: lookup?.displayExpr,
                valueExpr: lookup?.valueExpr,
                dataSource: lookup?.dataSource,
                onInitialized: (e) => this.onItemInitialized(e, item.name),
                onValueChanged: (e: SelectBoxValueChangedEvent) => {
                  if (item.name) {
                    this.pageService.paramEditorValueChanged({ name: item.name, value: e.value });
                  }
                }
              } as SelectBoxProperties;
              break;
            case 'multilookup':
            case 'statickmultilookup':
              toolbarItem.widget = ('dxTagBox' as unknown) as ToolbarItemComponent;
              toolbarItem.options = {
                label: item.caption ?? '',
                width: item.width ?? '400px',
                searchEnabled: true,
                showClearButton: true,
                showDropDownButton: true,
                showSelectionControls: true,
                multiline: false,
                maxDisplayedTags: 3,
                displayExpr: lookup?.displayExpr,
                valueExpr: lookup?.valueExpr,
                dataSource: lookup?.dataSource,
                onInitialized: (e) => this.onItemInitialized(e, item.name),
                onValueChanged: (e: TagBoxValueChangedEvent) => {
                  if (item.name) {
                    this.pageService.paramEditorValueChanged({ name: item.name, value: e.value });
                  }
                }
              } as TagBoxProperties;
              break;
            case 'datetime':
              toolbarItem.widget = 'dxDateBox';
              toolbarItem.options = {
                label: item.caption ?? '',
                width: item.width ?? '220px',
                type: "datetime",
                displayFormat: this.translator('format.datetime'),
                hint: item.caption,
                onInitialized: (e: DateBoxInitializedEvent) => this.onItemInitialized(e, item.name),
                onValueChanged: (e: DateBoxValueChangedEvent) => {
                  if (item.name) {
                    this.pageService.paramEditorValueChanged({ name: item.name, value: e.value });
                  }
                }
              } as DateBoxProperties;
              break;
            case 'dropdownbutton':
              toolbarItem.widget = 'dxDropDownButton';
              toolbarItem.options = {
                width: item.width ?? '180px',
                text: item.caption ?? '',
                keyExpr: "id",
                displayExpr: "text",
                splitButton: true,
                dataSource: item.options['items'] as any[],
                onInitialized: (e: DropDownButtonInitializedEvent) => this.onItemInitialized(e, item.name),
                onButtonClick: (e: DropDownButtonClickEvent) => {
                  if (item.name) {
                    this.pageService.paramEditorEvent({ name: item.name, event: 'click', param: undefined });
                  }
                },
                onItemClick: (e: DropDownButtonItemClickEvent) => {
                  if (item.name) {
                    this.pageService.paramEditorEvent({ name: item.name, event: 'click', param: e.itemData['id'] });
                  }
                }
              } as DropDownButtonProperties;
              break;
            case 'button':
              toolbarItem.widget = 'dxButton';
              toolbarItem.options = {
                  width: item.width ?? 'auto',
                  text: item.caption ?? '',
                  onInitialized: (e: ButtonInitializedEvent) => this.onItemInitialized(e, item.name),
                  onClick: (e: ButtonClickEvent) => {
                    if (item.name) {
                      this.pageService.paramEditorEvent({ name: item.name, event: 'click' });
                    }
                  }
                } as ButtonProperties;
              break;
          }

          return toolbarItem;
        }) ?? [];
      }
    });
  }

  readonly onItemInitialized = (e: SelectBoxInitializedEvent | TagBoxInitializedEvent | DateBoxInitializedEvent | ButtonInitializedEvent | DropDownButtonInitializedEvent, name: string) => {
    if (name) {
      const toolbarItemRef = {
        getOption: (option) => (e.component as any)?.option(option),
        setOption: (option, value) => (e.component as any)?.option(option, value)
      } as ToolbarItemRef;

      this.pageService.paramEditorInitialized({ name, item: toolbarItemRef });
    }
  };
}
