import { PageToolbarItem } from '@ballware/meta-model';
import { Item as ToolbarItem, LocateInMenuMode, ToolbarItemLocation } from 'devextreme/ui/toolbar';
import {
  PAGE_SERVICE,
  ToolbarItemRef
} from '@ballware/meta-services';
import {
  InitializedEvent as ButtonInitializedEvent, Properties as ButtonProperties
} from 'devextreme/ui/button';
import { inject } from '@angular/core';

export const createButtonToolbarItem = (
  item: PageToolbarItem,
  location: ToolbarItemLocation,
  locateInMenu: LocateInMenuMode
) => {
  const pageService = inject(PAGE_SERVICE);

  const onItemInitialized = (e: ButtonInitializedEvent, name: string) => {
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
    widget: 'dxButton',
    options: {
      width: item.width ?? 'auto',
      text: item.caption ?? '',
      onInitialized: (e) => onItemInitialized(e, item.name),
      onClick: () => {
        if (item.name) {
          pageService.paramEditorEvent({ name: item.name, event: 'click' });
        }
      }
    } as ButtonProperties
  } as ToolbarItem;
}
