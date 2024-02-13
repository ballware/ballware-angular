import { MountConfig, mount } from 'cypress/angular';
import { PageLayoutMapComponent } from './map.component';

describe(PageLayoutMapComponent.name, () => {
  const config: MountConfig<PageLayoutMapComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(PageLayoutMapComponent, config);
  })
})
