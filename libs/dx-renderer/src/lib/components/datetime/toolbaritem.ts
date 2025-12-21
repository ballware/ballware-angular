import { PageToolbarItem } from '@ballware/meta-model';
import { Item as ToolbarItem, LocateInMenuMode, ToolbarItemLocation } from 'devextreme/ui/toolbar';
import {
  PAGE_SERVICE,
  ToolbarItemRef, TRANSLATOR
} from '@ballware/meta-services';
import {
  InitializedEvent as DateBoxInitializedEvent, Properties as DateBoxProperties,
  ValueChangedEvent as DateBoxValueChangedEvent
} from 'devextreme/ui/date_box';
import { inject } from '@angular/core';

export const createDateToolbarItem = (
  item: PageToolbarItem,
  location: ToolbarItemLocation,
  locateInMenu: LocateInMenuMode
) => {

  const t = inject(TRANSLATOR);
  const pageService = inject(PAGE_SERVICE);

  const onItemInitialized = (e: DateBoxInitializedEvent, name: string) => {
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
    widget: 'dxDateBox',
    options: {
      label: item.caption ?? '',
      width: item.width ?? '220px',
      type: "date",
      displayFormat: t('format.date'),
      hint: item.caption,
      onInitialized: (e) => onItemInitialized(e, item.name),
      onValueChanged: (e: DateBoxValueChangedEvent) => {
        if (item.name) {
          pageService.paramEditorValueChanged({ name: item.name, value: e.value });
        }
      }
    } as DateBoxProperties
  } as ToolbarItem;
}


export const createDatetimeToolbarItem = (
  item: PageToolbarItem,
  location: ToolbarItemLocation,
  locateInMenu: LocateInMenuMode
) => {

  const t = inject(TRANSLATOR);
  const pageService = inject(PAGE_SERVICE);

  const onItemInitialized = (e: DateBoxInitializedEvent, name: string) => {
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
    widget: 'dxDateBox',
    options: {
      label: item.caption ?? '',
      width: item.width ?? '220px',
      type: "datetime",
      displayFormat: t('format.datetime'),
      hint: item.caption,
      onInitialized: (e) => onItemInitialized(e, item.name),
      onValueChanged: (e: DateBoxValueChangedEvent) => {
        if (item.name) {
          pageService.paramEditorValueChanged({ name: item.name, value: e.value });
        }
      }
    } as DateBoxProperties
  } as ToolbarItem;
}
