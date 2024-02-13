import { MountConfig, mount } from 'cypress/angular';
import { PageLayoutComponent } from './layout.component';

describe(PageLayoutComponent.name, () => {
  const config: MountConfig<PageLayoutComponent> = {
    declarations: [],
    imports: [],
    providers: []
  }

  it('renders', () => {
     mount(PageLayoutComponent, config);
  })
})
