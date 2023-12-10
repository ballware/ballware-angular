import { MountConfig, mount } from 'cypress/angular';
import { CrudActionsComponent } from './actions.component';

describe(CrudActionsComponent.name, () => {
  const config: MountConfig<CrudActionsComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(CrudActionsComponent, {
           ...config,
           componentProperties: {
               defaultEditLayoutIdentifier:  '',
          }
       });
  })
})
