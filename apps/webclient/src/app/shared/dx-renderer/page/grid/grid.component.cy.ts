import { MountConfig, mount } from 'cypress/angular';
import { PageLayoutGridComponent } from './grid.component';

describe(PageLayoutGridComponent.name, () => {
  const config: MountConfig<PageLayoutGridComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(PageLayoutGridComponent, config);
  })
})
