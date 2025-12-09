import { PageToolbarItem } from '@ballware/meta-model';
import { Item as ToolbarItem, LocateInMenuMode, ToolbarItemLocation } from 'devextreme/ui/toolbar';
import {
  PageService,
  ToolbarItemRef
} from '@ballware/meta-services';
import {
  InitializedEvent as NumberBoxInitializedEvent, Properties as NumberBoxProperties,
  ValueChangedEvent as NumberBoxValueChangedEvent
} from 'devextreme/ui/number_box';

export const createNumberToolbarItem = (
  item: PageToolbarItem,
  location: ToolbarItemLocation,
  locateInMenu: LocateInMenuMode,
  pageService: PageService
) => {

  const onItemInitialized = (e: NumberBoxInitializedEvent, name: string) => {
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
    widget: 'dxNumberBox' as unknown,
    options: {
      label: item.caption ?? '',
      onInitialized: (e) => onItemInitialized(e, item.name),
      onValueChanged: (e: NumberBoxValueChangedEvent) => {
        if (item.name) {
          pageService.paramEditorValueChanged({ name: item.name, value: e.value });
        }
      }
    } as NumberBoxProperties
  } as ToolbarItem;
}
