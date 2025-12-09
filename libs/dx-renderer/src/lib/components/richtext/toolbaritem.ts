import { PageToolbarItem } from '@ballware/meta-model';
import { Item as ToolbarItem, LocateInMenuMode, ToolbarItemLocation } from 'devextreme/ui/toolbar';
import {
  PageService,
  ToolbarItemRef
} from '@ballware/meta-services';
import {
  InitializedEvent as RichtextBoxInitializedEvent, Properties as RichtextBoxProperties,
  ValueChangedEvent as RichtextBoxValueChangedEvent
} from 'devextreme/ui/html_editor';

export const createRichtextToolbarItem = (
  item: PageToolbarItem,
  location: ToolbarItemLocation,
  locateInMenu: LocateInMenuMode,
  pageService: PageService
) => {

  const onItemInitialized = (e: RichtextBoxInitializedEvent, name: string) => {
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
    widget: 'dxHtmlEditor' as unknown,
    options: {
      label: item.caption ?? '',
      onInitialized: (e) => onItemInitialized(e, item.name),
      onValueChanged: (e: RichtextBoxValueChangedEvent) => {
        if (item.name) {
          pageService.paramEditorValueChanged({ name: item.name, value: e.value });
        }
      }
    } as RichtextBoxProperties
  } as ToolbarItem;
}
