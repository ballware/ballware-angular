import { MountConfig, mount } from 'cypress/angular';
import { CrudDialogComponent } from './dialog.component';

describe(CrudDialogComponent.name, () => {
  const config: MountConfig<CrudDialogComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(CrudDialogComponent, {
           ...config,
           componentProperties: {
               title:  '',
          }
       });
  })
})
