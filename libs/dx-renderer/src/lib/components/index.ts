import { EnvironmentProviders, inject, makeEnvironmentProviders, provideAppInitializer } from '@angular/core';
import { COLUMNCONFIGURATION_REGISTRY, EDITITEM_REGISTRY, PAGEITEM_REGISTRY, TOOLBARITEMCONFIGURATION_REGISTRY } from '../registries';
import { createButtonToolbarItem, EditLayoutButtonComponent } from './button';
import { EditLayoutStaticButtonGroupComponent } from './buttongroup';
import { createTextColumn, createTextToolbarItem, EditLayoutTextComponent } from './text';
import { EditLayoutTextareaComponent } from './textarea';
import { EditLayoutRichtextComponent } from './richtext';
import { createNumberColumn, createNumberToolbarItem, EditLayoutNumberComponent } from './number';
import { createBoolColumn, createBoolToolbarItem, EditLayoutBoolComponent } from './bool';
import { EditLayoutToggleComponent } from './toggle';
import {
  createDatetimeColumn,
  createDatetimeToolbarItem,
  createDateToolbarItem,
  EditLayoutDatetimeComponent
} from './datetime';
import {
  createLookupColumn,
  createLookupToolbarItem,
  EditLayoutLookupComponent,
} from './lookup';
import {
  createDetailMultilookupColumn,
  createEntityMultilookupColumn,
  createMultilookupToolbarItem,
  EditLayoutMultilookupComponent,
} from './multilookup';
import { EditLayoutTabsComponent, PageLayoutTabsComponent } from './tabs';
import { EditLayoutGroupComponent } from './group';
import { EditLayoutMapComponent, PageLayoutMapComponent } from './map';
import { EditLayoutEntityDataGridComponent, PageLayoutEntityDataGridComponent } from './entitydatagrid';
import { EditLayoutDetailTreeListComponent } from './detailtreelist';
import { EditLayoutDetailDataGridComponent } from './detaildatagrid';
import { EditLayoutCodeComponent } from './code';
import { EditLayoutAttachmentDataGridComponent } from './attachmentdatagrid';
import { EditLayoutStatisticComponent } from './statistic';
import { PageLayoutCrudcontainerComponent } from './crudcontainer';
import { PageLayoutStatisticComponent } from './statistic/page/pagestatistic.component';
import { createDropDownButtonToolbarItem } from './dropdownbutton';
import { createDetailDynamicColumn, createEntityDynamicColumn } from './dynamic';
import { createPopupColumn } from './popup';

export * from './barcodescanner';
export * from './bool';
export * from './button';
export * from './code';
export * from './codemirror';
export * from './datetime';
export * from './lookup';
export * from './multilookup';
export * from './number';
export * from './richtext';
export * from './speechinput';
export * from './text';
export * from './textarea';

export const provideDefaultPageItems = (): EnvironmentProviders => {
  return makeEnvironmentProviders([
    provideAppInitializer(() => {
      const pageItemRegistry = inject(PAGEITEM_REGISTRY);

      pageItemRegistry.registerItemType('tabs', PageLayoutTabsComponent);
      pageItemRegistry.registerItemType('crudcontainer', PageLayoutCrudcontainerComponent);
      pageItemRegistry.registerItemType('grid', PageLayoutEntityDataGridComponent);
      pageItemRegistry.registerItemType('map', PageLayoutMapComponent);
      pageItemRegistry.registerItemType('statistic', PageLayoutStatisticComponent);
    })
  ]);
}


export const provideDefaultEditItems = (): EnvironmentProviders => {
  return makeEnvironmentProviders([
    provideAppInitializer(() => {
      const editItemRegistry = inject(EDITITEM_REGISTRY);

      editItemRegistry.registerItemType('button', EditLayoutButtonComponent);
      editItemRegistry.registerItemType('staticbuttongroup', EditLayoutStaticButtonGroupComponent);
      editItemRegistry.registerItemType('text', EditLayoutTextComponent);
      editItemRegistry.registerItemType('mail', EditLayoutTextComponent);
      editItemRegistry.registerItemType('textarea', EditLayoutTextareaComponent);
      editItemRegistry.registerItemType('richtext', EditLayoutRichtextComponent);
      editItemRegistry.registerItemType('number', EditLayoutNumberComponent);
      editItemRegistry.registerItemType('bool', EditLayoutBoolComponent);
      editItemRegistry.registerItemType('toggle', EditLayoutToggleComponent);
      editItemRegistry.registerItemType('date', EditLayoutDatetimeComponent);
      editItemRegistry.registerItemType('datetime', EditLayoutDatetimeComponent);
      editItemRegistry.registerItemType('lookup', EditLayoutLookupComponent);
      editItemRegistry.registerItemType('staticlookup', EditLayoutLookupComponent);
      editItemRegistry.registerItemType('pickvalue', EditLayoutLookupComponent);
      editItemRegistry.registerItemType('multilookup', EditLayoutMultilookupComponent);
      editItemRegistry.registerItemType('staticmultilookup', EditLayoutMultilookupComponent);
      editItemRegistry.registerItemType('multivalue', EditLayoutMultilookupComponent);
      editItemRegistry.registerItemType('tabs', EditLayoutTabsComponent);
      editItemRegistry.registerItemType('group', EditLayoutGroupComponent);
      editItemRegistry.registerItemType('map', EditLayoutMapComponent);
      editItemRegistry.registerItemType('entitygrid', EditLayoutEntityDataGridComponent);
      editItemRegistry.registerItemType('detailgrid', EditLayoutDetailDataGridComponent);
      editItemRegistry.registerItemType('detailtree', EditLayoutDetailTreeListComponent);
      editItemRegistry.registerItemType('json', EditLayoutCodeComponent);
      editItemRegistry.registerItemType('javascript', EditLayoutCodeComponent);
      editItemRegistry.registerItemType('sql', EditLayoutCodeComponent);
      editItemRegistry.registerItemType('attachements', EditLayoutAttachmentDataGridComponent);
      editItemRegistry.registerItemType('attachments', EditLayoutAttachmentDataGridComponent);
      editItemRegistry.registerItemType('statistic', EditLayoutStatisticComponent);

    })
  ]);
}

export const provideDefaultToolbarItemConfigurations = (): EnvironmentProviders => {
  return makeEnvironmentProviders([
    provideAppInitializer(() => {
      const toolbarItemConfigurationRegistry = inject(TOOLBARITEMCONFIGURATION_REGISTRY);

      toolbarItemConfigurationRegistry.registerToolbarItemConfigurationFactory('lookup', createLookupToolbarItem);
      toolbarItemConfigurationRegistry.registerToolbarItemConfigurationFactory('staticlookup', createLookupToolbarItem);
      toolbarItemConfigurationRegistry.registerToolbarItemConfigurationFactory('multilookup', createMultilookupToolbarItem);
      toolbarItemConfigurationRegistry.registerToolbarItemConfigurationFactory('staticmultilookup', createMultilookupToolbarItem);
      toolbarItemConfigurationRegistry.registerToolbarItemConfigurationFactory('number', createNumberToolbarItem);
      toolbarItemConfigurationRegistry.registerToolbarItemConfigurationFactory('text', createTextToolbarItem);
      toolbarItemConfigurationRegistry.registerToolbarItemConfigurationFactory('bool', createBoolToolbarItem);
      toolbarItemConfigurationRegistry.registerToolbarItemConfigurationFactory('date', createDateToolbarItem);
      toolbarItemConfigurationRegistry.registerToolbarItemConfigurationFactory('datetime', createDatetimeToolbarItem);
      toolbarItemConfigurationRegistry.registerToolbarItemConfigurationFactory('button', createButtonToolbarItem);
      toolbarItemConfigurationRegistry.registerToolbarItemConfigurationFactory('dropdownbutton', createDropDownButtonToolbarItem);
    })
  ]);
}

export const provideDefaultColumnConfigurations = (): EnvironmentProviders => {
  return makeEnvironmentProviders([
    provideAppInitializer(() => {
      const columnConfigurationRegistry = inject(COLUMNCONFIGURATION_REGISTRY);

      columnConfigurationRegistry.registerDetailColumnConfigurationFactory('bool', createBoolColumn);
      columnConfigurationRegistry.registerDetailColumnConfigurationFactory('number', createNumberColumn);
      columnConfigurationRegistry.registerDetailColumnConfigurationFactory('date', createDatetimeColumn);
      columnConfigurationRegistry.registerDetailColumnConfigurationFactory('datetime', createDatetimeColumn);
      columnConfigurationRegistry.registerDetailColumnConfigurationFactory('lookup', createLookupColumn);
      columnConfigurationRegistry.registerDetailColumnConfigurationFactory('pickvalue', createLookupColumn);
      columnConfigurationRegistry.registerDetailColumnConfigurationFactory('staticlookup', createLookupColumn);
      columnConfigurationRegistry.registerDetailColumnConfigurationFactory('multilookup', createDetailMultilookupColumn);
      columnConfigurationRegistry.registerDetailColumnConfigurationFactory('staticmultilookup', createDetailMultilookupColumn);
      columnConfigurationRegistry.registerDetailColumnConfigurationFactory('string', createTextColumn);
      columnConfigurationRegistry.registerDetailColumnConfigurationFactory('text', createTextColumn);
      columnConfigurationRegistry.registerDetailColumnConfigurationFactory('popup', createPopupColumn);
      columnConfigurationRegistry.registerDetailColumnConfigurationFactory('dynamic', createDetailDynamicColumn);

      columnConfigurationRegistry.registerEntityColumnConfigurationFactory('bool', createBoolColumn);
      columnConfigurationRegistry.registerEntityColumnConfigurationFactory('number', createNumberColumn);
      columnConfigurationRegistry.registerEntityColumnConfigurationFactory('date', createDatetimeColumn);
      columnConfigurationRegistry.registerEntityColumnConfigurationFactory('datetime', createDatetimeColumn);
      columnConfigurationRegistry.registerEntityColumnConfigurationFactory('lookup', (c, lookups, lookupParams) => createLookupColumn(c, undefined, lookups, lookupParams));
      columnConfigurationRegistry.registerEntityColumnConfigurationFactory('pickvalue', (c, lookups, lookupParams) => createLookupColumn(c, undefined, lookups, lookupParams));
      columnConfigurationRegistry.registerEntityColumnConfigurationFactory('staticlookup', (c, lookups, lookupParams) => createLookupColumn(c, undefined, lookups, lookupParams));
      columnConfigurationRegistry.registerEntityColumnConfigurationFactory('multilookup', (c, lookups, lookupParams) => createEntityMultilookupColumn(c, undefined, lookups, lookupParams));
      columnConfigurationRegistry.registerEntityColumnConfigurationFactory('staticmultilookup', (c, lookups, lookupParams) => createEntityMultilookupColumn(c, undefined, lookups, lookupParams));
      columnConfigurationRegistry.registerEntityColumnConfigurationFactory('string', createTextColumn);
      columnConfigurationRegistry.registerEntityColumnConfigurationFactory('text', createTextColumn);
      columnConfigurationRegistry.registerEntityColumnConfigurationFactory('dynamic', createEntityDynamicColumn);
    })
  ]);
}
