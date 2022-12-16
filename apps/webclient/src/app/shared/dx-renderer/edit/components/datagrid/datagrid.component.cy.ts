import { MountConfig, mount } from 'cypress/angular';
import { DatagridComponent } from './datagrid.component';

describe(DatagridComponent.name, () => {
  const config: MountConfig<DatagridComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(DatagridComponent, {
           ...config,
           componentProperties: {
               identifier:  '',
               height:  '',
               exportFileName:  '',
               showReload:  false,
               showAdd:  false,
               showPrint:  false,
               showExport:  false,
               showImport:  false,
          }
       });
  })
})
