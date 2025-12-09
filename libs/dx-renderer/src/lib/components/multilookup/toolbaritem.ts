import { PageToolbarItem } from '@ballware/meta-model';
import { Item as ToolbarItem, LocateInMenuMode, ToolbarItemLocation } from 'devextreme/ui/toolbar';
import {
  LookupCreator,
  LookupDescriptor,
  PageService,
  PickvalueCreator,
  ToolbarItemRef
} from '@ballware/meta-services';
import { LookupDelegate, LookupDelegateBuilderFactory } from '../../utils';
import {
  InitializedEvent as TagBoxInitializedEvent, Properties as TagBoxProperties,
  ValueChangedEvent as TagBoxValueChangedEvent
} from 'devextreme/ui/tag_box';

export const createMultilookupToolbarItem = (
  item: PageToolbarItem,
  location: ToolbarItemLocation,
  locateInMenu: LocateInMenuMode,
  pageService: PageService,
  lookupDelegateBuilderFactory: LookupDelegateBuilderFactory,
  lookups: Record<string, LookupDescriptor | LookupCreator | PickvalueCreator>,
) => {

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

  const onItemInitialized = (e: TagBoxInitializedEvent, name: string) => {
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
    widget: 'dxTagBox' as unknown,
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
      onValueChanged: (e: TagBoxValueChangedEvent) => {
        if (item.name) {
          pageService.paramEditorValueChanged({ name: item.name, value: e.value });
        }
      }
    } as TagBoxProperties
  } as ToolbarItem;
}
