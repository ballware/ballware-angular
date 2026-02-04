import { PageToolbarItem } from '@ballware/meta-model';
import { Item as ToolbarItem, LocateInMenuMode, ToolbarItemLocation } from 'devextreme/ui/toolbar';
import {
  AutocompleteCreator,
  LookupCreator,
  LookupDescriptor, PAGE_SERVICE,
  PickvalueCreator,
  ToolbarItemRef
} from '@ballware/meta-services';
import { LOOKUP_DELEGATE_BUILDER_FACTORY, LookupDelegate } from '../../utils';
import {
  InitializedEvent as SelectBoxInitializedEvent, Properties as SelectBoxProperties,
  ValueChangedEvent as SelectBoxValueChangedEvent
} from 'devextreme/ui/select_box';
import { inject } from '@angular/core';

export const createLookupToolbarItem = (
  item: PageToolbarItem,
  location: ToolbarItemLocation,
  locateInMenu: LocateInMenuMode,
  lookups: Record<string, LookupDescriptor | LookupCreator | PickvalueCreator | AutocompleteCreator | Array<unknown>>,
) => {

  const pageService = inject(PAGE_SERVICE);
  const lookupDelegateBuilderFactory = inject(LOOKUP_DELEGATE_BUILDER_FACTORY);

  let lookup: LookupDelegate | undefined;

  if (item.lookup || item.options?.['items']) {
    const lookupBuilder = lookupDelegateBuilderFactory(lookups);

    if (item.lookup) {
      lookupBuilder.forIdentifier(item.lookup);
    } else if (item.options['items']) {
      lookupBuilder.forStaticItems(item.options['items'] as Array<any>);

      lookupBuilder.withDisplayExpr(item.options['displayExpr'] as string ?? 'text');
      lookupBuilder.withValueExpr(item.options['valueExpr'] as string ?? 'value');
    }

    lookup = lookupBuilder.build();
  }

  const onItemInitialized = (e: SelectBoxInitializedEvent, name: string) => {
    if (name) {
      const toolbarItemRef = {
        getOption: (option) => (e.component as any)?.option(option),
        setOption: (option, value) => (e.component as any)?.option(option, value)
      } as ToolbarItemRef;

      pageService.paramEditorInitialized({ name, item: toolbarItemRef });
    }
  };

  return {
    location,
    locateInMenu,
    widget: 'dxSelectBox',
    options: {
      label: item.caption ?? '',
      width: item.width ?? '400px',
      searchEnabled: true,
      showClearButton: true,
      showDropDownButton: true,
      displayExpr: lookup?.displayExpr,
      valueExpr: lookup?.valueExpr,
      dataSource: lookup?.dataSource,
      onInitialized: (e) => onItemInitialized(e, item.name),
      onValueChanged: (e: SelectBoxValueChangedEvent) => {
        if (item.name) {
          pageService.paramEditorValueChanged({ name: item.name, value: e.value });
        }
      }
    } as SelectBoxProperties
  } as ToolbarItem;
}
