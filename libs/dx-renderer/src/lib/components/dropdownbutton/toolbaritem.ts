import { PageToolbarItem } from '@ballware/meta-model';
import { Item as ToolbarItem, LocateInMenuMode, ToolbarItemLocation } from 'devextreme/ui/toolbar';
import {
  PAGE_SERVICE,
  ToolbarItemRef
} from '@ballware/meta-services';
import {
  InitializedEvent as DropDownButtonInitializedEvent, Properties as DropDownButtonProperties, ButtonClickEvent as DropDownButtonClickEvent, ItemClickEvent as DropDownButtonItemClickEvent
} from 'devextreme/ui/drop_down_button';
import { inject } from '@angular/core';

export const createDropDownButtonToolbarItem = (
  item: PageToolbarItem,
  location: ToolbarItemLocation,
  locateInMenu: LocateInMenuMode
) => {
  const pageService = inject(PAGE_SERVICE);

  const onItemInitialized = (e: DropDownButtonInitializedEvent, name: string) => {
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
    widget: 'dxDropDownButton',
    options: {
      width: item.width ?? '180px',
      text: item.caption ?? '',
      keyExpr: "id",
      displayExpr: "text",
      splitButton: true,
      dataSource: item.options['items'] as any[],
      onInitialized: (e) => onItemInitialized(e, item.name),
      onButtonClick: (e: DropDownButtonClickEvent) => {
        if (item.name) {
          pageService.paramEditorEvent({ name: item.name, event: 'click', param: undefined });
        }
      },
      onItemClick: (e: DropDownButtonItemClickEvent) => {
        if (item.name) {
          pageService.paramEditorEvent({ name: item.name, event: 'click', param: e.itemData['id'] });
        }
      }
    } as DropDownButtonProperties
  } as ToolbarItem;
}
