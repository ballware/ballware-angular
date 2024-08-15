import { Component, Inject } from '@angular/core';
import { LOOKUP_SERVICE, LookupDescriptor, LookupService, LookupStoreDescriptor, PAGE_SERVICE, PageService, ToolbarItemRef } from '@ballware/meta-services';
import { I18NextPipe } from 'angular-i18next';
import { ClickEvent as ButtonClickEvent, InitializedEvent as ButtonInitializedEvent } from 'devextreme/ui/button';
import { InitializedEvent as DateBoxInitializedEvent, ValueChangedEvent as DateBoxValueChangedEvent } from 'devextreme/ui/date_box';
import { ButtonClickEvent as DropDownButtonClickEvent, InitializedEvent as DropDownButtonInitializedEvent, ItemClickEvent as DropDownButtonItemClickEvent } from 'devextreme/ui/drop_down_button';
import { InitializedEvent as SelectBoxInitializedEvent, ValueChangedEvent as SelectBoxValueChangedEvent } from 'devextreme/ui/select_box';
import { InitializedEvent as TagBoxInitializedEvent, ValueChangedEvent as TagBoxValueChangedEvent } from 'devextreme/ui/tag_box';
import { combineLatest, takeUntil } from 'rxjs';
import { createLookupDataSource } from '../../utils/datasource';
import { WithDestroy } from '../../utils/withdestroy';

@Component({
  selector: 'ballware-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent extends WithDestroy() {

  public toolbarItems: Array<{ 
    location: string,
    locateInMenu: string,
    widget?: string,
    text?: string,
    options?: Record<string, unknown>
  }> = [];

  constructor(
    @Inject(LOOKUP_SERVICE) private lookupService: LookupService, 
    @Inject(PAGE_SERVICE) private pageService: PageService, 
    private translationService: I18NextPipe) {
    super();

    combineLatest([this.pageService.layout$, this.lookupService.lookups$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([layout, lookups]) => {
        this.toolbarItems = [];

        const createLookup = (identifier: string|undefined) => {
          const myLookup = identifier && lookups ? (lookups[identifier] as LookupDescriptor) : undefined;

          return myLookup;          
        }

        const createDataSource = (lookup: LookupDescriptor|undefined) => {

          if (lookup) {
            return createLookupDataSource(
                () => (lookup.store as LookupStoreDescriptor).listFunc(),
                (id) => (lookup.store as LookupStoreDescriptor).byIdFunc(id)
              );
          }

          return undefined;
        }

        layout?.toolbaritems?.forEach(toolbarItem => {
          switch (toolbarItem.type) {
            case 'lookup': {
                const lookup = createLookup(toolbarItem.lookup);
                const dataSource = createDataSource(lookup);

                this.toolbarItems.push({
                  location: "before",
                  locateInMenu: "auto",
                  widget: 'dxSelectBox',
                  options: {
                    label: toolbarItem.caption ?? '',
                    width: toolbarItem.width ?? '400px',                  
                    dataSource: dataSource,
                    searchEnabled: true,
                    showClearButton: true,
                    showDropDownButton: true,
                    displayExpr: lookup?.displayMember,
                    valueExpr: lookup?.valueMember ?? '',                  
                    onInitialized: (e: SelectBoxInitializedEvent) => {
                      if (toolbarItem.name) {
                        const toolbarItemRef = {
                          getOption: (option) => e.component?.option(option),
                          setOption: (option, value) => e.component?.option(option, value)
                        } as ToolbarItemRef;                    

                        this.pageService.paramEditorInitialized({ name: toolbarItem.name, item: toolbarItemRef });
                      }                    
                    },
                    onValueChanged: (e: SelectBoxValueChangedEvent) => {
                      if (toolbarItem.name) {
                        this.pageService.paramEditorValueChanged({ name: toolbarItem.name, value: e.value });
                      }
                    }
                  }
                });
              }
              break;
            case 'staticlookup':
              this.toolbarItems.push({
                location: "before",
                locateInMenu: "auto",
                widget: 'dxSelectBox',
                options: {
                  label: toolbarItem.caption ?? '',
                  width: toolbarItem.width ?? 'auto',
                  searchEnabled: true,
                  showClearButton: true,                  
                  showDropDownButton: true,
                  dataSource: toolbarItem.options['items'] as any[],
                  displayExpr: toolbarItem.options['displayExpr'] ?? 'text',
                  valueExpr: toolbarItem.options['valueExpr'] ?? 'value',
                  onInitialized: (e: SelectBoxInitializedEvent) => {
                    if (toolbarItem.name) {
                      const toolbarItemRef = {
                        getOption: (option) => e.component?.option(option),
                        setOption: (option, value) => e.component?.option(option, value)
                      } as ToolbarItemRef;                    

                      this.pageService.paramEditorInitialized({ name: toolbarItem.name, item: toolbarItemRef });
                    }                    
                  },
                  onValueChanged: (e: SelectBoxValueChangedEvent) => {
                    if (toolbarItem.name) {
                      this.pageService.paramEditorValueChanged({ name: toolbarItem.name, value: e.value });
                    }
                  }
                }
              });
              break;              
            case 'multilookup': {
                const lookup = createLookup(toolbarItem.lookup);
                const dataSource = createDataSource(lookup);

                this.toolbarItems.push({
                  location: "before",
                  locateInMenu: "auto",
                  widget: 'dxTagBox',
                  options: {
                    label: toolbarItem.caption ?? '',
                    width: toolbarItem.width ?? '400px',                  
                    dataSource: dataSource,
                    searchEnabled: true,
                    showClearButton: true,
                    showDropDownButton: true,
                    showSelectionControls: true,
                    multiline: false,
                    maxDisplayedTags: 3,
                    displayExpr: lookup?.displayMember,
                    valueExpr: lookup?.valueMember ?? '',   
                    onInitialized: (e: TagBoxInitializedEvent) => {
                      if (toolbarItem.name) {
                        const toolbarItemRef = {
                          getOption: (option) => e.component?.option(option),
                          setOption: (option, value) => e.component?.option(option, value)
                        } as ToolbarItemRef;                    
  
                        this.pageService.paramEditorInitialized({ name: toolbarItem.name, item: toolbarItemRef });
                      }                    
                    },
                    onValueChanged: (e: TagBoxValueChangedEvent) => {
                      if (toolbarItem.name) {
                        this.pageService.paramEditorValueChanged({ name: toolbarItem.name, value: e.value });
                      }
                    }
                  }
                });
              }              
              break;              
            case 'datetime':
              this.toolbarItems.push({
                location: "before",
                locateInMenu: "auto",
                widget: 'dxDateBox',
                options: {
                  label: toolbarItem.caption ?? '',
                  width: toolbarItem.width ?? '220px',
                  type: "datetime",
                  displayFormat: this.translationService.transform('format.datetime'),
                  hint: toolbarItem.caption,
                  onInitialized: (e: DateBoxInitializedEvent) => {
                    if (toolbarItem.name) {
                      const toolbarItemRef = {
                        getOption: (option) => e.component?.option(option),
                        setOption: (option, value) => e.component?.option(option, value)
                      } as ToolbarItemRef;                    

                      this.pageService.paramEditorInitialized({ name: toolbarItem.name, item: toolbarItemRef });
                    }                    
                  },
                  onValueChanged: (e: DateBoxValueChangedEvent) => {
                    if (toolbarItem.name) {
                      this.pageService.paramEditorValueChanged({ name: toolbarItem.name, value: e.value });
                    }
                  }
                }
              });
              break;
            case 'dropdownbutton':
              this.toolbarItems.push({
                location: "before",
                locateInMenu: "auto",
                widget: 'dxDropDownButton',
                options: {
                  width: toolbarItem.width ?? '180px',
                  text: toolbarItem.caption ?? '', 
                  keyExpr: "id",
                  displayExpr: "text",
                  splitButton: true,
                  dataSource: toolbarItem.options['items'] as any[],
                  onInitialized: (e: DropDownButtonInitializedEvent) => {
                    if (toolbarItem.name) {
                      const toolbarItemRef = {
                        getOption: (option) => e.component?.option(option),
                        setOption: (option, value) => e.component?.option(option, value)
                      } as ToolbarItemRef;                    

                      this.pageService.paramEditorInitialized({ name: toolbarItem.name, item: toolbarItemRef });
                    }                    
                  },    
                  onButtonClick: (e: DropDownButtonClickEvent) => {
                    if (toolbarItem.name) {
                      this.pageService.paramEditorEvent({ name: toolbarItem.name, event: 'click', param: undefined });
                    }
                  },             
                  onItemClick: (e: DropDownButtonItemClickEvent) => {
                    if (toolbarItem.name) {
                      this.pageService.paramEditorEvent({ name: toolbarItem.name, event: 'click', param: e.itemData['id'] });
                    }
                  }
                }
              });
              break;            
            case 'button':
              this.toolbarItems.push({
                location: "before",
                locateInMenu: "auto",
                widget: 'dxButton',
                options: {
                  width: toolbarItem.width ?? 'auto',
                  text: toolbarItem.caption ?? '',                   
                  onInitialized: (e: ButtonInitializedEvent) => {
                    if (toolbarItem.name) {
                      const toolbarItemRef = {
                        getOption: (option) => e.component?.option(option),
                        setOption: (option, value) => e.component?.option(option, value)
                      } as ToolbarItemRef;                    

                      this.pageService.paramEditorInitialized({ name: toolbarItem.name, item: toolbarItemRef });
                    }                    
                  },
                  onClick: (e: ButtonClickEvent) => {
                    if (toolbarItem.name) {
                      this.pageService.paramEditorEvent({ name: toolbarItem.name, event: 'click' });
                    }
                  }
                }
              });
              break;                
          }
        });
      });
  }
}
