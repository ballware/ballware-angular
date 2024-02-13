import { MountConfig, mount } from 'cypress/angular';
import { PageLayoutEntitygridComponent } from './entitygrid.component';

describe(PageLayoutEntitygridComponent.name, () => {
  const config: MountConfig<PageLayoutEntitygridComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(PageLayoutEntitygridComponent, config);
  })
})
