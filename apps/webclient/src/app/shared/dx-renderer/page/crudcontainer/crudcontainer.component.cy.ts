import { MountConfig, mount } from 'cypress/angular';
import { PageLayoutCrudcontainerComponent } from './crudcontainer.component';

describe(PageLayoutCrudcontainerComponent.name, () => {
  const config: MountConfig<PageLayoutCrudcontainerComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(PageLayoutCrudcontainerComponent, config);
  })
})
