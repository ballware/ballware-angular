import { EnvironmentProviders, inject, makeEnvironmentProviders, provideAppInitializer } from '@angular/core';
import { EDITITEM_REGISTRY, PAGEITEM_REGISTRY } from '../registries';
import { EditLayoutButtonComponent } from './button';
import { EditLayoutStaticButtonGroupComponent } from './buttongroup';
import { createTextColumn, EditLayoutTextComponent } from './text';
import { EditLayoutTextareaComponent } from './textarea';
import { EditLayoutRichtextComponent } from './richtext';
import { createNumberColumn, EditLayoutNumberComponent } from './number';
import { createBoolColumn, EditLayoutBoolComponent } from './bool';
import { EditLayoutToggleComponent } from './toggle';
import { createDatetimeColumn, EditLayoutDatetimeComponent } from './datetime';
import { createLookupColumn, EditLayoutLookupComponent } from './lookup';
import { createMultilookupColumn, EditLayoutMultilookupComponent } from './multilookup';
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
import { COLUMNCONFIGURATION_REGISTRY } from '../registries/column.registry';

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

export const provideDefaultColumnConfigurations = (): EnvironmentProviders => {
  return makeEnvironmentProviders([
    provideAppInitializer(() => {
      const columnConfigurationRegistry = inject(COLUMNCONFIGURATION_REGISTRY);

      columnConfigurationRegistry.registerColumnConfigurationFactory('bool', createBoolColumn);
      columnConfigurationRegistry.registerColumnConfigurationFactory('number', createNumberColumn);
      columnConfigurationRegistry.registerColumnConfigurationFactory('date', createDatetimeColumn);
      columnConfigurationRegistry.registerColumnConfigurationFactory('datetime', createDatetimeColumn);
      columnConfigurationRegistry.registerColumnConfigurationFactory('lookup', createLookupColumn);
      columnConfigurationRegistry.registerColumnConfigurationFactory('pickvalue', createLookupColumn);
      columnConfigurationRegistry.registerColumnConfigurationFactory('staticlookup', createLookupColumn);
      columnConfigurationRegistry.registerColumnConfigurationFactory('multilookup', createMultilookupColumn);
      columnConfigurationRegistry.registerColumnConfigurationFactory('staticmultilookup', createMultilookupColumn);
      columnConfigurationRegistry.registerColumnConfigurationFactory('text', createTextColumn);


      /*
case 'dynamic':
case 'popup':
       */
    })
  ]);
}
