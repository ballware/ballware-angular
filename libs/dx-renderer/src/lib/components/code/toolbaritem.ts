import { PageToolbarItem } from '@ballware/meta-model';
import { Item as ToolbarItem, LocateInMenuMode, ToolbarItemLocation } from 'devextreme/ui/toolbar';
import {
  PageService,
  ToolbarItemRef
} from '@ballware/meta-services';
import {
  InitializedEvent as TextBoxInitializedEvent, Properties as TextBoxProperties,
  ValueChangedEvent as TextBoxValueChangedEvent
} from 'devextreme/ui/text_area';

export const createCodeToolbarItem = (
  item: PageToolbarItem,
  location: ToolbarItemLocation,
  locateInMenu: LocateInMenuMode,
  pageService: PageService
) => {

  const onItemInitialized = (e: TextBoxInitializedEvent, name: string) => {
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
    widget: 'dxTextArea' as unknown,
    options: {
      label: item.caption ?? '',
      onInitialized: (e) => onItemInitialized(e, item.name),
      onValueChanged: (e: TextBoxValueChangedEvent) => {
        if (item.name) {
          pageService.paramEditorValueChanged({ name: item.name, value: e.value });
        }
      }
    } as TextBoxProperties
  } as ToolbarItem;
}
